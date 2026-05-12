require("dotenv").config();

const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = Number(process.env.PORT || 3000);
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || "";
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || "";
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || "";

const TEST_MODE = process.env.PAYTR_TEST_MODE || "1";
const DEBUG_ON = process.env.PAYTR_DEBUG_ON || "1";

const PRICE_TL = Number(process.env.PRODUCT_PRICE_TL || "59.99");
const PAYMENT_AMOUNT = String(Math.round(PRICE_TL * 100));

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const ORDERS_DIR = path.join(ROOT, "orders");
const PDFS_DIR = path.join(ROOT, "pdfs");

fs.mkdirSync(ORDERS_DIR, { recursive: true });
fs.mkdirSync(PDFS_DIR, { recursive: true });

app.use(express.json({ limit: "35mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(PUBLIC_DIR));

function nowIso() {
  return new Date().toISOString();
}

function cleanEmail(email) {
  const value = String(email || "").trim();
  if (!value || !value.includes("@")) return "musteri@example.com";
  return value.slice(0, 120);
}

function cleanPhone(phone) {
  return String(phone || "").replace(/[^\d]/g, "").slice(-10) || "5551112233";
}

function cleanName(name) {
  return String(name || "CVYAZ Müşteri").trim().slice(0, 80) || "CVYAZ Müşteri";
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  const ip = req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "127.0.0.1";
  return ip.replace("::ffff:", "");
}

function hmacSha256Base64(data, key) {
  return crypto.createHmac("sha256", key).update(data).digest("base64");
}

function readOrder(merchantOid) {
  const file = path.join(ORDERS_DIR, `${merchantOid}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeOrder(order) {
  const file = path.join(ORDERS_DIR, `${order.merchant_oid}.json`);
  fs.writeFileSync(file, JSON.stringify(order, null, 2), "utf8");
}

function makeDownloadToken(merchantOid) {
  return crypto
    .createHmac("sha256", process.env.DOWNLOAD_SECRET || MERCHANT_KEY || "dev-secret")
    .update(merchantOid)
    .digest("hex");
}

function verifyDownloadToken(merchantOid, token) {
  const expected = makeDownloadToken(merchantOid);
  const a = Buffer.from(String(expected));
  const b = Buffer.from(String(token || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function requestPaytrToken({
  merchant_oid,
  user_ip,
  email,
  payment_amount,
  user_basket,
  buyerName,
  buyerPhone
}) {
  const no_installment = "1";
  const max_installment = "0";
  const currency = "TL";

  const hashStr =
    MERCHANT_ID +
    user_ip +
    merchant_oid +
    email +
    payment_amount +
    user_basket +
    no_installment +
    max_installment +
    currency +
    TEST_MODE;

  const paytr_token = hmacSha256Base64(hashStr + MERCHANT_SALT, MERCHANT_KEY);

  const params = new URLSearchParams();
  params.append("merchant_id", MERCHANT_ID);
  params.append("user_ip", user_ip);
  params.append("merchant_oid", merchant_oid);
  params.append("email", email);
  params.append("payment_amount", payment_amount);
  params.append("paytr_token", paytr_token);
  params.append("user_basket", user_basket);
  params.append("debug_on", DEBUG_ON);
  params.append("no_installment", no_installment);
  params.append("max_installment", max_installment);
  params.append("user_name", buyerName);
  params.append("user_address", "Online CV PDF");
  params.append("user_phone", buyerPhone);
  params.append("merchant_ok_url", `${BASE_URL}/success.html?oid=${encodeURIComponent(merchant_oid)}`);
  params.append("merchant_fail_url", `${BASE_URL}/fail.html?oid=${encodeURIComponent(merchant_oid)}`);
  params.append("timeout_limit", "30");
  params.append("currency", currency);
  params.append("test_mode", TEST_MODE);
  params.append("lang", "tr");
  params.append("iframe_v2", "1");

  const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  const text = await response.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`PayTR cevap JSON değil: ${text.slice(0, 200)}`);
  }

  if (!json || json.status !== "success" || !json.token) {
    throw new Error(`PayTR token alınamadı: ${text.slice(0, 500)}`);
  }

  return json.token;
}

app.post("/api/paytr/create-order", async (req, res) => {
  try {
    if (!MERCHANT_ID || !MERCHANT_KEY || !MERCHANT_SALT) {
      return res.status(500).json({
        ok: false,
        error: "PayTR bilgileri eksik. .env dosyasını doldur."
      });
    }

    const pdfBase64 = String(req.body.pdfBase64 || "");
    if (!pdfBase64 || pdfBase64.length < 1000) {
      return res.status(400).json({ ok: false, error: "Temiz PDF oluşturulamadı." });
    }

    const buyerName = cleanName(req.body.buyerName);
    const email = cleanEmail(req.body.buyerEmail);
    const buyerPhone = cleanPhone(req.body.buyerPhone);

    const merchant_oid = `CVYAZ${Date.now()}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const pdfPath = path.join(PDFS_DIR, `${merchant_oid}.pdf`);

    fs.writeFileSync(pdfPath, Buffer.from(pdfBase64, "base64"));

    const user_basket = Buffer.from(JSON.stringify([
      ["CVYAZ Temiz PDF", PRICE_TL.toFixed(2), 1]
    ])).toString("base64");

    const user_ip = getClientIp(req);

    const order = {
      merchant_oid,
      status: "pending",
      created_at: nowIso(),
      updated_at: nowIso(),
      email,
      buyerName,
      buyerPhone,
      payment_amount: PAYMENT_AMOUNT,
      price_tl: PRICE_TL,
      pdf_file: `${merchant_oid}.pdf`,
      download_token: makeDownloadToken(merchant_oid)
    };

    writeOrder(order);

    const token = await requestPaytrToken({
      merchant_oid,
      user_ip,
      email,
      payment_amount: PAYMENT_AMOUNT,
      user_basket,
      buyerName,
      buyerPhone
    });

    order.paytr_token_created_at = nowIso();
    writeOrder(order);

    res.json({ ok: true, token, merchant_oid });

  } catch (error) {
    console.error("[CREATE ORDER ERROR]", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Sipariş oluşturulamadı."
    });
  }
});

app.post("/api/paytr/callback", (req, res) => {
  try {
    const merchant_oid = String(req.body.merchant_oid || "");
    const status = String(req.body.status || "");
    const total_amount = String(req.body.total_amount || "");
    const receivedHash = String(req.body.hash || "");

    const expectedHash = hmacSha256Base64(merchant_oid + MERCHANT_SALT + status + total_amount, MERCHANT_KEY);

    const a = Buffer.from(expectedHash);
    const b = Buffer.from(receivedHash);

    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      console.error("[PAYTR CALLBACK] Hash doğrulanamadı", { merchant_oid, status });
      return res.status(400).send("BAD HASH");
    }

    const order = readOrder(merchant_oid);
    if (!order) return res.status(404).send("ORDER NOT FOUND");

    if (order.status === "paid") return res.send("OK");

    if (status === "success") {
      order.status = "paid";
      order.paid_at = nowIso();
      order.total_amount = total_amount;
    } else {
      order.status = "failed";
      order.failed_at = nowIso();
      order.failed_reason_code = req.body.failed_reason_code || "";
      order.failed_reason_msg = req.body.failed_reason_msg || "";
    }

    order.updated_at = nowIso();
    writeOrder(order);

    return res.send("OK");

  } catch (error) {
    console.error("[PAYTR CALLBACK ERROR]", error);
    return res.status(500).send("ERROR");
  }
});

app.get("/api/order/:merchant_oid", (req, res) => {
  const order = readOrder(req.params.merchant_oid);

  if (!order) {
    return res.status(404).json({ ok: false, error: "Sipariş bulunamadı." });
  }

  res.json({
    ok: true,
    merchant_oid: order.merchant_oid,
    status: order.status,
    created_at: order.created_at,
    paid_at: order.paid_at || null,
    download_url: order.status === "paid"
      ? `/api/download/${encodeURIComponent(order.merchant_oid)}?token=${encodeURIComponent(order.download_token)}`
      : null
  });
});

app.get("/api/download/:merchant_oid", (req, res) => {
  const order = readOrder(req.params.merchant_oid);

  if (!order) return res.status(404).send("Sipariş bulunamadı.");
  if (order.status !== "paid") return res.status(403).send("Ödeme onayı bekleniyor.");
  if (!verifyDownloadToken(order.merchant_oid, req.query.token)) {
    return res.status(403).send("İndirme yetkisi geçersiz.");
  }

  const pdfPath = path.join(PDFS_DIR, order.pdf_file);
  if (!fs.existsSync(pdfPath)) return res.status(404).send("PDF bulunamadı.");

  res.download(pdfPath, "cvyaz-temiz-cv.pdf");
});

app.listen(PORT, () => {
  console.log(`[CVYAZ] Server started: http://localhost:${PORT}`);
  console.log(`[CVYAZ] BASE_URL=${BASE_URL}`);
  console.log(`[CVYAZ] TEST_MODE=${TEST_MODE}`);
});