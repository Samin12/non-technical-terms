#!/usr/bin/env node
/* Move each lesson's hero widget from above the prose to inside it,
   right before the first <h2> — so readers get the analogy/context first,
   then the interactive. Idempotent: skips pages already repositioned. */
const fs = require("fs");
const path = require("path");

const SITE = path.join(__dirname, "site");
const skip = new Set(["index.html", "course.html"]);
let moved = 0, already = 0, flagged = [];

for (const file of fs.readdirSync(SITE).filter((f) => f.endsWith(".html") && !skip.has(f))) {
  const fp = path.join(SITE, file);
  let html = fs.readFileSync(fp, "utf8");

  const headerEnd = html.indexOf("</header>");
  const proseStart = html.indexOf('<article class="prose">');
  if (headerEnd === -1 || proseStart === -1) { flagged.push(file + ": no header/prose"); continue; }

  // hero widget = first <section class="widget" between </header> and <article class="prose">
  const between = html.slice(headerEnd, proseStart);
  const wStart = between.indexOf('<section class="widget"');
  if (wStart === -1) { already++; continue; } // already repositioned (or no hero widget)

  const wEnd = between.indexOf("</section>", wStart);
  if (wEnd === -1) { flagged.push(file + ": unterminated widget"); continue; }
  const widget = between.slice(wStart, wEnd + "</section>".length);

  // sanity: widget must not contain a nested <section
  if (widget.indexOf("<section", 10) !== -1) { flagged.push(file + ": nested section in widget"); continue; }

  // remove widget (and surrounding blank lines) from between-block
  const newBetween =
    between.slice(0, wStart).replace(/\s+$/, "\n\n      ") + between.slice(wEnd + "</section>".length).replace(/^\s+/, "");

  html = html.slice(0, headerEnd) + newBetween + html.slice(proseStart);

  // insert widget before first <h2> inside the prose article
  const proseStart2 = html.indexOf('<article class="prose">');
  const proseEnd = html.indexOf("</article>", proseStart2);
  const h2 = html.indexOf("<h2", proseStart2);
  if (h2 === -1 || h2 > proseEnd) { flagged.push(file + ": no h2 in prose"); continue; }

  html = html.slice(0, h2) + widget + "\n\n        " + html.slice(h2);
  fs.writeFileSync(fp, html);
  moved++;
}

console.log(`moved: ${moved} · already-positioned/skipped: ${already}`);
if (flagged.length) { console.log("FLAGGED:"); flagged.forEach((f) => console.log("  " + f)); process.exit(1); }
