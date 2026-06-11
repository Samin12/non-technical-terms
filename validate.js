#!/usr/bin/env node
/* Claude Club site validator — checks every lesson page against the app.js registry. */
const fs = require("fs");
const path = require("path");

const SITE = path.join(__dirname, "site");
const appjs = fs.readFileSync(path.join(SITE, "app.js"), "utf8");

// extract registry entries: { s: "api", t: "API", d: "...", topic: 0, w: "..." }
const termRe = /\{\s*s:\s*"([^"]+)",\s*t:\s*"([^"]+)",\s*d:\s*"([^"]+)",\s*topic:\s*(\d+),\s*w:\s*"([^"]+)"/g;
const terms = [];
let m;
while ((m = termRe.exec(appjs))) terms.push({ s: m[1], t: m[2], d: m[3], w: m[5] });

if (terms.length !== 62) {
  console.log(`FATAL: registry has ${terms.length} terms, expected 62`);
  process.exit(1);
}

const slugSet = new Set(terms.map((t) => t.s));
let errors = 0, warnings = 0;
const err = (f, msg) => { console.log(`  ERROR [${f}] ${msg}`); errors++; };
const warn = (f, msg) => { console.log(`  warn  [${f}] ${msg}`); warnings++; };

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

let present = 0;
for (const term of terms) {
  const file = `${term.s}.html`;
  const fp = path.join(SITE, file);
  if (!fs.existsSync(fp)) { console.log(`  MISSING ${file}`); errors++; continue; }
  present++;
  const html = fs.readFileSync(fp, "utf8");

  // data-slug
  const ds = html.match(/<body[^>]*data-slug="([^"]+)"/);
  if (!ds) err(file, "no data-slug on body");
  else if (ds[1] !== term.s) err(file, `data-slug "${ds[1]}" != slug`);

  // h1
  const h1 = html.match(/<h1>([\s\S]*?)<\/h1>/);
  if (!h1) err(file, "no h1");
  else if (decode(h1[1].trim()) !== term.t) err(file, `h1 "${h1[1].trim()}" != registry "${term.t}"`);

  // tldr
  const tldr = html.match(/<p class="tldr"><b>TLDR<\/b>([\s\S]*?)<\/p>/);
  if (!tldr) err(file, "no tldr");
  else if (decode(tldr[1].trim()) !== term.d) err(file, `tldr "${tldr[1].trim()}" != registry "${term.d}"`);

  // app.js include
  if (!html.includes('src="app.js"')) err(file, "missing app.js script");

  // quiz: exactly 3 data-correct, 3 .q blocks
  const correct = (html.match(/data-correct/g) || []).length;
  if (correct !== 3) err(file, `${correct} data-correct answers (want 3)`);
  const qs = (html.match(/class="q"/g) || []).length;
  if (qs !== 3) err(file, `${qs} .q blocks (want 3)`);
  if (!html.includes("data-quiz")) err(file, "no data-quiz");

  // placeholders app.js fills
  for (const id of ["cc-nav", "cc-footer", "cc-pager", "cc-related", "cc-complete-bar", "cc-topic-label"]) {
    if (!html.includes(`id="${id}"`)) err(file, `missing #${id}`);
  }

  // widget present
  if (!html.includes("widget-bar")) err(file, "no widget");

  // related slugs valid
  const rel = html.match(/data-related="([^"]*)"/);
  if (!rel) err(file, "no data-related");
  else {
    const rs = rel[1].split(",").map((s) => s.trim()).filter(Boolean);
    if (rs.length < 2) warn(file, `only ${rs.length} related slugs`);
    rs.forEach((r) => { if (!slugSet.has(r)) err(file, `bad related slug "${r}"`); });
  }

  // internal hrefs resolve
  const hrefs = [...html.matchAll(/href="([a-z0-9-]+\.html)"/g)].map((x) => x[1]);
  for (const h of new Set(hrefs)) {
    if (h === "index.html" || h === "course.html") continue;
    if (!slugSet.has(h.replace(".html", ""))) err(file, `dead link href="${h}"`);
  }

  // no external JS libs
  const ext = [...html.matchAll(/<script[^>]*src="(http[^"]+)"/g)];
  if (ext.length) err(file, `external script: ${ext[0][1]}`);

  // stray TODO / lorem
  if (/TODO|lorem ipsum|PLACEHOLDER/i.test(html)) warn(file, "TODO/lorem/placeholder text found");
}

// index + course basics
for (const f of ["index.html", "course.html"]) {
  const html = fs.readFileSync(path.join(SITE, f), "utf8");
  if (!html.includes('src="app.js"')) err(f, "missing app.js");
}
if (!fs.readFileSync(path.join(SITE, "index.html"), "utf8").includes('id="cc-topics"')) err("index.html", "missing #cc-topics");
if (!fs.readFileSync(path.join(SITE, "course.html"), "utf8").includes('id="cc-course"')) err("course.html", "missing #cc-course");

console.log(`\n${present}/62 lesson pages present · ${errors} errors · ${warnings} warnings`);
process.exit(errors ? 1 : 0);
