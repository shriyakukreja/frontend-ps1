/* ─────────────────────────────────────────────
   app.js  –  Resume → Portfolio Generator
   Works with both professional.html & creative.html
   ───────────────────────────────────────────── */
 
const API_ENDPOINT = "https://hack-backend-zl1d.onrender.com/";
 
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
 
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Server error: ${res.status}`);
    }
 
    const data = await res.json();
    injectData(data);
    smoothReveal();
  } catch (err) {
    showError(err.message || "Something went wrong. Please try again.");
  } finally {
    showLoading(false);
  }
}
 
/* ── Inject JSON into the template ───────── */
function injectData(data) {
  /* Basic fields */
  setText("name",    data.name    || "");
  setText("email",   data.email   || "");
  setText("summary", data.summary || "");
 
  /* Nav logo (creative template has this) */
  const navLogo = document.querySelector(".nav-logo");
  if (navLogo) navLogo.textContent = data.name || "";
 
  /* Footer name placeholder */
  document.querySelectorAll(".footer-name").forEach(el => {
    el.textContent = data.name || "";
  });
 
  /* Skills */
  const skillsContainer = document.getElementById("skillsContainer");
  if (skillsContainer) {
    skillsContainer.innerHTML = (data.skills || [])
      .map(skill => buildSkillTag(skill))
      .join("");
  }
 
  /* Projects */
  const projectsContainer = document.getElementById("projectsContainer");
  if (projectsContainer) {
    projectsContainer.innerHTML = (data.projects || [])
      .map(p => buildProjectCard(p))
      .join("");
  }
 
  /* Education */
  const educationContainer = document.getElementById("educationContainer");
  if (educationContainer) {
    educationContainer.innerHTML = (data.education || [])
      .map(e => buildEducationRow(e))
      .join("");
  }
 
  /* Experience */
  const experienceContainer = document.getElementById("experienceContainer");
  if (experienceContainer) {
    experienceContainer.innerHTML = (data.experience || [])
      .map(ex => buildExperienceRow(ex))
      .join("");
  }
 
  /* Show the portfolio, hide the upload section */
  const uploadSection = document.getElementById("uploadSection");
  const portfolioSection = document.getElementById("portfolioSection");
  if (uploadSection)  uploadSection.style.display  = "none";
  if (portfolioSection) portfolioSection.style.display = "";
}
 
/* ── Template builders ────────────────────── */
 
function buildSkillTag(skill) {
  /* Works for both .skill-tag (professional) and .pill (creative) */
  const isPillTheme = document.querySelector(".pill, #skillsContainer .pills");
  const cls = isPillTheme ? "pill" : "skill-tag";
  return `<span class="${cls}">${escHtml(skill)}</span>`;
}
 
function buildProjectCard(project) {
  const techChips = (project.tech || [])
    .map(t => `<span class="chip">${escHtml(t)}</span>`)
    .join("");
 
  /* Detect template style */
  const isCreative = !!document.querySelector(".project-emoji");
 
  if (isCreative) {
    return `
      <div class="project-card reveal">
        <span class="project-emoji">🚀</span>
        <div class="project-title">${escHtml(project.title || "")}</div>
        <p class="project-desc">${escHtml(project.description || "")}</p>
        <div class="tech-chips">${techChips}</div>
        <a href="#" class="project-link">
          View Project
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
      </div>`;
  }
 
  /* Professional template */
  const techTags = (project.tech || [])
    .map(t => `<span>${escHtml(t)}</span>`)
    .join("");
 
  return `
    <div class="project-card">
      <h3>${escHtml(project.title || "")}</h3>
      <p>${escHtml(project.description || "")}</p>
      <div class="tech-tags">${techTags}</div>
    </div>`;
}
 
function buildEducationRow(edu) {
  const isCreative = !!document.querySelector(".timeline");
 
  if (isCreative) {
    return `
      <div class="timeline-item reveal">
        <div class="timeline-dot"></div>
        <div class="timeline-period">${escHtml(edu.year || "")}</div>
        <div class="timeline-role">${escHtml(edu.degree || "")}</div>
        <div class="timeline-org">${escHtml(edu.college || "")}</div>
      </div>`;
  }
 
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
 
  const isCreative = !!document.querySelector(".timeline");
 
  if (isCreative) {
    return `
      <div class="timeline-item reveal">
        <div class="timeline-dot"></div>
        <div class="timeline-period">${escHtml(exp.duration || "")}</div>
        <div class="timeline-role">${escHtml(exp.role || "")}</div>
        <div class="timeline-org">${escHtml(exp.company || "")}</div>
        ${bulletPoints ? `<ul class="timeline-desc" style="padding-left:16px">${bulletPoints}</ul>` : ""}
      </div>`;
  }
 
  return `
    <div class="row-item">
      <h3>${escHtml(exp.role || "")}</h3>
      <p>${escHtml(exp.company || "")} • ${escHtml(exp.duration || "")}</p>
      ${bulletPoints ? `<ul style="margin-top:8px;padding-left:18px;color:#475569">${bulletPoints}</ul>` : ""}
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
 
function showLoading(visible) {
  if (loadingState) loadingState.style.display = visible ? "flex" : "none";
  if (uploadBtn)    uploadBtn.disabled = visible;
}
 
function showError(msg) {
  if (errorMessage) errorMessage.textContent = msg;
  if (errorState)   errorState.style.display = "block";
}
 
function hideError() {
  if (errorState) errorState.style.display = "none";
}
 
/* Smooth scroll-reveal for newly injected cards */
function smoothReveal() {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      }),
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}