export function fillTemplate(template, data) {
  let html = template;

  // Basic fields
  html = html.replace(/{{name}}/g, data.name || "");
  html = html.replace(/{{summary}}/g, data.summary || "");

  // Skills
  if (data.skills) {
    const skillsHTML = data.skills
      .map(skill => `<span class="pill">${skill}</span>`)
      .join("");
    html = html.replace("{{skills}}", skillsHTML);
  }

  // Projects
  if (data.projects) {
    const projectsHTML = data.projects
      .map(p => `
        <div class="project-card">
          <div class="project-title">${p.title}</div>
          <div class="project-desc">${p.description}</div>
        </div>
      `)
      .join("");
    html = html.replace("{{projects}}", projectsHTML);
  }

  // Education
  html = html.replace("{{education}}", data.education || "");

  // Experience
  html = html.replace("{{experience}}", data.experience || "");

  return html;
}