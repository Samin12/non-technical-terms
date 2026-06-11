/* ============================================================
   CLAUDE CLUB — shared runtime
   - Term registry (single source of truth for all 62 lessons)
   - Progress store (localStorage)
   - Nav / footer / pager / related-chips injection
   - Quiz engine
   - Index + Course Path renderers
   ============================================================ */

(function () {
  "use strict";

  /* ---------- topics ---------- */

  var TOPICS = [
    { name: "The Basics", desc: "Start here. The six words every builder uses daily." },
    { name: "How AI Works", desc: "What is actually happening inside the model." },
    { name: "Building With AI", desc: "From chatting with Claude to shipping with Claude." },
    { name: "Code & Collaboration", desc: "How code gets saved, shared, and improved." },
    { name: "APIs & Connections", desc: "Wiring your AI into every app you already use." },
    { name: "Shipping & Running", desc: "Putting your work live, and keeping it alive." },
    { name: "How Developers Think", desc: "The principles behind calm, clean building." }
  ];

  /* ---------- terms (course order = array order) ---------- */

  var TERMS = [
    // Level 1 — The Basics
    { s: "api", t: "API", d: "How your AI talks to other apps.", topic: 0, w: "Drive-thru simulator" },
    { s: "frontend-backend", t: "Frontend & Backend", d: "What you see, and what does the work.", topic: 0, w: "Restaurant x-ray" },
    { s: "cli", t: "CLI", d: "Talk straight to the computer. No clicking.", topic: 0, w: "Type-it-yourself terminal" },
    { s: "database", t: "Database", d: "A giant spreadsheet your software can query.", topic: 0, w: "Query race" },
    { s: "server", t: "Server", d: "A computer that never closes.", topic: 0, w: "Uptime switchboard" },
    { s: "localhost", t: "Localhost", d: "A website only you can see.", topic: 0, w: "Local vs. live switch" },

    // Level 2 — How AI Works
    { s: "token", t: "Token", d: "The chunks AI reads and writes in.", topic: 1, w: "Live tokenizer" },
    { s: "context-window", t: "Context Window", d: "How much your AI can hold in mind at once.", topic: 1, w: "The desk that fills up" },
    { s: "session", t: "Session", d: "One continuous conversation with your AI.", topic: 1, w: "Memory wipe demo" },
    { s: "compaction", t: "Compaction", d: "Summarizing the chat so it keeps fitting.", topic: 1, w: "Compact-o-meter" },
    { s: "hallucination", t: "Hallucination", d: "When AI sounds confident and is just wrong.", topic: 1, w: "Spot the made-up answer" },
    { s: "prompt-caching", t: "Prompt Caching", d: "Pay to read it once. Reuse it for cents.", topic: 1, w: "Cold vs. cached race" },
    { s: "embedding", t: "Embedding", d: "Meaning, turned into numbers.", topic: 1, w: "The meaning map" },
    { s: "vector-database", t: "Vector Database", d: "Search by meaning, not exact words.", topic: 1, w: "Vibe search" },

    // Level 3 — Building With AI
    { s: "agent", t: "Agent", d: "An AI that takes actions, not just answers.", topic: 2, w: "Watch the loop run" },
    { s: "system-prompt", t: "System Prompt", d: "The standing instructions your AI always follows.", topic: 2, w: "Personality switcher" },
    { s: "claude-md", t: "CLAUDE.md", d: "House rules your AI reads before it starts.", topic: 2, w: "House rules toggles" },
    { s: "skill", t: "Skill", d: "A saved SOP your AI follows on demand.", topic: 2, w: "Run the SOP" },
    { s: "slash-command", t: "Slash Command", d: "A shortcut that expands into a whole prompt.", topic: 2, w: "Type / and see" },
    { s: "mcp", t: "MCP", d: "A universal port for your AI's tools.", topic: 2, w: "Plug things in" },
    { s: "harness", t: "Harness", d: "The car built around the AI engine.", topic: 2, w: "Engine vs. car tour" },
    { s: "computer-use", t: "Computer Use", d: "AI that clicks and types like a person.", topic: 2, w: "Ghost cursor demo" },
    { s: "agents-sdk", t: "Agents SDK", d: "A starter kit for building your own AI worker.", topic: 2, w: "Assemble an agent" },
    { s: "voice-agents", t: "Voice Agents", d: "An agent you just talk to.", topic: 2, w: "The voice pipeline" },
    { s: "oauth-agent-identity", t: "OAuth & Agent Identity", d: "A valet key for your accounts. Not the master key.", topic: 2, w: "Key scope picker" },
    { s: "vibe-coding", t: "Vibe Coding", d: "Describe it. Let AI write the code.", topic: 2, w: "Prompt-to-app" },

    // Level 4 — Code & Collaboration
    { s: "git-version-control", t: "Git & Version Control", d: "Save points for your project.", topic: 3, w: "Save point timeline" },
    { s: "commit", t: "Commit", d: "A labeled snapshot you can return to.", topic: 3, w: "Snapshot camera" },
    { s: "branch", t: "Branch", d: "A safe copy to try changes on.", topic: 3, w: "Parallel timelines" },
    { s: "github", t: "GitHub", d: "Where your code lives and gets shared.", topic: 3, w: "Push & pull demo" },
    { s: "pull-request", t: "Pull Request", d: "A proposed change, put up for review.", topic: 3, w: "Review & merge" },
    { s: "open-source", t: "Open Source", d: "Code anyone can read, use, and improve.", topic: 3, w: "Fork the recipe" },
    { s: "markdown", t: "Markdown", d: "Plain text that formats itself.", topic: 3, w: "Live editor" },

    // Level 5 — APIs & Connections
    { s: "endpoint", t: "Endpoint", d: "One specific address on an API.", topic: 4, w: "The API building map" },
    { s: "http-methods", t: "HTTP Methods", d: "Get, create, update, delete. The verbs of the web.", topic: 4, w: "Verb playground" },
    { s: "rest-api", t: "REST API", d: "The rulebook most APIs follow.", topic: 4, w: "Order by the rules" },
    { s: "webhook", t: "Webhook", d: "An app that pings you the moment something happens.", topic: 4, w: "Doorbell vs. door-checking" },
    { s: "sdk", t: "SDK", d: "A toolkit for building on a service.", topic: 4, w: "Raw parts vs. the kit" },
    { s: "env-file", t: "Env File", d: "Where your secret keys live. Out of the code.", topic: 4, w: "Leak simulator" },

    // Level 6 — Shipping & Running
    { s: "deploy", t: "Deploy", d: "Push your work live for the world to use.", topic: 5, w: "Ship-it pipeline" },
    { s: "dns", t: "DNS", d: "The internet's phone book.", topic: 5, w: "Name lookup" },
    { s: "cdn", t: "CDN", d: "Copies of your site, close to every visitor.", topic: 5, w: "World ping map" },
    { s: "runtime", t: "Runtime", d: "Your code is not the program.", topic: 5, w: "Press run" },
    { s: "process", t: "Process", d: "A program that is actually running.", topic: 5, w: "Process spawner" },
    { s: "daemon", t: "Daemon", d: "Background helpers that never sleep.", topic: 5, w: "Services panel" },
    { s: "headless", t: "Headless", d: "Running with no screen, nobody watching.", topic: 5, w: "Screen off, work on" },
    { s: "cron-job", t: "Cron Job", d: "An alarm clock for tasks.", topic: 5, w: "Schedule builder" },
    { s: "worker", t: "Worker", d: "A small program that runs one job on demand.", topic: 5, w: "Job dispatcher" },
    { s: "queue", t: "Queue", d: "Order tickets for your software.", topic: 5, w: "The ticket rail" },
    { s: "job", t: "Job", d: "One ticket on the rail.", topic: 5, w: "Job lifecycle" },
    { s: "state", t: "State", d: "What your software remembers right now.", topic: 5, w: "Crash test" },
    { s: "cache", t: "Cache", d: "Keep the garlic on the counter.", topic: 5, w: "Speed race" },
    { s: "object-storage", t: "Object Storage", d: "A giant bucket for files on the internet.", topic: 5, w: "Drop it in the bucket" },
    { s: "serverless", t: "Serverless", d: "Rent computing by the moment.", topic: 5, w: "Pay-per-request meter" },
    { s: "edge", t: "Edge", d: "Code that runs close to your users.", topic: 5, w: "Latency test" },
    { s: "ssh", t: "SSH", d: "Drive one computer from another.", topic: 5, w: "Remote control terminal" },

    // Level 7 — How Developers Think
    { s: "kiss", t: "KISS", d: "Keep it simple. Skip the clever version.", topic: 6, w: "Simple vs. clever" },
    { s: "dry", t: "DRY", d: "Write it once. Reuse it everywhere.", topic: 6, w: "Fix the bug everywhere" },
    { s: "yagni", t: "YAGNI", d: "Don't build what you don't need yet.", topic: 6, w: "Feature creep game" },
    { s: "refactoring", t: "Refactoring", d: "Tidy the code. Change nothing it does.", topic: 6, w: "Tidy the kitchen" },
    { s: "technical-debt", t: "Technical Debt", d: "Shortcuts now. Interest later.", topic: 6, w: "The debt meter" },
    { s: "async", t: "Async", d: "Work that doesn't wait in line.", topic: 6, w: "Coffee shop simulator" }
  ];

  var BY_SLUG = {};
  TERMS.forEach(function (t, i) { t.n = i + 1; BY_SLUG[t.s] = t; });

  /* ---------- progress store ---------- */

  var KEY = "cc_progress_v1";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
  }
  function isDone(slug) { return !!load()[slug]; }
  function mark(slug, done) {
    var p = load();
    if (done) { p[slug] = Date.now(); } else { delete p[slug]; }
    save(p);
  }
  function doneCount() { return Object.keys(load()).filter(function (s) { return BY_SLUG[s]; }).length; }
  function firstNotDone() {
    for (var i = 0; i < TERMS.length; i++) { if (!isDone(TERMS[i].s)) return TERMS[i]; }
    return null;
  }

  /* ---------- tiny helpers ---------- */

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------- confetti ---------- */

  function sparks(x, y) {
    var glyphs = ["✳", "✦", "●", "✳"];
    for (var i = 0; i < 14; i++) {
      var s = document.createElement("span");
      s.className = "cc-spark";
      s.textContent = glyphs[i % glyphs.length];
      s.style.left = (x + (Math.random() * 140 - 70)) + "px";
      s.style.top = (y + (Math.random() * 30 - 40)) + "px";
      s.style.color = i % 3 === 0 ? "#6f8f67" : "#d97757";
      s.style.animationDelay = (Math.random() * 0.18) + "s";
      document.body.appendChild(s);
      setTimeout(function (n) { return function () { n.remove(); }; }(s), 1500);
    }
  }

  /* ---------- nav + footer ---------- */

  function renderNav(active) {
    var host = document.getElementById("cc-nav");
    if (!host) return;
    var done = doneCount();
    host.className = "nav";
    host.innerHTML =
      '<div class="nav-inner">' +
      '<a class="nav-logo" href="index.html"><span class="nav-spark">✳</span> Claude Club</a>' +
      '<div class="nav-links">' +
      '<a href="index.html"' + (active === "home" ? ' class="active"' : "") + ">Dictionary</a>" +
      '<a href="course.html"' + (active === "course" ? ' class="active"' : "") + ">Course Path</a>" +
      '<span class="nav-pill" id="cc-nav-pill">' + done + " / " + TERMS.length + " done</span>" +
      "</div></div>";
  }

  function renderFooter() {
    var host = document.getElementById("cc-footer");
    if (!host) return;
    host.className = "footer";
    host.innerHTML =
      '<span class="f-spark">✳</span>' +
      "<div><b>Claude Club</b> — tech terms for non-technical people. Learn by playing, not memorizing.</div>" +
      '<div class="f-links">' +
      '<a href="https://www.youtube.com/@saminyasar_" target="_blank" rel="noopener">YouTube</a>' +
      '<a href="https://x.com/saminXD" target="_blank" rel="noopener">X / Twitter</a>' +
      '<a href="course.html">Course Path</a>' +
      "</div>" +
      '<div class="f-note">Built by Samin Yasar. Claude Club is an independent community project and is not affiliated with Anthropic.</div>';
  }

  /* ---------- quiz engine ---------- */

  function initQuiz(quiz) {
    var qs = [].slice.call(quiz.querySelectorAll(".q"));
    var scoreEl = quiz.querySelector(".quiz-score");
    var answered = 0, correct = 0;

    function update() {
      if (scoreEl) scoreEl.textContent = answered === 0 ? qs.length + " questions" : correct + " / " + qs.length + " correct";
    }
    update();

    qs.forEach(function (q) {
      var opts = [].slice.call(q.querySelectorAll(".opt"));
      opts.forEach(function (opt) {
        opt.addEventListener("click", function () {
          if (q.classList.contains("answered")) return;
          q.classList.add("answered");
          answered++;
          var right = opt.hasAttribute("data-correct");
          if (right) {
            correct++;
            opt.classList.add("correct");
            var r = opt.getBoundingClientRect();
            sparks(r.left + r.width / 2, r.top);
          } else {
            opt.classList.add("wrong");
            var c = q.querySelector(".opt[data-correct]");
            if (c) c.classList.add("correct");
          }
          opts.forEach(function (o) { o.disabled = true; });
          update();
        });
      });
    });
  }

  /* ---------- lesson page boot ---------- */

  function initTerm() {
    var slug = document.body.getAttribute("data-slug");
    if (!slug || !BY_SLUG[slug]) return false;
    var term = BY_SLUG[slug];
    var topic = TOPICS[term.topic];

    renderNav("");
    renderFooter();

    // topic illustration
    var head = document.querySelector(".lesson-head");
    if (head && !head.querySelector(".lesson-art")) {
      var fig = el(
        '<figure class="lesson-art"><img src="img/topic-' + term.topic + '.jpg" alt="' +
        esc(topic.name) + ' illustration" loading="lazy" onerror="this.parentNode.style.display=\'none\'"></figure>'
      );
      head.insertBefore(fig, head.firstChild);
    }

    // topic label
    var label = document.getElementById("cc-topic-label");
    if (label) {
      label.innerHTML = esc(topic.name) + ' <span class="lesson-no">· Lesson ' + term.n + " of " + TERMS.length + "</span>";
    }

    // pager
    var pager = document.getElementById("cc-pager");
    if (pager) {
      var prev = TERMS[term.n - 2];
      var next = TERMS[term.n];
      pager.innerHTML =
        (prev
          ? '<a href="' + prev.s + '.html"><span>← Previous</span><b>' + esc(prev.t) + "</b></a>"
          : '<a class="disabled"><span>← Previous</span><b>Start</b></a>') +
        (next
          ? '<a class="next" href="' + next.s + '.html"><span>Next →</span><b>' + esc(next.t) + "</b></a>"
          : '<a class="next" href="course.html"><span>Finish →</span><b>Course Path</b></a>');
    }

    // related chips
    var rel = document.getElementById("cc-related");
    if (rel) {
      var slugs = (document.body.getAttribute("data-related") || "").split(",");
      var html = "";
      slugs.forEach(function (s) {
        s = s.trim();
        if (BY_SLUG[s]) html += '<a class="chip" href="' + s + '.html">' + esc(BY_SLUG[s].t) + "</a>";
      });
      rel.innerHTML = html;
    }

    // quizzes
    [].slice.call(document.querySelectorAll("[data-quiz]")).forEach(initQuiz);

    // complete bar
    var bar = document.getElementById("cc-complete-bar");
    if (bar) {
      var next2 = TERMS[term.n];
      bar.innerHTML =
        '<div class="cb-text"><b>Got it?</b>Mark this lesson complete to track your path.</div>' +
        '<div class="cb-actions">' +
        '<button class="btn-complete" id="cc-complete-btn"></button>' +
        (next2 ? '<a class="btn btn-ghost" href="' + next2.s + '.html">Next: ' + esc(next2.t) + " →</a>" : '<a class="btn btn-ghost" href="course.html">See your path →</a>') +
        "</div>";
      var btn = document.getElementById("cc-complete-btn");
      function paint() {
        var done = isDone(slug);
        btn.textContent = done ? "✓ Completed" : "Mark complete";
        btn.classList.toggle("done", done);
      }
      paint();
      btn.addEventListener("click", function () {
        if (isDone(slug)) { mark(slug, false); }
        else {
          mark(slug, true);
          var r = btn.getBoundingClientRect();
          sparks(r.left + r.width / 2, r.top);
        }
        paint();
        renderNav("");
      });
    }
    return true;
  }

  /* ---------- index renderer ---------- */

  function renderTopics() {
    var host = document.getElementById("cc-topics");
    if (!host) return false;
    var html = "";
    TOPICS.forEach(function (topic, ti) {
      var terms = TERMS.filter(function (t) { return t.topic === ti; });
      html +=
        '<section class="topic-block" id="topic-' + ti + '">' +
        '<div class="topic-head"><h2>' + esc(topic.name) + '</h2><span class="topic-count">' + terms.length + " lessons</span></div>" +
        '<p class="topic-desc">' + esc(topic.desc) + "</p>" +
        '<div class="term-grid">' +
        terms
          .map(function (t) {
            return (
              '<a class="term-card' + (isDone(t.s) ? " is-done" : "") + '" href="' + t.s + '.html">' +
              '<span class="tc-done">✓</span>' +
              "<b>" + esc(t.t) + "</b>" +
              "<span>" + esc(t.d) + "</span>" +
              '<span class="tc-meta">▶ ' + esc(t.w) + "</span>" +
              "</a>"
            );
          })
          .join("") +
        "</div></section>";
    });
    host.innerHTML = html;
    return true;
  }

  /* ---------- course path renderer ---------- */

  function renderCourse() {
    var host = document.getElementById("cc-course");
    if (!host) return false;

    var nextTerm = firstNotDone();
    var done = doneCount();

    // progress header
    var prog = document.getElementById("cc-course-progress");
    if (prog) {
      var pct = Math.round((done / TERMS.length) * 100);
      prog.innerHTML =
        "<span>" + done + " of " + TERMS.length + " lessons complete · " + pct + "%</span>" +
        '<div class="wmeter"><i style="width:' + pct + '%"></i></div>';
    }
    var cont = document.getElementById("cc-continue");
    if (cont) {
      if (nextTerm) {
        cont.href = nextTerm.s + ".html";
        cont.innerHTML = (done === 0 ? "Start Lesson 1: " : "Continue: Lesson " + nextTerm.n + " — ") + esc(nextTerm.t) + " →";
      } else {
        cont.href = "index.html";
        cont.textContent = "✓ Path complete — browse the dictionary";
      }
    }

    var html = "";
    TOPICS.forEach(function (topic, ti) {
      var terms = TERMS.filter(function (t) { return t.topic === ti; });
      var doneInLevel = terms.filter(function (t) { return isDone(t.s); }).length;
      var levelDone = doneInLevel === terms.length;
      html +=
        '<section class="level">' +
        '<div class="level-head' + (levelDone ? " done" : "") + '">' +
        '<span class="level-badge">' + (levelDone ? "✓ " : "") + "Level " + (ti + 1) + "</span>" +
        "<h2>" + esc(topic.name) + "</h2>" +
        '<span class="level-meta">' + doneInLevel + " / " + terms.length + "</span>" +
        "</div>" +
        '<div class="steps">' +
        terms
          .map(function (t) {
            var d = isDone(t.s);
            var isNext = nextTerm && nextTerm.s === t.s;
            return (
              '<a class="step' + (d ? " done" : "") + (isNext ? " next" : "") + '" href="' + t.s + '.html">' +
              '<span class="step-check">' + (d ? "✓" : t.n) + "</span>" +
              '<span class="step-body"><b>' + esc(t.t) + "</b><span>" + esc(t.d) + "</span></span>" +
              (isNext ? '<span class="step-tag">Up next</span>' : d ? '<span class="step-tag">Done</span>' : "") +
              "</a>"
            );
          })
          .join("") +
        "</div></section>";
    });
    host.innerHTML = html;
    return true;
  }

  /* ---------- boot ---------- */

  function boot() {
    var isTerm = initTerm();
    if (!isTerm) {
      renderNav(document.body.getAttribute("data-page") === "course" ? "course" : "home");
      renderFooter();
      renderTopics();
      renderCourse();
      [].slice.call(document.querySelectorAll("[data-quiz]")).forEach(initQuiz);
    }
  }

  window.CC = {
    TOPICS: TOPICS,
    TERMS: TERMS,
    bySlug: BY_SLUG,
    isDone: isDone,
    mark: mark,
    doneCount: doneCount,
    sparks: sparks
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
