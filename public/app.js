(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "wq1qho02vx");

function limitYearInput(el) {

  if (!el) {
    return;
  }

  el.value = el.value.replace(/[^0-9]/g, "").slice(0, 4);

}


document.addEventListener("DOMContentLoaded", function() {

  const birth = document.getElementById("birth");

  if (!birth) {
    return;
  }

  birth.addEventListener("input", function() {

    if (birth.type === "date" && birth.value) {

      const parts = birth.value.split("-");

      if (parts[0] && parts[0].length > 4) {

        parts[0] = parts[0].slice(0, 4);

        birth.value = parts.join("-");

      }

    }

  });

});


document.addEventListener("DOMContentLoaded", function() {

  const militaryUntil = document.getElementById("militaryUntil");

  if (!militaryUntil) {
    return;
  }

  militaryUntil.addEventListener("input", function() {

    if (militaryUntil.value) {

      const parts = militaryUntil.value.split("-");

      if (parts[0] && parts[0].length > 4) {

        parts[0] = parts[0].slice(0, 4);

        militaryUntil.value = parts.join("-");

      }

    }

  });

});


function limitMonthYearInput(el) {

  if (!el || !el.value) {
    return;
  }

  const parts = el.value.split("-");

  if (parts[0] && parts[0].length > 4) {
    parts[0] = parts[0].slice(0, 4);
    el.value = parts.join("-");
  }

}

document.addEventListener("DOMContentLoaded", function() {

  document.querySelectorAll(".edu-start, .edu-end, .exp-start, .exp-end, .cert-date, .project-date").forEach(function(field) {

    field.addEventListener("input", function() {
      limitMonthYearInput(field);
    });

  });

});


document.addEventListener("input", function(event) {

  if (event.target.matches("input, textarea, select")) {
    update();
  }

});

document.addEventListener("change", function(event) {

  if (event.target.matches("input, textarea, select")) {
    update();
  }

});


/* FINAL OVERRIDE: smart page breaks */
function applySmartPageBreaks(root) {

  const pageHeight = 1123;
  const safeBottom = 70;

  const sections = Array.from(root.querySelectorAll(".sec"))
    .filter(function(section) {
      return section.id !== "secDocs" && section.style.display !== "none" && section.offsetHeight > 0;
    });

  sections.forEach(function(section) {

    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const positionInPage = sectionTop % pageHeight;
    const availableSpace = pageHeight - positionInPage - safeBottom;

    if (sectionHeight > availableSpace && sectionHeight < pageHeight - 120) {

      const spacerHeight = pageHeight - positionInPage + 24;

      if (spacerHeight < 80) {
        return;
      }

      const spacer = document.createElement("div");
      spacer.className = "pdf-page-spacer";
      spacer.style.height = spacerHeight + "px";

      section.parentNode.insertBefore(spacer, section);

    }

  });

  const docs = root.querySelector("#secDocs");

  if (docs && docs.style.display !== "none" && docs.offsetHeight > 0) {

    const top = docs.offsetTop;
    const pos = top % pageHeight;

    if (pos > 40) {
      const spacer = document.createElement("div");
      spacer.className = "pdf-page-spacer";
      spacer.style.height = (pageHeight - pos) + "px";
      docs.parentNode.insertBefore(spacer, docs);
    }

  }

}

/* =====================================================
   SETTINGS
===================================================== */

const PAYMENT_URL = "https://cvyaz.myshopify.com";

const $ = function(id) {
  return document.getElementById(id);
};

let docs = [];

/* =====================================================
   BASIC HELPERS
===================================================== */

function toggleAcc(button) {
  button.parentElement.classList.toggle("open");
}

function setTemplate(templateName, element) {

  const cvPaper = $("cv");

  cvPaper.classList.add("template-flash");

  setTimeout(function() {
    cvPaper.classList.remove("template-flash");
  }, 180);

  $("cv").className = "cv " + templateName;

  document.querySelectorAll(".tab").forEach(function(button) {
    button.classList.remove("active");
  });

  if (element) {
    element.classList.add("active");
  }

  update();

}

function val(id) {
  return $(id).value.trim();
}

function show(id, yes) {
  $(id).style.display = yes ? "block" : "none";
}

function esc(text) {

  return String(text).replace(/[&<>"']/g, function(match) {

    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[match];

  });

}


/* =====================================================
   AUTO UPDATE EVENTS
===================================================== */

document.querySelectorAll("input, textarea, select").forEach(function(element) {

  element.addEventListener("input", update);

});

/* =====================================================
   PHOTO UPLOAD
===================================================== */


function unlockPreviewCta() {

  const previewButton = document.querySelector(".download");

  if (!previewButton) {
    return;
  }

  previewButton.classList.remove("preview-locked");
  document.body.classList.add("cvyaz-show-preview-cta");

  try {
    localStorage.setItem("cvyaz_preview_cta_unlocked_v71", "1");
  } catch (error) {
    // storage kapalıysa sessiz geç.
  }

}

function lockPreviewCta() {

  const previewButton = document.querySelector(".download");

  if (!previewButton) {
    return;
  }

  previewButton.classList.add("preview-locked");
  document.body.classList.remove("cvyaz-show-preview-cta");

  try {
    localStorage.removeItem("cvyaz_preview_cta_unlocked_v71");
  } catch (error) {
    // storage kapalıysa sessiz geç.
  }

}

document.querySelectorAll(".file-label").forEach(function(label) {

  /*
    Mobil tek dokunuş düzeltmesi:
    Önceden touchstart/click anında preview CTA açılıyordu.
    Mobil tarayıcıda bu reflow bazen file picker'ı iptal ediyor ve
    fotoğraf seçici ancak 2. basışta açılıyordu.
    Çözüm: dosya seçici doğal şekilde açılsın; CTA hemen ardından açılsın.
  */
  label.addEventListener("click", function() {
    setTimeout(unlockPreviewCta, 250);
  }, false);

});

function handlePhotoFile(file) {

  unlockPreviewCta();

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function() {

    $("pPhoto").src = reader.result;
    $("photoFrame").style.display = "block";
    update();
    if (typeof cvyazSaveDraft === "function") {
      cvyazSaveDraft();
    }

  };

  reader.readAsDataURL(file);

}

$("photoInput").addEventListener("change", function(event) {

  handlePhotoFile(event.target.files[0]);

});

function removePhoto() {

  $("pPhoto").removeAttribute("src");
  $("photoFrame").style.display = "none";
  $("photoInput").value = "";
  update();
  if (typeof cvyazSaveDraft === "function") {
    cvyazSaveDraft();
  }

}

/* =====================================================
   DOCUMENT UPLOAD
===================================================== */

$("docInput").addEventListener("change", function(event) {

  docs = Array.from(event.target.files).slice(0, 5);

  renderDocuments();

  update();

});

/* =====================================================
   MAIN UPDATE
===================================================== */

function update() {

  toggleMilitaryDate();

  updatePersonalInfo();

  renderEducation();

  renderExperience();

  renderSkills();

  renderLanguages();

  renderCertificates();

  renderProjects();

  renderReferences();

  renderDocuments();

  updateAtsScore();

  updateProgressCard();

}

/* =====================================================
   PERSONAL INFO RENDER
===================================================== */


function formatDate(value) {

  if (!value) {
    return "";
  }

  const parts = value.split("-");

  if (parts.length !== 3) {
    return value;
  }

  return parts[2] + "." + parts[1] + "." + parts[0];

}

function formatMonth(value) {

  if (!value) {
    return "";
  }

  const parts = value.split("-");

  if (parts.length !== 2) {
    return value;
  }

  return parts[1] + "." + parts[0];

}

function toggleMilitaryDate() {

  const field = $("militaryUntil");

  if (!field) {
    return;
  }

  if (val("military") === "Tecilli") {
    field.style.display = "block";
  } else {
    field.style.display = "none";
    field.value = "";
  }

}

function updatePersonalInfo() {

  $("pName").innerText = val("name") || "Ad Soyad";

  $("pJob").innerText = val("job") || "Meslek / Pozisyon";

  const contactItems = [];

  if (val("phone")) {
    contactItems.push('<span class="info-row"><span class="info-label">Telefon:</span><span class="info-value">' + esc(val("phone")) + '</span></span>');
  }

  if (val("email")) {
    contactItems.push('<span class="info-row"><span class="info-label">E-posta:</span><span class="info-value">' + esc(val("email")) + '</span></span>');
  }

  $("pContact").innerHTML = contactItems.join("");

  const addressLine = [
    val("address"),
    val("district"),
    val("city"),
    val("country")
  ].filter(Boolean).join(" / ");

  $("pAddress").innerHTML = addressLine
    ? '<span class="info-row"><span class="info-label">Adres:</span><span class="info-value">' + esc(addressLine) + '</span></span>'
    : "";

  $("pDigital").innerHTML = "";

  const militaryText =
    val("military") === "Tecilli" && val("militaryUntil")
      ? "Tecilli: " + formatMonth(val("militaryUntil"))
      : val("military");

  const extraItems = [];

  if (val("birth")) {
    extraItems.push('<span class="info-row"><span class="info-label">Doğum Tarihi:</span><span class="info-value">' + esc(formatDate(val("birth"))) + '</span></span>');
  }

  if (val("marital")) {
    extraItems.push('<span class="info-row"><span class="info-label">Medeni Durum:</span><span class="info-value">' + esc(val("marital")) + '</span></span>');
  }

  if (militaryText) {
    extraItems.push('<span class="info-row"><span class="info-label">Askerlik:</span><span class="info-value">' + esc(militaryText) + '</span></span>');
  }

  if (val("driving")) {
    extraItems.push('<span class="info-row"><span class="info-label">Ehliyet:</span><span class="info-value">' + esc(val("driving")) + '</span></span>');
  }

  $("pExtra").innerHTML = extraItems.join("");

  $("pAbout").innerText = val("about");

  show("secAbout", !!val("about"));

}

/* =====================================================
   ADD EDUCATION
===================================================== */

function addEdu() {

  const box = document.createElement("div");

  box.className = "item edu";

  box.innerHTML = `
    <select class="edu-type">
      <option value="">Eğitim Türü</option>
      <option>Ortaokul</option>
      <option>Lise</option>
      <option>Üniversite</option>
      <option>Yüksek Lisans</option>
      <option>Doktora</option>
      <option>Kurs / Eğitim Programı</option>
    </select>

    <input class="edu-school" placeholder="Okul / Kurum">

    <input class="edu-dept" placeholder="Bölüm / Alan">

    <input class="edu-start"
type="text"
placeholder="Başlangıç Tarihi"
inputmode="numeric"
maxlength="7"
onfocus="this.type='month'; this.max='9999-12';"
oninput="limitMonthYearInput(this)"
onblur="if(!this.value)this.type='text'">

    <input class="edu-end"
type="text"
placeholder="Bitiş / Mezuniyet Tarihi"
inputmode="numeric"
maxlength="7"
onfocus="this.type='month'; this.max='9999-12';"
oninput="limitMonthYearInput(this)"
onblur="if(!this.value)this.type='text'">

    <input class="edu-gpa" placeholder="Not Ortalaması">

    <textarea class="edu-desc" placeholder="Açıklama"></textarea>

    <button type="button" class="mini-btn remove" onclick="this.parentElement.remove(); update();">
      Sil
    </button>
  `;

  $("eduList").appendChild(box);

  bindInputs(box);

}

/* =====================================================
   ADD EXPERIENCE
===================================================== */

function addExp() {

  const box = document.createElement("div");

  box.className = "item exp";

  box.innerHTML = `
    <input class="exp-company" placeholder="Şirket">

    <input class="exp-role" placeholder="Pozisyon">

    <select class="exp-type">
      <option value="">Çalışma Türü</option>
      <option>Tam Zamanlı</option>
      <option>Yarı Zamanlı</option>
      <option>Freelance</option>
      <option>Staj</option>
      <option>Uzaktan</option>
      <option>Hibrit</option>
    </select>

    <input class="exp-loc" placeholder="Şehir / Ülke">

    <input class="exp-start"
type="text"
placeholder="Başlangıç Tarihi"
inputmode="numeric"
maxlength="7"
onfocus="this.type='month'; this.max='9999-12';"
oninput="limitMonthYearInput(this)"
onblur="if(!this.value)this.type='text'">

    <input class="exp-end"
type="text"
placeholder="Bitiş Tarihi"
inputmode="numeric"
maxlength="7"
onfocus="this.type='month'; this.max='9999-12';"
oninput="limitMonthYearInput(this)"
onblur="if(!this.value)this.type='text'">

    <textarea
      class="exp-desc"
      placeholder="Görevlerinizi, sorumluluklarınızı ve başarılarınızı yazın..."
    ></textarea>

    <button type="button" class="mini-btn remove" onclick="this.parentElement.remove(); update();">
      Sil
    </button>
  `;

  $("expList").appendChild(box);

  bindInputs(box);

}

/* =====================================================
   ADD LANGUAGE
===================================================== */

function addLang() {

  const box = document.createElement("div");

  box.className = "item lang";

  box.innerHTML = `
    <input class="lang-name" list="languageNames" placeholder="Dil">

    <select class="lang-read">
      <option value="">Okuma Seviyesi</option>
      <option>Başlangıç</option>
      <option>Temel</option>
      <option>Orta</option>
      <option>İyi</option>
      <option>İleri</option>
      <option>Ana Dil</option>
    </select>

    <select class="lang-write">
      <option value="">Yazma Seviyesi</option>
      <option>Başlangıç</option>
      <option>Temel</option>
      <option>Orta</option>
      <option>İyi</option>
      <option>İleri</option>
      <option>Ana Dil</option>
    </select>

    <select class="lang-speak">
      <option value="">Konuşma Seviyesi</option>
      <option>Başlangıç</option>
      <option>Temel</option>
      <option>Orta</option>
      <option>İyi</option>
      <option>İleri</option>
      <option>Ana Dil</option>
    </select>

    <button type="button" class="mini-btn remove" onclick="this.parentElement.remove(); update();">
      Sil
    </button>
  `;

  $("langList").appendChild(box);

  bindInputs(box);

}

/* =====================================================
   ADD CERTIFICATE
===================================================== */

function addCert() {

  const box = document.createElement("div");

  box.className = "item cert";

  box.innerHTML = `
    <input class="cert-name" placeholder="Sertifika Adı">

    <input class="cert-org" placeholder="Kurum">

    <input class="cert-date"
type="text"
placeholder="Sertifika Tarihi"
inputmode="numeric"
maxlength="7"
onfocus="this.type='month'; this.max='9999-12';"
oninput="limitMonthYearInput(this)"
onblur="if(!this.value)this.type='text'">

    <input class="cert-link" placeholder="Sertifika Linki">

    <textarea class="cert-desc" placeholder="Açıklama"></textarea>

    <button type="button" class="mini-btn remove" onclick="this.parentElement.remove(); update();">
      Sil
    </button>
  `;

  $("certList").appendChild(box);

  bindInputs(box);

}

/* =====================================================
   ADD PROJECT
===================================================== */

function addProject() {

  const box = document.createElement("div");

  box.className = "item project";

  box.innerHTML = `
    <input class="project-name" placeholder="Proje Adı">

    <input class="project-type" placeholder="Proje Türü">

    <input class="project-tech" placeholder="Teknolojiler">

    <input class="project-date"
type="text"
placeholder="Proje Tarihi"
inputmode="numeric"
maxlength="7"
onfocus="this.type='month'; this.max='9999-12';"
oninput="limitMonthYearInput(this)"
onblur="if(!this.value)this.type='text'">

    <input class="project-link" placeholder="Proje Linki">

    <textarea class="project-desc" placeholder="Proje açıklaması"></textarea>

    <button type="button" class="mini-btn remove" onclick="this.parentElement.remove(); update();">
      Sil
    </button>
  `;

  $("projectList").appendChild(box);

  bindInputs(box);

}

/* =====================================================
   ADD REFERENCE
===================================================== */

function addRef() {

  const box = document.createElement("div");

  box.className = "item ref";

  box.innerHTML = `
    <input class="ref-name" placeholder="Ad Soyad">

    <input class="ref-role" placeholder="Pozisyon / Ünvan">

    <input class="ref-company" placeholder="Şirket / Kurum">

    <input class="ref-phone" placeholder="Telefon">

    <input class="ref-email" placeholder="E-posta">

    <textarea class="ref-desc" placeholder="Açıklama"></textarea>

    <button type="button" class="mini-btn remove" onclick="this.parentElement.remove(); update();">
      Sil
    </button>
  `;

  $("refList").appendChild(box);

  bindInputs(box);

}

/* =====================================================
   BIND INPUTS
===================================================== */

function bindInputs(box) {

  box.querySelectorAll("input, textarea, select").forEach(function(element) {

    element.addEventListener("input", update);

  });

  update();

}

/* =====================================================
   RENDER EDUCATION
===================================================== */

function renderEducation() {

  let html = "";

  document.querySelectorAll(".edu").forEach(function(item) {

    const type = item.querySelector(".edu-type").value;

    const school = item.querySelector(".edu-school").value.trim();

    const dept = item.querySelector(".edu-dept").value.trim();

    const start = item.querySelector(".edu-start").value.trim();

    const end = item.querySelector(".edu-end").value.trim();

    const gpa = item.querySelector(".edu-gpa").value.trim();

    const desc = item.querySelector(".edu-desc").value.trim();

    const hasData =
      type || school || dept || start || end || gpa || desc;

    if (!hasData) {
      return;
    }

    const title = school || type || "Eğitim";

    const meta = [
      type,
      dept,
      [start, end].filter(Boolean).join(" — "),
      gpa ? "Not: " + gpa : ""
    ].filter(Boolean).join(" • ");

    html += `
      <div class="entry">
        <b>${esc(title)}</b>
        <small>${esc(meta)}</small>
        <p>${esc(desc)}</p>
      </div>
    `;

  });

  $("pEdu").innerHTML = html;

  show("secEdu", !!html);

}

/* =====================================================
   RENDER EXPERIENCE
===================================================== */

function renderExperience() {

  let html = "";

  document.querySelectorAll(".exp").forEach(function(item) {

    const company = item.querySelector(".exp-company").value.trim();

    const role = item.querySelector(".exp-role").value.trim();

    const type = item.querySelector(".exp-type").value;

    const loc = item.querySelector(".exp-loc").value.trim();

    const start = item.querySelector(".exp-start").value.trim();

    const end = item.querySelector(".exp-end").value.trim();

    const desc = item.querySelector(".exp-desc").value.trim();

    const hasData =
      company || role || type || loc || start || end || desc;

    if (!hasData) {
      return;
    }

    const meta = [
      company,
      type,
      loc,
      [start, end].filter(Boolean).join(" — ")
    ].filter(Boolean).join(" • ");

    html += `
      <div class="entry">
        <b>${esc(role || "Pozisyon")}</b>
        <small>${esc(meta)}</small>
        <p>${esc(desc)}</p>
      </div>
    `;

  });

  $("pExp").innerHTML = html;

  show("secExp", !!html);

}

/* =====================================================
   RENDER SKILLS
===================================================== */

function renderSkills() {

  const skills = val("skills")
    .split(",")
    .map(function(skill) {
      return skill.trim();
    })
    .filter(Boolean);

  let html = "";

  skills.forEach(function(skill) {

    html += `
      <span class="tag">${esc(skill)}</span>
    `;

  });

  $("pSkills").innerHTML = html;

  show("secSkills", skills.length > 0);

}

/* =====================================================
   RENDER LANGUAGES
===================================================== */

function renderLanguages() {

  let html = "";

  document.querySelectorAll(".lang").forEach(function(item) {

    const name = item.querySelector(".lang-name").value.trim();

    const read = item.querySelector(".lang-read").value;

    const write = item.querySelector(".lang-write").value;

    const speak = item.querySelector(".lang-speak").value;

    const hasData = name || read || write || speak;

    if (!hasData) {
      return;
    }

    const meta = [
      read ? "Okuma: " + read : "",
      write ? "Yazma: " + write : "",
      speak ? "Konuşma: " + speak : ""
    ].filter(Boolean).join(" • ");

    html += `
      <div class="entry">
        <b>${esc(name || "Dil")}</b>
        <small>${esc(meta)}</small>
      </div>
    `;

  });

  $("pLangs").innerHTML = html;

  show("secLang", !!html);

}

/* =====================================================
   RENDER CERTIFICATES
===================================================== */

function renderCertificates() {

  let html = "";

  document.querySelectorAll(".cert").forEach(function(item) {

    const inputs = item.querySelectorAll("input, textarea, select");

    const nameField = item.querySelector(".cert-name") || inputs[0];

    const orgField = item.querySelector(".cert-org") || inputs[1];

    const dateField = item.querySelector(".cert-date") || inputs[2];

    const descField = item.querySelector(".cert-desc") || item.querySelector("textarea") || inputs[3];

    const name = nameField ? nameField.value.trim() : "";

    const org = orgField ? orgField.value.trim() : "";

    const date = dateField ? dateField.value.trim() : "";

    const desc = descField ? descField.value.trim() : "";

    if (!name && !org && !date && !desc) {
      return;
    }

    const meta = [
      org ? "Kurum: " + org : "",
      date ? formatMonth(date) : ""
    ].filter(Boolean).join(" • ");

    html += `
      <div class="entry">
        <b>${esc(name || "Sertifika")}</b>
        <small>${esc(meta)}</small>
        <p>${esc(desc)}</p>
      </div>
    `;

  });

  $("pCerts").innerHTML = html;

  show("secCert", !!html);

}

/* =====================================================
   RENDER PROJECTS
===================================================== */

function renderProjects() {

  let html = "";

  document.querySelectorAll(".project").forEach(function(item) {

    const name = item.querySelector(".project-name").value.trim();

    const type = item.querySelector(".project-type").value.trim();

    const tech = item.querySelector(".project-tech").value.trim();

    const date = item.querySelector(".project-date").value.trim();

    const link = item.querySelector(".project-link").value.trim();

    const desc = item.querySelector(".project-desc").value.trim();

    const hasData =
      name || type || tech || date || link || desc;

    if (!hasData) {
      return;
    }

    const meta = [
      type,
      tech,
      date,
      link
    ].filter(Boolean).join(" • ");

    html += `
      <div class="entry">
        <b>${esc(name || "Proje")}</b>
        <small>${esc(meta)}</small>
        <p>${esc(desc)}</p>
      </div>
    `;

  });

  $("pProjects").innerHTML = html;

  show("secProject", !!html);

}

/* =====================================================
   RENDER DOCUMENTS
===================================================== */



/* =====================================================
   RENDER REFERENCES
===================================================== */

function renderReferences() {

  let html = "";

  document.querySelectorAll(".ref").forEach(function(item) {

    const name = item.querySelector(".ref-name").value.trim();

    const role = item.querySelector(".ref-role").value.trim();

    const company = item.querySelector(".ref-company").value.trim();

    const phone = item.querySelector(".ref-phone").value.trim();

    const email = item.querySelector(".ref-email").value.trim();

    const desc = item.querySelector(".ref-desc").value.trim();

    const hasData =
      name || role || company || phone || email || desc;

    if (!hasData) {
      return;
    }

    const meta = [
      role,
      company,
      phone,
      email
    ].filter(Boolean).join(" • ");

    html += `
      <div class="entry">
        <b>${esc(name || "Referans")}</b>
        <small>${esc(meta)}</small>
        <p>${esc(desc)}</p>
      </div>
    `;

  });

  $("pRefs").innerHTML = html;

  show("secRef", !!html);

}



/* =====================================================
   COMPLETION / DOPAMINE PROGRESS
===================================================== */

function hasAnyFilled(selector) {

  let filled = false;

  document.querySelectorAll(selector).forEach(function(item) {

    if (filled) {
      return;
    }

    filled = Array.from(item.querySelectorAll("input, textarea, select"))
      .some(function(field) {
        return field.value && field.value.trim();
      });

  });

  return filled;

}

function setChip(id, done) {

  const chip = $(id);

  if (!chip) {
    return;
  }

  if (done) {
    chip.classList.add("done");
  } else {
    chip.classList.remove("done");
  }

}

function updateProgressCard() {

  const checks = [
    !!val("name"),
    !!val("job"),
    !!val("phone") || !!val("email"),
    !!val("about"),
    hasAnyFilled(".edu"),
    hasAnyFilled(".exp"),
    !!val("skills")
  ];

  const done = checks.filter(Boolean).length;

  const percent = Math.round((done / checks.length) * 100);

  if ($("progressPercent")) {
    $("progressPercent").innerText = percent + "%";
  }

  if ($("progressFill")) {
    $("progressFill").style.width = percent + "%";
  }

  setChip("chipInfo", !!val("name") && !!val("job"));
  setChip("chipAts", percent >= 55);
  setChip("chipPreview", percent >= 25);

  if ($("progressMessage")) {

    if (percent === 0) {
      $("progressMessage").innerText = "Başlayalım. İlk bilgiyle CV canlanacak.";
    } else if (percent < 30) {
      $("progressMessage").innerText = "Güzel başlangıç. Meslek ve iletişim bilgileri CV’yi hemen toparlar.";
    } else if (percent < 60) {
      $("progressMessage").innerText = "CV görünmeye başladı. Özet, deneyim ve yetenek alanları etkiyi artırır.";
    } else if (percent < 85) {
      $("progressMessage").innerText = "İyi gidiyorsun. CV artık başvuruya hazır hale yaklaşıyor.";
    } else {
      $("progressMessage").innerText = "Harika. CV profesyonel, dolu ve önizlemeye hazır görünüyor.";
    }

  }

}

/* =====================================================
   ATS SCORE + SMART SUMMARY
===================================================== */

function countFilled(selector) {

  let count = 0;

  document.querySelectorAll(selector).forEach(function(item) {

    const hasValue = Array.from(item.querySelectorAll("input, textarea, select"))
      .some(function(field) {
        return field.value && field.value.trim();
      });

    if (hasValue) {
      count++;
    }

  });

  return count;

}

function updateAtsScore() {

  let score = 0;

  const checks = [
    { ok: !!val("name"), points: 10 },
    { ok: !!val("job"), points: 10 },
    { ok: !!val("phone") || !!val("email"), points: 12 },
    { ok: !!val("city") || !!val("country"), points: 6 },
    { ok: !!val("about"), points: 14 },
    { ok: countFilled(".edu") > 0, points: 12 },
    { ok: countFilled(".exp") > 0, points: 16 },
    { ok: !!val("skills"), points: 12 },
    { ok: countFilled(".lang") > 0, points: 8 }
  ];

  checks.forEach(function(check) {

    if (check.ok) {
      score += check.points;
    }

  });

  score = Math.min(100, score);

  if ($("atsScore")) {
    $("atsScore").innerText = score;
  }

  if ($("atsFill")) {
    $("atsFill").style.width = score + "%";
  }

  if ($("atsText")) {

    if (score < 35) {
      $("atsText").innerText = "Başlangıç iyi. İsim, meslek, iletişim, özet ve deneyim alanlarını doldur.";
    } else if (score < 70) {
      $("atsText").innerText = "CV toparlanıyor. Yetenek, deneyim ve eğitim alanlarını güçlendirirsen daha profesyonel görünür.";
    } else if (score < 90) {
      $("atsText").innerText = "Güçlü CV seviyesine yaklaştın. Kısa profesyonel özet ve net yetenekler satış etkisini artırır.";
    } else {
      $("atsText").innerText = "Premium seviye. CV dolu, okunabilir ve ATS uyumlu görünüyor.";
    }

  }

}

function generateSmartSummary() {

  const job = val("job") || "profesyonel";
  const skills = val("skills");
  const city = val("city");

  let expRole = "";

  const firstExp = document.querySelector(".exp");

  if (firstExp) {
    const roleInput = firstExp.querySelector(".exp-role");
    const companyInput = firstExp.querySelector(".exp-company");

    expRole = [
      roleInput ? roleInput.value.trim() : "",
      companyInput ? companyInput.value.trim() : ""
    ].filter(Boolean).join(" / ");
  }

  const parts = [];

  parts.push(job + " alanında düzenli, sonuç odaklı ve profesyonel çalışma disiplinine sahip bir adayım.");

  if (expRole) {
    parts.push(expRole + " deneyimimle iş süreçlerine hızlı uyum sağlayabilir ve verilen görevleri disiplinli şekilde takip edebilirim.");
  }

  if (skills) {
    parts.push("Güçlü olduğum alanlar: " + skills + ".");
  }

  if (city) {
    parts.push(city + " ve çevresindeki uygun pozisyonlarda aktif olarak çalışmaya hazırım.");
  }

  $("about").value = parts.join(" ");

  update();

  const aboutBox = $("about");
  aboutBox.focus();

}

function jumpPreview() {

  const preview = $("cvWrap");

  if (!preview) {
    return;
  }

  preview.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  preview.classList.add("pulse");

  setTimeout(function() {
    preview.classList.remove("pulse");
  }, 450);

}


/* =====================================================
   DOCUMENT / IMAGE UPLOAD FIX
===================================================== */

let uploadedDocs = window.uploadedDocs || [];

function handleDocumentFiles(files) {

  if (!files || !files.length) {
    return;
  }

  const selectedFiles = Array.from(files).slice(0, Math.max(0, 5 - uploadedDocs.length));

  if (!selectedFiles.length) {
    if ($("docHint")) {
      $("docHint").innerText = "Maksimum 5 belge ekleyebilirsiniz. Önce mevcut belgelerden birini kaldırın.";
    }
    if ($("docInput")) {
      $("docInput").value = "";
    }
    return;
  }

  selectedFiles.forEach(function(file) {

    const reader = new FileReader();

    reader.onload = function() {

      uploadedDocs.push({
        name: file.name || "Ek Belge",
        type: file.type || "",
        data: reader.result
      });

      renderDocuments();

      update();

      if ($("docInput")) {
        $("docInput").value = "";
      }

    };

    reader.readAsDataURL(file);

  });

}

function removeUploadedDoc(index) {

  uploadedDocs.splice(index, 1);

  if ($("docInput")) {
    $("docInput").value = "";
  }

  renderDocuments();

  update();

}


function renderDocuments() {

  const box = $("pDocs");
  const listBox = $("docList");

  let listHtml = "";

  uploadedDocs.forEach(function(doc, index) {
    listHtml += `
      <div class="doc-row">
        <div class="doc-row-name">${esc(doc.name || "Ek Belge")}</div>
        <button type="button" class="doc-remove" onclick="removeUploadedDoc(${index})">Belgeyi Kaldır</button>
      </div>
    `;
  });

  if (listBox) {
    listBox.innerHTML = listHtml;
  }

  if ($("docHint")) {
    $("docHint").innerText = uploadedDocs.length
      ? uploadedDocs.length + " belge eklendi. İsterseniz aşağıdan kaldırabilirsiniz."
      : "Diploma, sertifika, transkript veya portfolyo ekleyebilirsiniz.";
  }

  if (!box) {
    return;
  }

  let html = "";

  uploadedDocs.forEach(function(doc) {

    const isImage =
      doc.type.indexOf("image/") === 0 ||
      String(doc.data).indexOf("data:image/") === 0;

    if (isImage) {

      html += `
        <div class="doc-image-entry">
          <b>${esc(doc.name || "Ek Belge")}</b>
          <img src="${doc.data}" alt="${esc(doc.name || "Ek Belge")}">
        </div>
      `;

    } else {

      html += `
        <div class="doc-image-entry">
          <b>${esc(doc.name || "Ek Belge")}</b>
          <div class="entry">
            <small>Bu dosya türü görsel önizleme olarak desteklenmiyor.</small>
          </div>
        </div>
      `;

    }

  });

  box.innerHTML = html;

  show("secDocs", !!html);

}


/* =====================================================
   PDF PREVIEW
===================================================== */


let isPdfGenerating = false;

function getPdfLoadingHtml() {

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            background: #f4f5f7;
            color: #111;
          }
          .box {
            text-align: center;
            padding: 24px;
          }
          .loader {
            width: 34px;
            height: 34px;
            border: 4px solid #ddd;
            border-top-color: #111;
            border-radius: 50%;
            margin: 0 auto 14px;
            animation: spin .8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          b {
            display: block;
            font-size: 16px;
            margin-bottom: 6px;
          }
          span {
            font-size: 13px;
            opacity: .62;
          }
        

/* =====================================================
   FINAL MOBILE OVERLAP FIX
   Mobilde sabit PDF butonu formun üstüne binmesin.
   Fotoğraf Ekle / CV Oluşturmaya Başla net görünsün.
===================================================== */

@media (max-width: 768px) {
  body {
    padding-bottom: 32px !important;
  }

  .app {
    padding-bottom: 18px !important;
  }

  .download {
    position: static !important;
    left: auto !important;
    bottom: auto !important;
    transform: none !important;
    display: block !important;
    width: calc(100% - 28px) !important;
    max-width: 430px !important;
    margin: 18px auto 28px !important;
    padding: 17px 14px !important;
    border-radius: 18px !important;
    z-index: 10 !important;
    box-shadow: 0 12px 30px rgba(0,0,0,.20) !important;
  }

  .download:active {
    transform: scale(.985) !important;
  }

  .file-label,
  .mini-btn.remove {
    position: relative !important;
    z-index: 2 !important;
  }
}

/* =====================================================
   FINAL TEXT CENTER FIX
===================================================== */

.bottom-tabs-title,
.bottom-tabs-note,
.preview-title,
.preview-sub {
  width: 100% !important;
  text-align: center !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

.bottom-tabs-title,
.preview-title {
  display: block !important;
}

.bottom-tabs-note,
.preview-sub {
  display: block !important;
  max-width: 360px !important;
  line-height: 1.65 !important;
}

.preview-title::after {
  vertical-align: middle !important;
}



/* =====================================================
   LEGAL / POLICY AREA FINAL
===================================================== */

.legal-box {
  background: #ffffff;
  border-radius: 22px;
  padding: 16px;
  margin: 16px 0;
  box-shadow: 0 10px 28px rgba(0,0,0,.06);
  border: 1px solid rgba(17,17,17,.06);
}

.legal-title {
  font-size: 15px;
  font-weight: 900;
  margin-bottom: 12px;
  text-align: center;
}

.legal-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.legal-check input {
  width: 18px !important;
  height: 18px !important;
  min-width: 18px !important;
  margin-top: 2px !important;
  flex: 0 0 18px !important;
  padding: 0 !important;
  border-radius: 4px !important;
  appearance: auto !important;
  -webkit-appearance: checkbox !important;
}

.legal-check label {
  font-size: 13px;
  line-height: 1.55;
  color: #374151;
}

.legal-note {
  font-size: 12px;
  line-height: 1.6;
  opacity: .68;
  margin-top: 6px;
  text-align: center;
}

.legal-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}

.legal-links a {
  text-decoration: none;
  background: #f3f4f6;
  color: #111827;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.support-footer {
  margin-top: 26px;
  margin-bottom: 110px;
  text-align: center;
  padding: 22px 18px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 28px rgba(0,0,0,.06);
  border: 1px solid rgba(17,17,17,.06);
}

.support-title {
  font-size: 18px;
  font-weight: 900;
  margin-bottom: 8px;
}

.support-sub {
  font-size: 13px;
  line-height: 1.6;
  opacity: .66;
  max-width: 320px;
  margin: 0 auto 16px;
}

.support-whatsapp {
  display: inline-block;
  text-decoration: none;
  background: #16a34a;
  color: #ffffff;
  padding: 14px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 900;
  box-shadow: 0 10px 22px rgba(22,163,74,.20);
}

.support-mail {
  margin-top: 14px;
  font-size: 12px;
  opacity: .58;
  font-weight: 700;
}


/* =====================================================
   LEGAL + SUPPORT COMPACT WIDTH FIX
   Sayfanın tamamına yayılmasını engeller.
===================================================== */

.legal-box,
.support-footer {
  width: 100% !important;
  max-width: 430px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

.legal-box {
  padding: 16px !important;
  margin-top: 18px !important;
  margin-bottom: 18px !important;
  border-radius: 22px !important;
}

.support-footer {
  padding: 22px 18px !important;
  margin-top: 22px !important;
  margin-bottom: 115px !important;
  border-radius: 24px !important;
}

.legal-check {
  justify-content: flex-start !important;
  text-align: left !important;
}

.legal-links {
  max-width: 360px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

</style>
      </head>
      <body>
        <div class="box">
          <div class="loader"></div>
          <b>CV PDF hazırlanıyor...</b>
          <span>Önizleme birkaç saniye içinde açılacak.</span>
        </div></body>
    </html>
  `;

}

function openPdfLoadingInstant() {

  const modal = $("pdfModal");
  const frame = $("pdfFrame");

  if (!modal || !frame) {
    return;
  }

  modal.style.display = "flex";
  frame.removeAttribute("src");
  frame.srcdoc = getPdfLoadingHtml();

}

function startPreviewPdf(event) {

  if (event) {
    if (event.cancelable) {
      event.preventDefault();
    }
    if (event.stopPropagation) {
      event.stopPropagation();
    }
  }

  unlockPreviewCta();

  if (isPdfGenerating) {
    return false;
  }

  isPdfGenerating = true;

  /*
    MOBIL KÖK DÜZELTME V8.3:
    iPhone/Android tarayıcılarında input veya meslek autocomplete focus açıkken
    ilk dokunuş çoğu zaman sadece klavyeyi/öneri kutusunu kapatmaya gidiyor.
    Bu yüzden önce blur değil, önce modal açılır. Böylece ilk dokunuşta
    kullanıcı anında "CV PDF hazırlanıyor" ekranını görür.
  */
  openPdfLoadingInstant();

  const active = document.activeElement;

  if (active && typeof active.blur === "function" && active !== document.body) {
    setTimeout(function() {
      try { active.blur(); } catch (error) {}
    }, 0);
  }

  const button = document.querySelector(".download");

  if (button) {
    button.disabled = true;
    button.innerText = "CV PDF hazırlanıyor...";
  }

  // iPhone Safari'de input focus ilk dokunuşu yutmasın diye
  // modal hemen açılır, üretim sonraki frame'de başlar.
  requestAnimationFrame(function() {
    setTimeout(function() {
      createPreviewPdf();
    }, 40);
  });

  return false;

}


function applySmartPageBreaks(root) {

  const pageHeight = 1123;

  const safeBottom = 70;

  const sections = Array.from(root.querySelectorAll(".sec"))
    .filter(function(section) {
      return section.style.display !== "none" && section.offsetHeight > 0;
    });

  sections.forEach(function(section) {

    const sectionTop = section.offsetTop;

    const sectionHeight = section.offsetHeight;

    const positionInPage = sectionTop % pageHeight;

    const availableSpace = pageHeight - positionInPage - safeBottom;

    if (sectionHeight > availableSpace && sectionHeight < pageHeight - 120) {

      const spacerHeight = pageHeight - positionInPage + 24;

      const spacer = document.createElement("div");

      spacer.className = "pdf-page-spacer";

      spacer.style.height = spacerHeight + "px";

      spacer.style.breakAfter = "auto";

      section.parentNode.insertBefore(spacer, section);

    }

  });

}


function getPdfPageBorderColor() {

  const cv = $("cv");

  if (!cv) {
    return "#111827";
  }

  if (cv.classList.contains("premium")) {
    return "#d4af37";
  }

  if (cv.classList.contains("creative")) {
    return "#ec4899";
  }

  if (cv.classList.contains("executive")) {
    return "#7c3aed";
  }

  if (cv.classList.contains("corporate")) {
    return "#0f172a";
  }

  if (cv.classList.contains("modern")) {
    return "#111827";
  }

  return "#d1d5db";

}

function drawPdfPageBorder(ctx, width, height) {

  const color = getPdfPageBorderColor();

  const lineWidth = Math.max(5, Math.round(width * 0.0048));

  const inset = Math.round(lineWidth / 2);

  ctx.save();

  ctx.strokeStyle = color;

  ctx.lineWidth = lineWidth;

  ctx.strokeRect(inset, inset, width - lineWidth, height - lineWidth);

  ctx.restore();

}


async function waitForImages(root) {

  const images = Array.from(root.querySelectorAll("img"));

  if (!images.length) {
    return;
  }

  await Promise.all(images.map(function(img) {

    return new Promise(function(resolve) {

      if (!img.getAttribute("src")) {
        resolve();
        return;
      }

      if (img.complete && img.naturalWidth > 0) {
        resolve();
        return;
      }

      if (img.decode) {
        img.decode().then(resolve).catch(function() {
          resolve();
        });
        return;
      }

      img.onload = resolve;
      img.onerror = resolve;

      setTimeout(resolve, 1500);

    });

  }));

}

/* =====================================================
   MOBILE ONE-TAP PREVIEW FIX V6.6
   iPhone Safari'de aynı butona touchstart + pointerdown + click
   birlikte bağlanınca ilk dokunuş bazen sadece odak/scroll yakalıyor.
   Tek güvenli akış: buton görünür, ilk dokunuşta click ile modal açılır.
===================================================== */
document.addEventListener("DOMContentLoaded", function() {

  const previewButton = document.getElementById("previewCta");

  if (!previewButton) {
    return;
  }

  previewButton.style.touchAction = "manipulation";

  let mobilePreviewTapStarted = false;

  function isSmallTouchScreen() {
    return window.matchMedia && window.matchMedia("(max-width: 767px)").matches;
  }

  function runPreviewFromFirstMobileTouch(event) {
    if (!isSmallTouchScreen()) {
      return;
    }

    if (previewButton.classList.contains("preview-locked")) {
      return;
    }

    if (mobilePreviewTapStarted || isPdfGenerating) {
      if (event && event.cancelable) {
        event.preventDefault();
      }
      return;
    }

    mobilePreviewTapStarted = true;
    startPreviewPdf(event);

    setTimeout(function() {
      mobilePreviewTapStarted = false;
    }, 1200);
  }

  /*
    Mobil ilk dokunuş düzeltmesi V7.5:
    Bazı telefon tarayıcılarında fixed CTA ilk dokunuşta yalnızca focus/keyboard
    kapatma davranışına düşebiliyor. Önizlemeyi touchstart/pointerdown anında
    başlatıyoruz; click beklenmediği için ikinci basış gerekmiyor.
  */
  previewButton.addEventListener("touchstart", runPreviewFromFirstMobileTouch, { passive: false, capture: true });

  previewButton.addEventListener("pointerdown", function(event) {
    if (event.pointerType === "touch") {
      runPreviewFromFirstMobileTouch(event);
    }
  }, { passive: false, capture: true });

  previewButton.addEventListener("touchend", function(event) {
    if (isSmallTouchScreen()) {
      if (event.cancelable) {
        event.preventDefault();
      }
      return;
    }
    startPreviewPdf(event);
  }, { passive: false });

});



/* =====================================================
   CVYAZ MOBILE PREVIEW FIRST TAP ROOT FIX V8.3
   Butonun kendi touch/click event'i bazı mobil tarayıcılarda input focus
   açıkken ilk dokunuşta tetiklenmeyebiliyor. Bu yüzden dokunuşu document
   seviyesinde yakalayıp koordinat gerçekten Önizleme butonunun üzerindeyse
   preview'i ilk anda başlatıyoruz.
===================================================== */
(function() {

  function isMobileViewport() {
    return window.matchMedia && window.matchMedia("(max-width: 767px)").matches;
  }

  function getPreviewButton() {
    return document.getElementById("previewCta") || document.querySelector(".download");
  }

  function pointInsideButton(x, y, button) {
    if (!button) { return false; }

    const rect = button.getBoundingClientRect();
    const pad = 10;

    return x >= rect.left - pad &&
           x <= rect.right + pad &&
           y >= rect.top - pad &&
           y <= rect.bottom + pad;
  }

  let lastForcedPreviewAt = 0;

  function forcePreviewFromPoint(event) {
    if (!isMobileViewport()) { return; }

    const button = getPreviewButton();

    if (!button || button.classList.contains("preview-locked")) {
      return;
    }

    let point = null;

    if (event.touches && event.touches.length) {
      point = event.touches[0];
    } else if (event.changedTouches && event.changedTouches.length) {
      point = event.changedTouches[0];
    } else if (typeof event.clientX === "number") {
      point = event;
    }

    if (!point) { return; }

    if (!pointInsideButton(point.clientX, point.clientY, button)) {
      return;
    }

    const now = Date.now();
    if (now - lastForcedPreviewAt < 1200) {
      if (event.cancelable) { event.preventDefault(); }
      return;
    }

    lastForcedPreviewAt = now;

    if (event.cancelable) { event.preventDefault(); }
    if (event.stopPropagation) { event.stopPropagation(); }
    if (event.stopImmediatePropagation) { event.stopImmediatePropagation(); }

    startPreviewPdf(event);
  }

  document.addEventListener("touchstart", forcePreviewFromPoint, { passive: false, capture: true });
  document.addEventListener("pointerdown", function(event) {
    if (event.pointerType === "touch") {
      forcePreviewFromPoint(event);
    }
  }, { passive: false, capture: true });

})();

async function createPreviewPdf() {

  update();

  const button = document.querySelector(".download");
  const cv = $("cv");
  let pdfClone = null;

  function sleep(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  }

  function loadImageSafe(src) {
    return new Promise(function(resolve) {
      if (!src) {
        resolve(null);
        return;
      }

      const image = new Image();
      image.onload = function() {
        resolve(image);
      };
      image.onerror = function() {
        resolve(null);
      };
      image.src = src;
    });
  }

  function drawPreviewWatermark(ctx, width, height) {
    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = "#111827";
    ctx.font = "900 " + Math.round(width * 0.045) + "px Arial";
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-24 * Math.PI / 180);

    const text = "CVYAZ ÖNİZLEME";
    const stepX = Math.round(width * 0.28);
    const stepY = Math.round(height * 0.12);

    for (let y = -height; y <= height; y += stepY) {
      for (let x = -width; x <= width; x += stepX) {
        ctx.fillText(text, x, y);
      }
    }

    ctx.restore();
  }

  function drawDocumentBackgroundWatermark(ctx, width, height) {
    ctx.save();
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = "#111827";
    ctx.font = "900 " + Math.round(width * 0.05) + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-24 * Math.PI / 180);

    const text = "CVYAZ ÖNİZLEME";
    const positions = [
      [-width * 0.36, -height * 0.32],
      [ width * 0.12, -height * 0.18],
      [-width * 0.10,  height * 0.06],
      [ width * 0.36,  height * 0.26],
      [-width * 0.42,  height * 0.36]
    ];

    positions.forEach(function(pos) {
      ctx.fillText(text, pos[0], pos[1]);
    });

    ctx.restore();
  }

  async function createDocumentPreviewPage(entry, pageWidthPx, pageHeightPx) {
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = pageWidthPx;
    pageCanvas.height = pageHeightPx;

    const ctx = pageCanvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageWidthPx, pageHeightPx);

    drawDocumentBackgroundWatermark(ctx, pageWidthPx, pageHeightPx);

    const imgEl = entry.querySelector("img");
    const src = imgEl ? imgEl.getAttribute("src") : "";
    const image = await loadImageSafe(src);

    if (image) {
      const margin = Math.round(pageWidthPx * 0.035);
      const maxW = pageWidthPx - (margin * 2);
      const maxH = pageHeightPx - (margin * 2);
      const scale = Math.min(maxW / image.naturalWidth, maxH / image.naturalHeight);
      const drawW = image.naturalWidth * scale;
      const drawH = image.naturalHeight * scale;
      const drawX = (pageWidthPx - drawW) / 2;
      const drawY = (pageHeightPx - drawH) / 2;

      ctx.drawImage(image, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = "#6b7280";
      ctx.font = "700 " + Math.round(pageWidthPx * 0.026) + "px Arial";
      ctx.fillText("Belge görseli yüklenemedi.", Math.round(pageWidthPx * 0.07), pageHeightPx / 2);
    }

    return pageCanvas.toDataURL("image/jpeg", 0.9);
  }

  try {

    if (!cv) {
      throw new Error("CV alanı bulunamadı.");
    }

    const pageWidthMm = 210;
    const pageHeightMm = 297;

    const originalDocEntries = Array.from(document.querySelectorAll("#secDocs .doc-image-entry"))
      .filter(function(entry) {
        const img = entry.querySelector("img");
        return img && img.getAttribute("src");
      });

    pdfClone = cv.cloneNode(true);
    pdfClone.id = "cvPdfClone";

    pdfClone.style.position = "fixed";
    pdfClone.style.left = "-10000px";
    pdfClone.style.top = "0";
    pdfClone.style.width = "794px";
    pdfClone.style.height = "auto";
    pdfClone.style.minHeight = "0";
    pdfClone.style.maxHeight = "none";
    pdfClone.style.transform = "none";
    pdfClone.style.transformOrigin = "top left";
    pdfClone.style.margin = "0";
    pdfClone.style.marginBottom = "0";
    pdfClone.style.borderRadius = "0";
    pdfClone.style.boxShadow = "none";
    pdfClone.style.overflow = "visible";
    pdfClone.style.background = "#ffffff";
    pdfClone.style.border = "0";
    pdfClone.style.borderTop = "0";
    pdfClone.style.borderRight = "0";
    pdfClone.style.borderBottom = "0";
    pdfClone.style.borderLeft = "0";

    pdfClone.querySelectorAll(".pdf-page-spacer").forEach(function(spacer) {
      spacer.remove();
    });

    /*
      MOBİL ÖNİZLEME FIX V2:
      Ek belgeler ana CV canvas'ından ayrıldı.
      Böylece belge görselleri iki sayfada yarım yarım bölünmez;
      her ek belge kendi A4 önizleme sayfasında tam görünür.
    */
    const cloneDocs = pdfClone.querySelector("#secDocs");
    if (cloneDocs) {
      cloneDocs.remove();
    }

    const clonePhoto = pdfClone.querySelector("#pPhoto");
    const clonePhotoFrame = pdfClone.querySelector("#photoFrame");

    if (clonePhotoFrame && clonePhoto) {
      if (clonePhoto.getAttribute("src")) {
        clonePhotoFrame.style.display = "block";
      } else {
        clonePhotoFrame.style.display = "none";
      }
    }

    document.body.appendChild(pdfClone);

    await new Promise(function(resolve) {
      requestAnimationFrame(function() {
        requestAnimationFrame(resolve);
      });
    });

    await waitForImages(pdfClone);

    if (typeof applySmartPageBreaks === "function") {
      applySmartPageBreaks(pdfClone);
      pdfClone.querySelectorAll(".pdf-page-spacer").forEach(function(spacer) {
        if (!spacer.nextElementSibling || spacer.offsetHeight > 1000) {
          spacer.remove();
        }
      });
    }

    await new Promise(function(resolve) {
      requestAnimationFrame(function() {
        requestAnimationFrame(resolve);
      });
    });

    await waitForImages(pdfClone);
    await sleep(180);

    const realHeight = Math.max(pdfClone.scrollHeight, 1);
    const mainHeight = Math.max(realHeight, 1123);

    const canvas = await html2canvas(pdfClone, {
      scale: 2.2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: 794,
      height: mainHeight,
      windowWidth: 794,
      windowHeight: mainHeight
    });

    const pageHeightPx = Math.round(canvas.width * (pageHeightMm / pageWidthMm));
    const pageImages = [];

    function isCanvasPageBlank(pageCanvas) {
      const ctx = pageCanvas.getContext("2d");
      const w = pageCanvas.width;
      const h = pageCanvas.height;
      const sampleStep = 34;
      let nonWhite = 0;

      for (let y = 0; y < h; y += sampleStep) {
        for (let x = 0; x < w; x += sampleStep) {
          const data = ctx.getImageData(x, y, 1, 1).data;
          if (data[0] < 245 || data[1] < 245 || data[2] < 245) {
            nonWhite++;
          }
          if (nonWhite > 18) {
            return false;
          }
        }
      }

      return true;
    }

    let pageIndex = 0;

    for (let sourceY = 0; sourceY < canvas.height; sourceY += pageHeightPx) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - sourceY);

      if (sliceHeight < 80) {
        break;
      }

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx;

      const ctx = pageCanvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      ctx.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );

      if (pageIndex > 0 && isCanvasPageBlank(pageCanvas)) {
        continue;
      }

      pageImages.push(pageCanvas.toDataURL("image/jpeg", 0.88));
      pageIndex++;
    }

    for (const docEntry of originalDocEntries) {
      const docPage = await createDocumentPreviewPage(docEntry, canvas.width, pageHeightPx);
      pageImages.push(docPage);
    }

    if (!pageImages.length) {
      throw new Error("Önizleme sayfası üretilemedi.");
    }

    const previewPagesHtml = pageImages.map(function(src, index) {
      return `
        <section class="page-card">
          <img src="${src}" alt="CV önizleme sayfa ${index + 1}">
        </section>
      `;
    }).join("");

    $("pdfFrame").removeAttribute("src");
    $("pdfFrame").srcdoc = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          * { box-sizing: border-box; }

          html,
          body {
            margin: 0;
            padding: 0;
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
            background: #f4f5f7;
            font-family: Arial, sans-serif;
            color: #111;
          }

          .preview-shell {
            min-height: 100vh;
            padding: 10px 10px 110px;
            overflow-x: hidden;
          }

          .preview-note {
            position: sticky;
            top: 0;
            z-index: 5;
            background: rgba(17, 17, 17, .94);
            color: #fff;
            border-radius: 0 0 18px 18px;
            padding: 12px 14px;
            margin: -10px -10px 12px;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 26px rgba(0,0,0,.18);
          }

          .preview-note b {
            display: block;
            font-size: 14px;
            margin-bottom: 3px;
          }

          .preview-note span {
            display: block;
            font-size: 12px;
            opacity: .72;
            line-height: 1.35;
          }

          .page-card {
            position: relative;
            width: 100%;
            margin: 0 auto 14px;
            background: #fff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 14px 38px rgba(15,23,42,.14);
            animation: pageIn .28s ease both;
          }

          .page-label {
            display: none !important;
          }

          .page-card img {
            display: block;
            width: 100%;
            height: auto;
            background: #fff;
          }

          @keyframes pageIn {
            from { opacity: 0; transform: scale(.985) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        

/* =====================================================
   FINAL CENTER ALIGNMENT PATCH
   Stil seçimi ve önizleme bilgilendirme metinleri ortalanır.
   Çekirdek yapı korunur.
===================================================== */

.bottom-tabs-title,
.bottom-tabs-note,
.preview-title,
.preview-sub {
  text-align: center !important;
}

.bottom-tabs-title,
.bottom-tabs-note {
  width: 100% !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

.bottom-tabs-note {
  max-width: 360px !important;
}

.preview-title {
  width: 100% !important;
}

.preview-sub {
  max-width: 360px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}


/* =====================================================
   FINAL TEXT CENTER FIX
===================================================== */

.bottom-tabs-title,
.bottom-tabs-note,
.preview-title,
.preview-sub {
  width: 100% !important;
  text-align: center !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

.bottom-tabs-title,
.preview-title {
  display: block !important;
}

.bottom-tabs-note,
.preview-sub {
  display: block !important;
  max-width: 360px !important;
  line-height: 1.65 !important;
}

.preview-title::after {
  vertical-align: middle !important;
}



/* =====================================================
   LEGAL / POLICY AREA FINAL
===================================================== */

.legal-box {
  background: #ffffff;
  border-radius: 22px;
  padding: 16px;
  margin: 16px 0;
  box-shadow: 0 10px 28px rgba(0,0,0,.06);
  border: 1px solid rgba(17,17,17,.06);
}

.legal-title {
  font-size: 15px;
  font-weight: 900;
  margin-bottom: 12px;
  text-align: center;
}

.legal-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.legal-check input {
  width: 18px !important;
  height: 18px !important;
  min-width: 18px !important;
  margin-top: 2px !important;
  flex: 0 0 18px !important;
  padding: 0 !important;
  border-radius: 4px !important;
  appearance: auto !important;
  -webkit-appearance: checkbox !important;
}

.legal-check label {
  font-size: 13px;
  line-height: 1.55;
  color: #374151;
}

.legal-note {
  font-size: 12px;
  line-height: 1.6;
  opacity: .68;
  margin-top: 6px;
  text-align: center;
}

.legal-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}

.legal-links a {
  text-decoration: none;
  background: #f3f4f6;
  color: #111827;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.support-footer {
  margin-top: 26px;
  margin-bottom: 110px;
  text-align: center;
  padding: 22px 18px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 28px rgba(0,0,0,.06);
  border: 1px solid rgba(17,17,17,.06);
}

.support-title {
  font-size: 18px;
  font-weight: 900;
  margin-bottom: 8px;
}

.support-sub {
  font-size: 13px;
  line-height: 1.6;
  opacity: .66;
  max-width: 320px;
  margin: 0 auto 16px;
}

.support-whatsapp {
  display: inline-block;
  text-decoration: none;
  background: #16a34a;
  color: #ffffff;
  padding: 14px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 900;
  box-shadow: 0 10px 22px rgba(22,163,74,.20);
}

.support-mail {
  margin-top: 14px;
  font-size: 12px;
  opacity: .58;
  font-weight: 700;
}


/* =====================================================
   LEGAL + SUPPORT COMPACT WIDTH FIX
   Sayfanın tamamına yayılmasını engeller.
===================================================== */

.legal-box,
.support-footer {
  width: 100% !important;
  max-width: 430px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

.legal-box {
  padding: 16px !important;
  margin-top: 18px !important;
  margin-bottom: 18px !important;
  border-radius: 22px !important;
}

.support-footer {
  padding: 22px 18px !important;
  margin-top: 22px !important;
  margin-bottom: 115px !important;
  border-radius: 24px !important;
}

.legal-check {
  justify-content: flex-start !important;
  text-align: left !important;
}

.legal-links {
  max-width: 360px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

</style>
      </head>
      <body>
        <main class="preview-shell">
          <div class="preview-note">
            <b>🔒 Önizleme Modu</b>
            <span>İlk sayfa telefonda tam görünür. Ek belgeler ayrı sayfada tam gösterilir.</span>
          </div>
          ${previewPagesHtml}
        </main></body>
      </html>
    `;

  } catch (error) {

    $("pdfFrame").srcdoc = `
      <html>
        <body style="font-family:Arial,sans-serif;background:#f4f5f7;margin:0;height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;color:#111;">
          <div style="padding:24px;">
            <b>PDF önizleme hazırlanamadı.</b>
            <p style="opacity:.65;font-size:13px;">Lütfen Kapat butonuna basıp tekrar deneyin.</p>
          </div></body>
      </html>
    `;

  } finally {

    if (pdfClone && pdfClone.parentNode) {
      pdfClone.parentNode.removeChild(pdfClone);
    }

    if (button) {
      button.innerText = "CV PDF Önizleme Oluştur →";
      button.disabled = false;
    }

    isPdfGenerating = false;
  }
}


function closePdf() {
  $("pdfModal").style.display = "none";
  $("pdfFrame").removeAttribute("srcdoc");
  $("pdfFrame").removeAttribute("src");
  isPdfGenerating = false;

  const button = document.querySelector(".download");

  if (button) {
    button.disabled = false;
    button.innerText = "CV PDF Önizleme Oluştur →";
  }
}


/* =====================================================
   MOBILE HARDENING
===================================================== */

function markJsActive() {
  const badge = $("jsStatus");
  if (!badge) {
    return;
  }

  badge.innerText = "JS aktif";
  badge.classList.add("active");

  setTimeout(function() {
    badge.style.display = "none";
  }, 3500);
}

function bindMobileLiveEvents() {

  document.querySelectorAll("input, textarea, select").forEach(function(element) {

    if (element.dataset.mobileBound === "1") {
      return;
    }

    element.dataset.mobileBound = "1";

    element.addEventListener("input", update);
    element.addEventListener("change", update);
    element.addEventListener("keyup", update);
    element.addEventListener("blur", update);
    element.addEventListener("paste", function() {
      setTimeout(update, 0);
    });

  });

}

document.addEventListener("click", function(event) {

  const tab = event.target.closest(".tab[data-template]");

  if (!tab) {
    return;
  }

  setTemplate(tab.dataset.template, tab);

});

document.addEventListener("touchend", function(event) {

  const tab = event.target.closest(".tab[data-template]");

  if (!tab) {
    return;
  }

  setTemplate(tab.dataset.template, tab);

}, { passive: true });

document.addEventListener("DOMContentLoaded", function() {
  markJsActive();
  bindMobileLiveEvents();
  update();
});


/* =====================================================
   PAYTR AUTO PAYMENT + CLEAN PDF DOWNLOAD V1
   Çekirdek yapı korunur.
   Satın Al butonu temiz PDF'i oluşturur, backend'e gönderir,
   PayTR ödeme sayfasına yönlendirir.
===================================================== */

function safeTextValue(id, fallback) {
  const el = document.getElementById(id);
  if (!el) {
    return fallback || "";
  }
  return (el.value || el.textContent || "").trim() || (fallback || "");
}

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(",");
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const binary = atob(parts[1]);
  const len = binary.length;
  const u8 = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    u8[i] = binary.charCodeAt(i);
  }

  return new Blob([u8], { type: mime });
}

function blobToBase64(blob) {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader();
    reader.onloadend = function() {
      const result = String(reader.result || "");
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function createCleanPdfBlobForPayment() {
  update();

  const cv = document.getElementById("cv");
  if (!cv) {
    throw new Error("CV alanı bulunamadı.");
  }

  const pdfClone = cv.cloneNode(true);
  pdfClone.id = "cvPaymentCleanClone";

  pdfClone.style.position = "fixed";
  pdfClone.style.left = "-10000px";
  pdfClone.style.top = "0";
  pdfClone.style.width = "794px";
  pdfClone.style.height = "auto";
  pdfClone.style.minHeight = "1123px";
  pdfClone.style.maxHeight = "none";
  pdfClone.style.transform = "none";
  pdfClone.style.transformOrigin = "top left";
  pdfClone.style.margin = "0";
  pdfClone.style.marginBottom = "0";
  pdfClone.style.borderRadius = "0";
  pdfClone.style.boxShadow = "none";
  pdfClone.style.overflow = "visible";
  pdfClone.style.background = "#ffffff";
  pdfClone.style.border = "0";
  pdfClone.style.outline = "0";

  pdfClone.querySelectorAll(".watermark-grid").forEach(function(item) {
    item.remove();
  });

  pdfClone.querySelectorAll(".pdf-page-spacer").forEach(function(item) {
    item.remove();
  });

  const cleanStyle = document.createElement("style");
  cleanStyle.textContent = `
    #cvPaymentCleanClone,
    #cvPaymentCleanClone * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #cvPaymentCleanClone .watermark-grid {
      display: none !important;
    }
  `;
  pdfClone.prepend(cleanStyle);

  document.body.appendChild(pdfClone);

  try {
    await new Promise(function(resolve) {
      requestAnimationFrame(function() {
        requestAnimationFrame(resolve);
      });
    });

    if (typeof waitForImages === "function") {
      await waitForImages(pdfClone);
    }

    if (typeof applySmartPageBreaks === "function") {
      applySmartPageBreaks(pdfClone);
    }

    await new Promise(function(resolve) {
      requestAnimationFrame(function() {
        requestAnimationFrame(resolve);
      });
    });

    const realHeight = Math.max(pdfClone.scrollHeight, 1123);

    const canvas = await html2canvas(pdfClone, {
      scale: 2.2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: 794,
      height: realHeight,
      windowWidth: 794,
      windowHeight: realHeight
    });

    const jsPDFLib = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFLib) {
      throw new Error("jsPDF yüklenemedi.");
    }

    const pdf = new jsPDFLib("p", "mm", "a4");
    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const pageHeightPx = Math.round(canvas.width * (pageHeightMm / pageWidthMm));

    let pageAdded = false;

    for (let sourceY = 0; sourceY < canvas.height; sourceY += pageHeightPx) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - sourceY);

      if (sliceHeight < 80) {
        break;
      }

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx;

      const ctx = pageCanvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      ctx.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );

      const imgData = pageCanvas.toDataURL("image/jpeg", 0.92);

      if (pageAdded) {
        pdf.addPage();
      }

      pdf.addImage(imgData, "JPEG", 0, 0, pageWidthMm, pageHeightMm);
      pageAdded = true;
    }

    return pdf.output("blob");

  } finally {
    if (pdfClone && pdfClone.parentNode) {
      pdfClone.parentNode.removeChild(pdfClone);
    }
  }
}

async function goPay() {
  const acceptTerms = document.getElementById("acceptTerms");
  const acceptDigital = document.getElementById("acceptDigital");

if (!acceptTerms || !acceptTerms.checked) {
  window.location.href = "https://cvyaz.myshopify.com";
  return;
}

  if (!acceptDigital || !acceptDigital.checked) {
    alert("Dijital ürün iade koşulunu kabul etmelisiniz.");
    return;
  }

  const buyButton = document.querySelector(".buy");

  try {
    if (buyButton) {
      buyButton.disabled = true;
      buyButton.innerText = "Temiz PDF hazırlanıyor...";
    }

    const pdfBlob = await createCleanPdfBlobForPayment();
    const pdfBase64 = await blobToBase64(pdfBlob);

    const payload = {
      pdfBase64: pdfBase64,
      buyerName: safeTextValue("name", "CVYAZ Müşteri"),
      buyerEmail: safeTextValue("email", "musteri@example.com"),
      buyerPhone: safeTextValue("phone", "5551112233"),
      fileName: "cvyaz-temiz-cv.pdf"
    };

    if (buyButton) {
      buyButton.innerText = "Ödeme sayfası açılıyor...";
    }

    const response = await fetch("/api/paytr/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Ödeme başlatılamadı.");
    }

    window.location.href = "/payment.html?token=" + encodeURIComponent(result.token) + "&oid=" + encodeURIComponent(result.merchant_oid);

  } catch (error) {
    alert("Satın alma başlatılamadı: " + (error && error.message ? error.message : "Bilinmeyen hata"));

    if (buyButton) {
      buyButton.disabled = false;
      buyButton.innerText = "Satın Al / 59,99 TL";
    }
  }
}



/* =====================================================
   CVYAZ FORM DRAFT AUTOSAVE V7.0
   KVKK / sözleşme / gizlilik / iade sayfalarına gidip dönünce
   kullanıcının girdiği CV bilgileri kaldığı yerden devam eder.
===================================================== */
const CVYAZ_DRAFT_KEY = "cvyaz_form_draft_v71_session";
const CVYAZ_DRAFT_PERSIST_KEY = "cvyaz_form_draft_v71_legal_return";
const CVYAZ_LEGAL_RETURN_KEY = "cvyaz_legal_return_v71";
const CVYAZ_PREVIEW_STATE_KEY = "cvyaz_preview_cta_unlocked_v71";
const CVYAZ_LEGAL_SESSION_KEY = "cvyaz_legal_return_session_v73";
const CVYAZ_LEGACY_DRAFT_KEY = "cvyaz_form_draft_v67";
const CVYAZ_LEGACY_DRAFT_KEY_V70 = "cvyaz_form_draft_v70_legal_return";
const CVYAZ_LEGACY_SESSION_KEY_V70 = "cvyaz_form_draft_v70_session";
const CVYAZ_LEGACY_LEGAL_KEY_V70 = "cvyaz_legal_return_v70";
let CVYAZ_RESTORING_DRAFT = false;

const CVYAZ_DYNAMIC_SECTIONS = [
  { listId: "eduList", itemSelector: ".edu", add: function(){ addEdu(); } },
  { listId: "expList", itemSelector: ".exp", add: function(){ addExp(); } },
  { listId: "langList", itemSelector: ".lang", add: function(){ addLang(); } },
  { listId: "certList", itemSelector: ".cert", add: function(){ addCert(); } },
  { listId: "projectList", itemSelector: ".project", add: function(){ addProject(); } },
  { listId: "refList", itemSelector: ".ref", add: function(){ addRef(); } }
];

function cvyazIsDraftField(element) {
  if (!element || !element.matches || !element.matches("input, textarea, select")) {
    return false;
  }

  if (element.type === "file" || element.id === "photoInput" || element.id === "docInput") {
    return false;
  }

  if (element.closest("#cv") || element.closest(".pdf-modal")) {
    return false;
  }

  return true;
}

function cvyazReadField(element) {
  if (element.type === "checkbox" || element.type === "radio") {
    return !!element.checked;
  }
  return element.value || "";
}

function cvyazWriteField(element, value) {
  if (!element) {
    return;
  }

  if (element.type === "checkbox" || element.type === "radio") {
    element.checked = !!value;
    return;
  }

  element.value = value || "";
}


function cvyazGetSavedPhotoData() {
  const photo = document.getElementById("pPhoto");
  if (!photo) {
    return "";
  }

  const src = photo.getAttribute("src") || "";
  if (src.indexOf("data:image/") === 0) {
    return src;
  }

  return "";
}

function cvyazRestorePhotoData(photoData) {
  const photo = document.getElementById("pPhoto");
  const frame = document.getElementById("photoFrame");

  if (!photo || !frame || !photoData || String(photoData).indexOf("data:image/") !== 0) {
    return;
  }

  photo.src = photoData;
  frame.style.display = "block";
}

function cvyazIsPreviewCtaUnlocked() {
  const previewButton = document.querySelector(".download");
  return !!(previewButton && !previewButton.classList.contains("preview-locked"));
}

function cvyazRestorePreviewCtaState(draft) {
  let shouldUnlock = !!(draft && draft.ui && draft.ui.previewUnlocked);

  try {
    shouldUnlock = shouldUnlock || localStorage.getItem(CVYAZ_PREVIEW_STATE_KEY) === "1";
  } catch (error) {
    // storage kapalıysa sadece draft içindeki state kullanılır.
  }

  if (shouldUnlock) {
    unlockPreviewCta();
  }
}

function cvyazCollectItemValues(item) {
  return Array.from(item.querySelectorAll("input, textarea, select"))
    .filter(cvyazIsDraftField)
    .map(cvyazReadField);
}

function cvyazApplyItemValues(item, values) {
  const fields = Array.from(item.querySelectorAll("input, textarea, select")).filter(cvyazIsDraftField);
  fields.forEach(function(field, index) {
    cvyazWriteField(field, values && values[index]);
  });
}

function cvyazSaveDraft() {
  if (CVYAZ_RESTORING_DRAFT) {
    return;
  }

  try {
    const fixed = {};

    document.querySelectorAll("input[id], textarea[id], select[id]").forEach(function(element) {
      if (!cvyazIsDraftField(element)) {
        return;
      }
      fixed[element.id] = cvyazReadField(element);
    });

    const dynamic = {};

    CVYAZ_DYNAMIC_SECTIONS.forEach(function(section) {
      const list = document.getElementById(section.listId);
      if (!list) {
        return;
      }

      dynamic[section.listId] = Array.from(list.querySelectorAll(section.itemSelector)).map(cvyazCollectItemValues);
    });

    const draftPayload = JSON.stringify({
      fixed: fixed,
      dynamic: dynamic,
      ui: {
        previewUnlocked: cvyazIsPreviewCtaUnlocked()
      },
      photoData: cvyazGetSavedPhotoData(),
      savedAt: Date.now()
    });

    sessionStorage.setItem(CVYAZ_DRAFT_KEY, draftPayload);
    localStorage.setItem(CVYAZ_DRAFT_PERSIST_KEY, draftPayload);
  } catch (error) {
    // sessionStorage kapalıysa uygulama çalışmaya devam eder.
  }
}

function cvyazRestoreDraft() {
  let draft = null;

  try {
    draft = JSON.parse(sessionStorage.getItem(CVYAZ_DRAFT_KEY) || localStorage.getItem(CVYAZ_DRAFT_PERSIST_KEY) || "null");
  } catch (error) {
    draft = null;
  }

  if (!draft || (!draft.fixed && !draft.dynamic)) {
    return false;
  }

  CVYAZ_RESTORING_DRAFT = true;

  try {
    CVYAZ_DYNAMIC_SECTIONS.forEach(function(section) {
      const list = document.getElementById(section.listId);
      if (!list) {
        return;
      }

      list.innerHTML = "";
      const rows = draft.dynamic && Array.isArray(draft.dynamic[section.listId]) ? draft.dynamic[section.listId] : [];

      rows.forEach(function(values) {
        section.add();
        const item = list.querySelector(section.itemSelector + ":last-child");
        cvyazApplyItemValues(item, values);
      });
    });

    Object.keys(draft.fixed || {}).forEach(function(id) {
      cvyazWriteField(document.getElementById(id), draft.fixed[id]);
    });

    cvyazRestorePhotoData(draft.photoData);
    cvyazRestorePreviewCtaState(draft);
  } finally {
    CVYAZ_RESTORING_DRAFT = false;
  }

  return true;
}

function cvyazInstallDraftAutosave() {
  document.addEventListener("input", function(event) {
    if (cvyazIsDraftField(event.target)) {
      cvyazSaveDraft();
    }
  }, true);

  document.addEventListener("change", function(event) {
    if (cvyazIsDraftField(event.target)) {
      cvyazSaveDraft();
    }
  }, true);

  document.addEventListener("click", function(event) {
    if (event.target && event.target.matches && event.target.matches(".mini-btn.remove")) {
      setTimeout(cvyazSaveDraft, 0);
    }
  }, true);

  window.addEventListener("pagehide", cvyazSaveDraft);
  window.addEventListener("beforeunload", cvyazSaveDraft);
}

function cvyazMarkLegalNavigation() {
  try {
    cvyazSaveDraft();
    const now = String(Date.now());

    if (cvyazIsPreviewCtaUnlocked()) {
      localStorage.setItem(CVYAZ_PREVIEW_STATE_KEY, "1");
    }

    /*
      V7.3 kritik ayrım:
      localStorage tek başına güvenilir değil; eski oturumdan kalıp web ilk açılışta
      önizleme butonunu yanlışlıkla gösterebiliyordu.
      Bu yüzden yasal sayfaya gerçekten bu sekmeden gidildiğini sessionStorage ile işaretliyoruz.
    */
    sessionStorage.setItem(CVYAZ_LEGAL_SESSION_KEY, now);
    localStorage.setItem(CVYAZ_LEGAL_RETURN_KEY, now);
  } catch (error) {
    // storage kapalıysa sessiz geç.
  }
}

function cvyazInstallLegalLinkProtection() {
  document.addEventListener("click", function(event) {
    const link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) {
      return;
    }

    const href = (link.getAttribute("href") || "").toLowerCase();
    const isLegalLink = href.indexOf("kvkk") !== -1 ||
      href.indexOf("mesafeli-satis") !== -1 ||
      href.indexOf("iade") !== -1 ||
      href.indexOf("gizlilik") !== -1;

    if (isLegalLink) {
      cvyazMarkLegalNavigation();
    }
  }, true);
}

function cvyazShouldRestoreDraftAfterLegalPage() {
  try {
    const sessionMarker = Number(sessionStorage.getItem(CVYAZ_LEGAL_SESSION_KEY) || "0");
    const sessionMarkerFresh = sessionMarker && (Date.now() - sessionMarker < 1000 * 60 * 60 * 6);

    const ref = (document.referrer || "").toLowerCase();
    const refIsLegal = ref.indexOf("kvkk") !== -1 ||
      ref.indexOf("mesafeli-satis") !== -1 ||
      ref.indexOf("iade") !== -1 ||
      ref.indexOf("gizlilik") !== -1;

    /*
      Local marker tek başına restore sebebi olamaz.
      Aksi halde webde eski localStorage kalıntısı ilk açılışta Önizleme butonunu getirir.
      Restore yalnızca aynı sekmedeki yasal sayfa dönüşünde veya referrer yasal sayfaysa yapılır.
    */
    return !!(sessionMarkerFresh || refIsLegal);
  } catch (error) {
    return false;
  }
}

function cvyazClearStoredDraftForFreshVisit() {
  try {
    sessionStorage.removeItem(CVYAZ_DRAFT_KEY);
    localStorage.removeItem(CVYAZ_DRAFT_PERSIST_KEY);
    localStorage.removeItem(CVYAZ_PREVIEW_STATE_KEY);
    sessionStorage.removeItem(CVYAZ_LEGAL_SESSION_KEY);
    localStorage.removeItem(CVYAZ_LEGACY_DRAFT_KEY);
    localStorage.removeItem(CVYAZ_LEGACY_DRAFT_KEY_V70);
    sessionStorage.removeItem(CVYAZ_LEGACY_SESSION_KEY_V70);
    localStorage.removeItem(CVYAZ_LEGAL_RETURN_KEY);
    localStorage.removeItem(CVYAZ_LEGACY_LEGAL_KEY_V70);
    localStorage.removeItem(CVYAZ_LEGACY_LEGAL_KEY_V70);
  } catch (error) {
    // storage kapalıysa sessiz geç.
  }
}

function cvyazFinishLegalReturnRestore() {
  try {
    sessionStorage.removeItem(CVYAZ_LEGAL_SESSION_KEY);
    localStorage.removeItem(CVYAZ_LEGAL_RETURN_KEY);
  } catch (error) {
    // storage kapalıysa sessiz geç.
  }
}

/* =====================================================
   INITIALIZE
===================================================== */

const cvyazRestoreAfterLegalReturn = cvyazShouldRestoreDraftAfterLegalPage();

if (!cvyazRestoreAfterLegalReturn) {
  // V7.2: Site normal/temiz açılıyorsa eski CV bilgilerini ve önizleme CTA durumunu gösterme.
  // Ancak KVKK / sözleşme / gizlilik / iade sayfasından dönülüyorsa taslağı ve CTA durumunu koru.
  cvyazClearStoredDraftForFreshVisit();
  lockPreviewCta();
}

cvyazInstallDraftAutosave();
cvyazInstallLegalLinkProtection();

const cvyazDraftRestored = cvyazRestoreAfterLegalReturn ? cvyazRestoreDraft() : false;

if (cvyazDraftRestored) {
  cvyazFinishLegalReturnRestore();
}

if (!cvyazDraftRestored) {
  addEdu();
  addExp();
}

if (document.querySelectorAll("#eduList .edu").length === 0) {
  addEdu();
}

if (document.querySelectorAll("#expList .exp").length === 0) {
  addExp();
}

bindMobileLiveEvents();

markJsActive();

update();

cvyazSaveDraft();



/* =====================================================
   CVYAZ MOBILE START BUTTON VISIBLE FIX V6.3
   Kullanıcı form ile etkileşime girince mobil sabit önizleme CTA görünür.
===================================================== */
(function(){
  function isMobile(){
    return window.matchMedia && window.matchMedia("(max-width: 767px)").matches;
  }

  function showPreviewCta(){
    if(!isMobile()){ return; }
    document.body.classList.add("cvyaz-show-preview-cta");
  }

  function setupMobileCtaVisibility(){
    if(!isMobile()){
      if (document.querySelector(".download.preview-locked")) {
        document.body.classList.remove("cvyaz-show-preview-cta");
      }
      return;
    }

    if (document.querySelector(".download.preview-locked")) {
      document.body.classList.remove("cvyaz-show-preview-cta");
    }

    var formArea = document.querySelector(".app") || document.body;
    formArea.addEventListener("input", showPreviewCta, true);
    formArea.addEventListener("change", showPreviewCta, true);

    var photoButtons = document.querySelectorAll(".photo-btn, input[type='file']");
    photoButtons.forEach(function(btn){
      btn.addEventListener("click", function(){
        setTimeout(showPreviewCta, 700);
      }, true);
      btn.addEventListener("change", showPreviewCta, true);
    });
  }

  document.addEventListener("DOMContentLoaded", setupMobileCtaVisibility);
  window.addEventListener("load", setupMobileCtaVisibility);
})();



/* =====================================================
   CVYAZ MOBILE DATALIST / AUTOCOMPLETE FIRST TAP FIX V8.4
   Sorun: Mobil tarayıcıda Meslek/Pozisyon datalist seçimi açık kalınca
   ilk Önizleme dokunuşu bazen sadece öneri kutusunu/klavyeyi kapatıyor.
   Çözüm: Meslek alanında değer seçilince mobilde odağı güvenli şekilde kapat,
   butona basıldığında da aktif form odağını preview başlamadan kilitleme.
===================================================== */
(function() {

  function isMobileCvyaz() {
    return window.matchMedia && window.matchMedia("(max-width: 767px)").matches;
  }

  function safeBlurElement(el) {
    if (!el || typeof el.blur !== "function") { return; }
    try { el.blur(); } catch (e) {}
  }

  function selectedFromDatalist(input) {
    if (!input || !input.value) { return false; }
    const listId = input.getAttribute("list");
    if (!listId) { return false; }
    const list = document.getElementById(listId);
    if (!list) { return false; }
    const value = String(input.value).trim().toLowerCase();
    return Array.from(list.options).some(function(option) {
      return String(option.value || "").trim().toLowerCase() === value;
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    const jobInput = document.getElementById("job");

    if (jobInput) {
      jobInput.setAttribute("autocomplete", "off");
      jobInput.setAttribute("autocorrect", "off");
      jobInput.setAttribute("autocapitalize", "none");
      jobInput.setAttribute("spellcheck", "false");

      ["input", "change"].forEach(function(evtName) {
        jobInput.addEventListener(evtName, function() {
          if (!isMobileCvyaz()) { return; }

          if (selectedFromDatalist(jobInput) || jobInput.value.trim().length >= 3) {
            window.__cvyazMobileJustSelectedJob = true;

            setTimeout(function() {
              safeBlurElement(jobInput);
            }, 80);

            setTimeout(function() {
              window.__cvyazMobileJustSelectedJob = false;
            }, 900);
          }
        }, { passive: true });
      });
    }

    const previewButton = document.getElementById("previewCta");

    if (previewButton) {
      function hardPreview(event) {
        if (!isMobileCvyaz()) { return; }
        if (previewButton.classList.contains("preview-locked")) { return; }

        if (event && event.cancelable) { event.preventDefault(); }
        if (event && event.stopPropagation) { event.stopPropagation(); }
        if (event && event.stopImmediatePropagation) { event.stopImmediatePropagation(); }

        const active = document.activeElement;
        if (active && active !== document.body && typeof active.blur === "function") {
          safeBlurElement(active);
        }

        // Modalı aynı frame içinde açtır. Böylece ilk dokunuş görsel cevap verir.
        startPreviewPdf(event || window.event);
      }

      previewButton.addEventListener("touchstart", hardPreview, { passive: false, capture: true });
      previewButton.addEventListener("mousedown", hardPreview, { passive: false, capture: true });
    }
  });

})();


/* =====================================================
   CVYAZ MOBILE iOS KEYBOARD / ACCESSORY BAR ROOT FIX V8.6
   Sorun: iOS Safari'de input aktifken klavyedeki ✓/Done bar ilk dokunuşu yutar.
   Çözüm: CTA'yı visualViewport ile klavyenin üstüne taşı, dokunuşu capture aşamasında
   yakala, modalı önce aç, sonra aktif input'u blur et, PDF üretimini başlat.
===================================================== */
(function() {
  if (window.__CVYAZ_MOBILE_KEYBOARD_PREVIEW_FIX_V86__) { return; }
  window.__CVYAZ_MOBILE_KEYBOARD_PREVIEW_FIX_V86__ = true;

  function isMobile() {
    return window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
  }

  function getPreviewBtn() {
    return document.getElementById('previewCta') || document.querySelector('.download');
  }

  function syncKeyboardInset() {
    if (!isMobile()) {
      document.documentElement.style.setProperty('--cvyaz-keyboard-inset', '0px');
      document.body && document.body.classList.remove('cvyaz-keyboard-open');
      return;
    }

    var inset = 0;
    if (window.visualViewport) {
      inset = Math.max(0, Math.round(window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop));
    }

    document.documentElement.style.setProperty('--cvyaz-keyboard-inset', inset + 'px');
    if (document.body) {
      document.body.classList.toggle('cvyaz-keyboard-open', inset > 80);
    }
  }

  function isEditable(el) {
    if (!el) { return false; }
    var tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
  }

  function safeBlurActive() {
    var active = document.activeElement;
    if (active && isEditable(active) && typeof active.blur === 'function') {
      try { active.blur(); } catch (e) {}
    }
  }

  function pointInsideButton(evt, btn) {
    if (!evt || !btn) { return false; }
    var p = null;
    if (evt.touches && evt.touches.length) { p = evt.touches[0]; }
    else if (evt.changedTouches && evt.changedTouches.length) { p = evt.changedTouches[0]; }
    else if (typeof evt.clientX === 'number') { p = evt; }
    if (!p) { return false; }
    var r = btn.getBoundingClientRect();
    var pad = 18;
    return p.clientX >= r.left - pad && p.clientX <= r.right + pad && p.clientY >= r.top - pad && p.clientY <= r.bottom + pad;
  }

  var lastRun = 0;

  function runPreviewNow(evt) {
    if (!isMobile()) { return; }
    var btn = getPreviewBtn();
    if (!btn || btn.classList.contains('preview-locked')) { return; }

    if (evt && evt.cancelable) { evt.preventDefault(); }
    if (evt && evt.stopPropagation) { evt.stopPropagation(); }
    if (evt && evt.stopImmediatePropagation) { evt.stopImmediatePropagation(); }

    var now = Date.now();
    if (now - lastRun < 1400) { return; }
    lastRun = now;

    try { if (typeof unlockPreviewCta === 'function') { unlockPreviewCta(); } } catch (e) {}

    // Kullanıcı ilk dokunuşta cevap görsün: önce modal/loading.
    try { if (typeof openPdfLoadingInstant === 'function') { openPdfLoadingInstant(); } } catch (e) {}

    // Klavye/accessory bar kapanışı artık preview'i yutmasın.
    setTimeout(safeBlurActive, 0);
    setTimeout(syncKeyboardInset, 30);

    // Asıl üretim: mevcut fonksiyona devret.
    setTimeout(function() {
      try {
        if (typeof startPreviewPdf === 'function') {
          startPreviewPdf(null);
        }
      } catch (err) {
        console.error('CVYAZ preview start error:', err);
        lastRun = 0;
      }
    }, 60);
  }

  function capturePreviewTouch(evt) {
    if (!isMobile()) { return; }
    var btn = getPreviewBtn();
    if (!btn || btn.classList.contains('preview-locked')) { return; }
    if (evt.currentTarget === btn || pointInsideButton(evt, btn)) {
      runPreviewNow(evt);
    }
  }

  function bind() {
    syncKeyboardInset();
    var btn = getPreviewBtn();
    if (btn) {
      btn.removeAttribute('onclick');
      btn.onclick = null;
      btn.style.touchAction = 'none';
      btn.style.webkitTapHighlightColor = 'transparent';
      ['touchstart', 'pointerdown', 'mousedown', 'click'].forEach(function(type) {
        btn.addEventListener(type, capturePreviewTouch, { passive: false, capture: true });
      });
    }

    // Bazı iOS durumlarında ilk dokunuş button'a değil document'e düşer; koordinattan yakala.
    ['touchstart', 'pointerdown'].forEach(function(type) {
      document.addEventListener(type, capturePreviewTouch, { passive: false, capture: true });
    });

    document.addEventListener('focusin', function() {
      setTimeout(syncKeyboardInset, 80);
      setTimeout(syncKeyboardInset, 250);
    }, true);
    document.addEventListener('focusout', function() {
      setTimeout(syncKeyboardInset, 80);
      setTimeout(syncKeyboardInset, 250);
    }, true);
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncKeyboardInset);
    window.visualViewport.addEventListener('scroll', syncKeyboardInset);
  }
  window.addEventListener('resize', syncKeyboardInset);
  window.addEventListener('orientationchange', function() { setTimeout(syncKeyboardInset, 300); });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
  window.addEventListener('load', function() { setTimeout(bind, 100); });
})();


/* =====================================================
   CVYAZ DESKTOP PREVIEW CLICK RESTORE V8.6.1
   V86 mobil iOS klavye fix'i web tarafında onclick'i temizlediği için
   masaüstünde Önizleme Oluştur butonu çalışmayabiliyordu.
   Mobil davranışa dokunmadan, sadece web/desktop click akışı geri bağlanır.
===================================================== */
(function() {
  if (window.__CVYAZ_DESKTOP_PREVIEW_CLICK_RESTORE_V861__) { return; }
  window.__CVYAZ_DESKTOP_PREVIEW_CLICK_RESTORE_V861__ = true;

  function isDesktopPreviewViewport() {
    return !(window.matchMedia && window.matchMedia('(max-width: 767px)').matches);
  }

  function getPreviewButton() {
    return document.getElementById('previewCta') || document.querySelector('.download');
  }

  function runDesktopPreview(event) {
    if (!isDesktopPreviewViewport()) { return; }

    var button = getPreviewButton();
    if (!button || button.classList.contains('preview-locked')) { return; }

    if (event && event.cancelable) { event.preventDefault(); }
    if (event && event.stopPropagation) { event.stopPropagation(); }

    if (typeof startPreviewPdf === 'function') {
      startPreviewPdf(event || window.event);
    }
  }

  function bindDesktopPreviewClick() {
    var button = getPreviewButton();
    if (!button || button.dataset.desktopPreviewRestore === '1') { return; }

    button.dataset.desktopPreviewRestore = '1';
    button.addEventListener('click', runDesktopPreview, { passive: false });
    button.addEventListener('mousedown', function(event) {
      if (!isDesktopPreviewViewport()) { return; }
      // Webde hover/click hissi korunsun; asıl işlem click'te başlar.
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindDesktopPreviewClick);
  } else {
    bindDesktopPreviewClick();
  }

  window.addEventListener('load', function() {
    setTimeout(bindDesktopPreviewClick, 100);
    setTimeout(bindDesktopPreviewClick, 600);
  });
})();

/* =====================================================
   CVYAZ TRUST MENU V95
   Hamburger menü aç/kapat. CV üretim çekirdeğine dokunmaz.
===================================================== */
(function() {
  if (window.__CVYAZ_TRUST_MENU_V95__) { return; }
  window.__CVYAZ_TRUST_MENU_V95__ = true;

  function setMenu(open) {
    var body = document.body;
    var btn = document.getElementById('hamburgerBtn');
    var menu = document.getElementById('sideMenu');
    var overlay = document.getElementById('menuOverlay');
    if (!body || !btn || !menu || !overlay) { return; }

    if (open) {
      overlay.hidden = false;
      requestAnimationFrame(function() { body.classList.add('menu-open'); });
      btn.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
    } else {
      body.classList.remove('menu-open');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      setTimeout(function() {
        if (!body.classList.contains('menu-open')) { overlay.hidden = true; }
      }, 240);
    }
  }

  function bindMenu() {
    var btn = document.getElementById('hamburgerBtn');
    var close = document.getElementById('menuClose');
    var overlay = document.getElementById('menuOverlay');
    var menu = document.getElementById('sideMenu');
    if (!btn || !close || !overlay || !menu || btn.dataset.boundTrustMenu === '1') { return; }

    btn.dataset.boundTrustMenu = '1';
    btn.addEventListener('click', function() { setMenu(!document.body.classList.contains('menu-open')); });
    close.addEventListener('click', function() { setMenu(false); });
    overlay.addEventListener('click', function() { setMenu(false); });
    menu.addEventListener('click', function(event) {
      var link = event.target && event.target.closest ? event.target.closest('a') : null;
      if (link) { setMenu(false); }
    });
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') { setMenu(false); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindMenu);
  } else {
    bindMenu();
  }
  window.addEventListener('load', bindMenu);
})();
