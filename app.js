/* ─────────────────────────────────────────────
   app.js  –  Resume → Portfolio Generator
   Works with both professional.html & creative.html
   ───────────────────────────────────────────── */

const API_ENDPOINT = "https://hack-backend-zl1d.onrender.com/api/upload";

/* ── DOM refs ─────────────────────────────── */
const resumeInput       = document.getElementById("resumeInput");
const uploadBtn         = document.getElementById("uploadBtn");
const loadingState      = document.getElementById("loadingState");
const errorState        = document.getElementById("errorState");
const errorMessage      = document.getElementById("errorMessage");

/* ── Upload button click ──────────────────── */
if (uploadBtn) {
  uploadBtn.addEventListener("click", () => {
    if (resumeInput) resumeInput.click();
  });
}

/* ── File selected → trigger upload ──────── */
if (resumeInput) {
  resumeInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showError("Please upload a valid PDF file.");
      return;
    }

    await uploadResume(file);
  });
}

/* ── Core upload + inject flow ────────────── */
async function uploadResume(file) {
  showLoading(true);
  hideError();

  try {
    const formData = new FormData();
    formData.append("resume", file);

    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    // 🔥 HANDLE NON-OK RESPONSES PROPERLY
    if (!res.ok) {
      let errText = "Server error";
      try {
        const errData = await res.json();
        errText = errData.error || errData.message || errText;
      } catch {}
      throw new Error(errText + ` (status: ${res.status})`);
    }

    // 🔥 HANDLE INVALID JSON SAFELY
    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error("Invalid response from server");
    }

    console.log("✅ Backend response:", data);

    // 🔥 SAFETY CHECK (VERY IMPORTANT)
    if (!data || !data.structuredData) {
      throw new Error("Backend did not return structured data");
    }

    injectData(data.structuredData);
    smoothReveal();

  } catch (err) {
    console.error("❌ Upload failed:", err.message);
    showError(err.message || "Something went wrong. Please try again.");
  } finally {
    showLoading(false);
  }
}

/* ── Inject JSON into the template ───────── */
function injectData(data) {
  if (!data) {
    showError("Empty data received from backend");
    return;
  }

  setText("name",    data.name    || "");
  setText("email",   data.email   || "");
  setText("summary", data.summary || "");

  const navLogo = document.querySelector(".nav-logo");
  if (navLogo) navLogo.textContent = data.name || "";

  document.querySelectorAll(".footer-name").forEach(el => {
    el.textContent = data.name || "";
  });

  const skillsContainer = document.getElementById("skillsContainer");
  if (skillsContainer) {
    skillsContainer.innerHTML = (data.skills || [])
      .map(skill => buildSkillTag(skill))
      .join("");
  }

  const projectsContainer = document.getElementById("projectsContainer");
  if (projectsContainer) {
    projectsContainer.innerHTML = (data.projects || [])
      .map(p => buildProjectCard(p))
      .join("");
  }

  const educationContainer = document.getElementById("educationContainer");
  if (educationContainer) {
    educationContainer.innerHTML = (data.education || [])
      .map(e => buildEducationRow(e))
      .join("");
  }

  const experienceContainer = document.getElementById("experienceContainer");
  if (experienceContainer) {
    experienceContainer.innerHTML = (data.experience || [])
      .map(ex => buildExperienceRow(ex))
      .join("");
  }

  const uploadSection = document.getElementById("uploadSection");
  const portfolioSection = document.getElementById("portfolioSection");

  if (uploadSection) uploadSection.style.display = "none";
  if (portfolioSection) portfolioSection.style.display = "";
}

/* ── Template builders ────────────────────── */

function buildSkillTag(skill) {
  const isPillTheme = document.querySelector(".pill, #skillsContainer .pills");
  const cls = isPillTheme ? "pill" : "skill-tag";
  return `<span class="${cls}">${escHtml(skill)}</span>`;
}

function buildProjectCard(project) {
  const techChips = (project.tech || [])
    .map(t => `<span class="chip">${escHtml(t)}</span>`)
    .join("");

  const isCreative = !!document.querySelector(".project-emoji");

  if (isCreative) {
    return `
      <div class="project-card reveal">
        <span class="project-emoji">🚀</span>
        <div class="project-title">${escHtml(project.title || "")}</div>
        <p class="project-desc">${escHtml(project.description || "")}</p>
        <div class="tech-chips">${techChips}</div>
      </div>`;
  }

  return `
    <div class="project-card">
      <h3>${escHtml(project.title || "")}</h3>
      <p>${escHtml(project.description || "")}</p>
      <div class="tech-tags">${techChips}</div>
    </div>`;
}

function buildEducationRow(edu) {
  return `
    <div class="row-item">
      <h3>${escHtml(edu.degree || "")}</h3>
      <p>${escHtml(edu.college || "")} • ${escHtml(edu.year || "")}</p>
    </div>`;
}

function buildExperienceRow(exp) {
  const bulletPoints = (exp.points || [])
    .map(pt => `<li>${escHtml(pt)}</li>`)
    .join("");

  return `
    <div class="row-item">
      <h3>${escHtml(exp.role || "")}</h3>
      <p>${escHtml(exp.company || "")} • ${escHtml(exp.duration || "")}</p>
      ${bulletPoints ? `<ul>${bulletPoints}</ul>` : ""}
    </div>`;
}

/* ── Helpers ──────────────────────────────── */

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showLoading(v) {
  if (loadingState) loadingState.style.display = v ? "flex" : "none";
  if (uploadBtn) uploadBtn.disabled = v;
}

function showError(msg) {
  if (errorMessage) errorMessage.textContent = msg;
  if (errorState) errorState.style.display = "block";
}

function hideError() {
  if (errorState) errorState.style.display = "none";
}

function smoothReveal() {
  const observer = new IntersectionObserver(entries =>
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("visible");
    })
  );

  document.querySelectorAll(".reveal").forEach(el =>
    observer.observe(el)
  );
}