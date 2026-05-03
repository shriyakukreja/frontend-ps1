import { fillTemplate } from "./fillTemplate";

export function downloadPortfolio(template, data) {
  const finalHTML = fillTemplate(template, data);

  const blob = new Blob([finalHTML], { type: "text/html" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${data.name || "portfolio"}-portfolio.html`;
  link.click();
}