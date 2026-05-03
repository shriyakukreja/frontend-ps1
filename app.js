const API_BASE = "https://hack-backend-zl1d.onrender.com";

async function uploadResume() {
  const fileInput = document.getElementById("resumeInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Select a file");
    return;
  }

  const formData = new FormData();
  formData.append("resume", file);

  try {
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    console.log(data);

    renderData(data.structuredData);

  } catch (err) {
    console.error(err);
    alert("Upload failed");
  }
}

function renderData(data) {
  // simple example
  const container = document.getElementById("result");

  if (!container) return;

  container.innerHTML = `
    <h2>${data.name}</h2>
    <p>${data.email}</p>
    <h3>Skills</h3>
    <ul>${data.skills.map(s => `<li>${s}</li>`).join("")}</ul>
  `;
}