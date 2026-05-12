CVYAZ PayTR + Temiz PDF İndirme Sistemi

1) Kurulum
   npm install

2) .env.example dosyasını kopyala:
   Windows CMD:
   copy .env.example .env

3) .env içini doldur:
   PAYTR_MERCHANT_ID
   PAYTR_MERCHANT_KEY
   PAYTR_MERCHANT_SALT
   BASE_URL

4) Lokal çalıştır:
   npm start

5) Tarayıcı:
   http://localhost:3000

6) PayTR panelinde Bildirim URL / Callback URL:
   https://senin-domainin.com/api/paytr/callback

Önemli:
- PayTR callback için canlı HTTPS domain gerekir.
- Lokal test için ngrok/cloudflared kullanılabilir.
- TEST_MODE=1 test içindir. Canlıda 0 yapılır.
- Temiz PDF sadece PayTR callback status=success geldikten sonra indirilebilir.