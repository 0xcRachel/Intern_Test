import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(dir, "../../..");
const output = path.join(dir, "ready");
fs.mkdirSync(output, { recursive: true });
const names = ["landing", "packages", "package-detail", "login", "register"];
for (const name of names) {
  let html = fs.readFileSync(path.join(dir, `${name}.raw.html`), "utf8");
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<link\b[^>]*>/gi, tag => {
    const href = tag.match(/href="([^"]+)"/)?.[1];
    if (tag.includes('rel="stylesheet"') && href?.startsWith("/assets/")) {
      const css = fs.readFileSync(path.join(dir, path.basename(href)), "utf8");
      return `<style>${css}</style>`;
    }
    if (tag.includes('rel="stylesheet"') && href?.startsWith("https://fonts.googleapis.com/")) return tag;
    return "";
  });
  html = html.replace(/(<img\b[^>]*\bsrc=")(\/[^"]+)(")/gi, (match, before, src, after) => {
    const filename = path.join(project, "frontend/public", src);
    if (!fs.existsSync(filename)) throw new Error(`Missing image: ${src}`);
    const mime = src.endsWith(".svg") ? "image/svg+xml" : src.endsWith(".jpg") ? "image/jpeg" : "image/png";
    return before + `data:${mime};base64,${fs.readFileSync(filename).toString("base64")}` + after;
  });
  html = html.replace(/<head>/i, `<head><meta name="viewport" content="width=device-width, initial-scale=1">`);
  html = html.replace(/<\/head>/i, `<style>
    /* Capture a settled static UI: no entrance animations or scroll locking. */
    *,*::before,*::after { animation:none!important; transition:none!important; }
    .page-enter,.reveal { opacity:1!important; transform:none!important; }
    html,body { overflow:visible!important; height:auto!important; }
  </style></head>`);
  if (/<script\b/i.test(html) || /(?:src|href)="\/assets\//i.test(html)) throw new Error(`Unbundled dependencies: ${name}`);
  fs.writeFileSync(path.join(output, `${name}.html`), "<!DOCTYPE html>\n" + html);
  console.log(`${name}.html: ${Buffer.byteLength(html)} bytes`);
}
fs.writeFileSync(path.join(output, "README.txt"),
`ExamPlatform — rendered FE snapshots, 2026-10-20
Source: the running application at http://localhost:8080.
Import landing.html first in html.to.design > File.
Set viewports to 1440px (desktop) and 390px (mobile), Light theme.
These are static DOM captures with embedded compiled CSS and local images.
Text, SVG icons and page layout are HTML, not a single screenshot.
Google Fonts requires network access; fallback fonts may differ if unavailable.
Login and registration fields are empty. No authentication tokens are included.
Protected student/admin screens are not included.
The landing page currently shows 0 units/0 documents, matching the running FE.
Figma conversion and visual fidelity still need verification after import.
`);
