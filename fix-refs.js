#!/usr/bin/env node
/* Rewrites backward widget references that now appear BEFORE the widget
   (after repositioning) to point forward. Only touches the prose region
   before the widget. */
const fs = require("fs");
const path = require("path");
const SITE = path.join(__dirname, "site");

const FIXES = {
  "agent.html": [["You just watched that exact difference play out in the widget.", "You'll watch that exact difference play out in the widget below."]],
  "agents-sdk.html": [["That's what the widget had you do.", "That's what the widget below has you do."]],
  "cache.html": [["You just ran that kitchen.", "You're about to run that kitchen — in the widget below."]],
  "cli.html": [["And you just used one:", "And you're about to use one:"]],
  "commit.html": [["That's what you were doing in the widget.", "That's exactly what you'll do in the widget below."]],
  "embedding.html": [["The widget above is that same map", "The widget below is that same map"]],
  "env-file.html": [["you just watched a scanner bot find it", "in the widget below you'll watch a scanner bot find it"]],
  "harness.html": [["in the widget aren't a cute metaphor", "in the widget below aren't a cute metaphor"]],
  "kiss.html": [["You just tested both in the widget above.", "You'll test both in the widget below."]],
  "localhost.html": [["You just watched it happen.", "You'll watch it happen in the widget below."]],
  "mcp.html": [["You just lived both eras in the widget.", "You'll live both eras in the widget below."]],
  "oauth-agent-identity.html": [["You just watched the difference.", "You'll watch the difference in the widget below."]],
  "object-storage.html": [["That's the choice you just made in the widget.", "That's the choice you'll make in the widget below."]],
  "refactoring.html": [["That's what you just did to that function.", "That's what you're about to do in the widget below."]],
  "runtime.html": [["You just watched the software version of that.", "You'll watch the software version of that in the widget below."]],
  "sdk.html": [["You just watched that afternoon play out.", "You'll watch that afternoon play out in the widget below."]],
  "server.html": [["You just watched the difference.", "You'll watch the difference in the widget below."]],
  "session.html": [["That's the whole demo above.", "That's the whole demo below."]],
  "skill.html": [["Now look at what you just ran.", "That's what you'll run in the widget below."]],
  "slash-command.html": [["You just felt it in the widget:", "You'll feel it in the widget below:"]],
  "ssh.html": [["That's what you just did in the widget.", "That's what you'll do in the widget below."]],
  "token.html": [["You just watched the tokenizer above do exactly this to your own typing.", "The tokenizer in the widget below does exactly this to your own typing."]],
  "vibe-coding.html": [
    ["You just did it.", "You're about to do it."],
    ["The pomodoro timer in the widget is a real, running app.", "The pomodoro timer in the widget below is a real, running app."]
  ]
};

let applied = 0, missed = [];
for (const [file, pairs] of Object.entries(FIXES)) {
  const fp = path.join(SITE, file);
  let html = fs.readFileSync(fp, "utf8");
  const ps = html.indexOf('<article class="prose">');
  const w = html.indexOf('<section class="widget"', ps);
  if (ps === -1 || w === -1) { missed.push(file + ": structure"); continue; }
  let hook = html.slice(ps, w);
  for (const [find, replace] of pairs) {
    // whitespace-flexible match (source wraps lines)
    const re = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+"));
    if (!re.test(hook)) { missed.push(file + ": NOT FOUND: " + find.slice(0, 40)); continue; }
    hook = hook.replace(re, replace);
    applied++;
  }
  fs.writeFileSync(fp, html.slice(0, ps) + hook + html.slice(w));
}
console.log(`applied: ${applied} fixes`);
if (missed.length) { console.log("MISSED:"); missed.forEach((m) => console.log("  " + m)); process.exit(1); }
