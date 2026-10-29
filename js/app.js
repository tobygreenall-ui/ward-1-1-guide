// 1-1 Session Guide
// Everything typed lives only in the `state` object below, in this tab's memory.
// Nothing is written to storage, cookies or the network. Ending the session,
// closing the tab or 15 minutes without use clears it.

(function () {
  "use strict";

  const C = window.CONTENT;
  const IDLE_WARN_MS = 13 * 60 * 1000;
  const IDLE_CLEAR_MS = 15 * 60 * 1000;

  let state;
  let tick = null;
  let idleWarnTimer = null;
  let idleClearTimer = null;
  let breathingTimer = null;

  const app = document.getElementById("app");
  const topbar = document.getElementById("topbar");
  const pauseScreen = document.getElementById("pause");
  const modal = document.getElementById("modal");

  function freshState() {
    return {
      screen: "welcome",
      feelingStart: null,
      feelingEnd: null,
      duration: null,
      startedAt: null,
      halfwayShown: false,
      visited: [], // pathway ids in the order first opened
      answers: {}, // key -> string or array
      labels: {}, // key -> { label, pathway }
      goals: [
        { text: "", rating: null },
        { text: "", rating: null },
        { text: "", rating: null },
      ],
      pathway: null,
      topic: null,
      step: 0,
      nextTime: "",
      toolFeedback: "",
    };
  }

  // ---------- helpers ----------

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function pathwayById(id) {
    return C.pathways.find((p) => p.id === id);
  }

  function currentSteps() {
    const p = pathwayById(state.pathway);
    if (!p) return [];
    if (p.topics) {
      const t = p.topics.find((t) => t.id === state.topic);
      return t ? t.steps : [];
    }
    return p.steps;
  }

  function hasValue(v) {
    return Array.isArray(v) ? v.length > 0 : v != null && String(v).trim() !== "";
  }

  function remember(key, label, value) {
    state.answers[key] = value;
    if (!state.labels[key]) {
      const p = pathwayById(state.pathway);
      const t = p && p.topics ? p.topics.find((x) => x.id === state.topic) : null;
      state.labels[key] = { label: label, pathway: state.pathway, topic: t ? t.title : null };
    }
  }

  function minutesLeft() {
    if (!state.startedAt || !state.duration) return null;
    const elapsed = (Date.now() - state.startedAt) / 60000;
    return Math.ceil(state.duration - elapsed);
  }

  // ---------- top bar, timer, halfway check ----------

  function renderTopbar() {
    if (state.screen === "welcome" || state.screen === "cleared") {
      topbar.hidden = true;
      topbar.innerHTML = "";
      return;
    }
    topbar.hidden = false;
    const focus = state.answers.focus;
    const left = minutesLeft();
    let time = "";
    if (left != null) {
      time = left > 0 ? `${left} min left` : "Time's up";
    }
    topbar.innerHTML = `
      <div class="topbar-left">
        <button class="link-btn" data-action="menu" aria-label="Back to the list of choices">☰ Choices</button>
        ${hasValue(focus) ? `<span class="focus-pin" title="Our focus">Focus: ${esc(focus)}</span>` : ""}
      </div>
      <div class="topbar-right">
        ${time ? `<span class="timer" aria-live="off">${esc(time)}</span>` : ""}
        <button class="ghost-btn" data-action="pause">Put screen aside</button>
        <button class="ghost-btn" data-action="end">Finish</button>
      </div>`;
  }

  function startTick() {
    stopTick();
    tick = setInterval(() => {
      renderTopbar();
      const left = minutesLeft();
      if (!state.halfwayShown && left != null && left <= state.duration / 2 && state.screen === "step") {
        state.halfwayShown = true;
        toast("We're about halfway. Is this helping, or would you rather put the screen aside and just talk?", [
          { label: "Carry on" },
          { label: "Put screen aside", action: "pause" },
        ]);
      }
    }, 15000);
  }

  function stopTick() {
    if (tick) clearInterval(tick);
    tick = null;
  }

  function toast(text, buttons) {
    const el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    const btns = buttons || [{ label: "OK" }];
    el.innerHTML = `<span>${esc(text)}</span>${btns
      .map((b) => `<button class="link-btn" ${b.action ? `data-action="${esc(b.action)}"` : ""}>${esc(b.label)}</button>`)
      .join("")}`;
    el.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => el.remove()));
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 20000);
  }

  // ---------- idle clear ----------

  function resetIdle() {
    clearTimeout(idleWarnTimer);
    clearTimeout(idleClearTimer);
    if (state.screen === "welcome" || state.screen === "cleared") return;
    idleWarnTimer = setTimeout(showIdleWarning, IDLE_WARN_MS);
    idleClearTimer = setTimeout(clearSession, IDLE_CLEAR_MS);
  }

  function showIdleWarning() {
    openModal(`
      <h2>Are you still here?</h2>
      <p>This session will clear itself in 2 minutes to keep things private.</p>
      <div class="actions"><button class="primary-btn" data-action="close-modal">Keep going</button></div>`);
  }

  function openModal(html) {
    modal.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true">${html}</div>`;
    modal.hidden = false;
    const btn = modal.querySelector("button");
    if (btn) btn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    modal.innerHTML = "";
  }

  // ---------- screens ----------

  function render() {
    stopBreathing();
    renderTopbar();
    const fn = screens[state.screen];
    app.innerHTML = fn();
    afterRender();
    window.scrollTo(0, 0);
    const h = app.querySelector("h1, h2");
    if (h) {
      h.setAttribute("tabindex", "-1");
      h.focus({ preventScroll: true });
    }
  }

  const screens = {
    welcome() {
      return `
        <section class="card center">
          <p class="eyebrow">1-1 session</p>
          <h1>This is our time together</h1>
          <p class="lead">We can use it however is most helpful to you.</p>
          <p class="quiet">Nothing you type here is saved. It all clears when we finish.</p>
          <button class="primary-btn big" data-action="settle">Start</button>
          <p><button class="link-btn" data-action="using-well">For staff: using this well</button></p>
        </section>`;
    },

    settle() {
      const faces = C.feelings
        .map(
          (f) => `
          <button class="face ${state.feelingStart === f.value ? "selected" : ""}" data-action="feel-start" data-value="${f.value}" aria-pressed="${state.feelingStart === f.value}">
            <span class="face-emoji" aria-hidden="true">${f.face}</span><span>${esc(f.label)}</span>
          </button>`
        )
        .join("");
      const times = C.durations
        .map(
          (d) => `
          <button class="chip ${state.duration === d ? "selected" : ""}" data-action="duration" data-value="${d}" aria-pressed="${state.duration === d}">${d} minutes</button>`
        )
        .join("");
      return `
        <section class="card">
          <h1>Settling in</h1>
          <h2 class="q">How are you feeling right now?</h2>
          <div class="faces">${faces}
            <button class="face ${state.feelingStart === 0 ? "selected" : ""}" data-action="feel-start" data-value="0" aria-pressed="${state.feelingStart === 0}">
              <span class="face-emoji" aria-hidden="true">🤐</span><span>I'd rather not say</span>
            </button>
          </div>
          <h2 class="q">How long do we have?</h2>
          <div class="chips">${times}</div>
          <div class="actions">
            <button class="primary-btn" data-action="to-menu">Next</button>
          </div>
        </section>`;
    },

    menu() {
      const tiles = C.pathways
        .map(
          (p) => `
          <button class="tile ${state.visited.includes(p.id) ? "visited" : ""}" data-action="open" data-id="${p.id}">
            <span class="tile-icon" aria-hidden="true">${p.icon}</span>
            <span class="tile-text">${esc(p.tile)}</span>
          </button>`
        )
        .join("");
      return `
        <section>
          <h1 class="page-title">What would you like from today?</h1>
          <div class="tiles">${tiles}
            <button class="tile unsure" data-action="unsure">
              <span class="tile-icon" aria-hidden="true">🤔</span>
              <span class="tile-text">I'm not sure yet</span>
            </button>
          </div>
        </section>`;
    },

    unsure() {
      return `
        <section class="card">
          <h1>Let's work it out together</h1>
          <h2 class="q">Which of these sounds most like today?</h2>
          <div class="tiles small">
            <button class="tile" data-action="open" data-id="open"><span class="tile-text">I just want to talk</span></button>
            <button class="tile" data-action="open" data-id="stabilisation"><span class="tile-text">I'm feeling overwhelmed or on edge</span></button>
            <button class="tile" data-action="open" data-id="wardround"><span class="tile-text">I've got something coming up, like a ward round</span></button>
            <button class="tile" data-action="open" data-id="proms"><span class="tile-text">I want to work towards something</span></button>
            <button class="tile" data-action="open" data-id="community"><span class="tile-text">I'm thinking about going home</span></button>
            <button class="tile" data-action="open" data-id="safety"><span class="tile-text">Things have been feeling very hard</span></button>
          </div>
          <div class="actions"><button class="secondary-btn" data-action="menu">Back</button></div>
        </section>`;
    },

    topics() {
      const p = pathwayById(state.pathway);
      const items = p.topics
        .filter((t) => !t.hidden)
        .map((t) => {
          const done = t.steps.some((s) => s.note && hasValue(state.answers[s.note.key]));
          return `
          <button class="tile ${done ? "visited" : ""}" data-action="topic" data-id="${t.id}">
            <span class="tile-text">${esc(t.title)}</span>
            ${done ? '<span class="tick" aria-label="Talked about">✓</span>' : ""}
          </button>`;
        })
        .join("");
      return `
        <section class="card">
          <p class="eyebrow">${esc(p.icon)} ${esc(p.title)}</p>
          <h1>${esc(p.intro || "Choose a topic")}</h1>
          ${p.introLink ? `<p><a href="${esc(p.introLink.url)}" target="_blank" rel="noopener noreferrer">${esc(p.introLink.label)} ↗</a></p>` : ""}
          <div class="tiles small">${items}</div>
          ${p.credit ? `<p class="credit">${esc(p.credit)}</p>` : ""}
          <div class="actions"><button class="secondary-btn" data-action="menu">Back to choices</button></div>
        </section>`;
    },

    step() {
      const p = pathwayById(state.pathway);
      const steps = currentSteps();
      const s = steps[state.step];
      const last = state.step === steps.length - 1;
      const parts = [];

      parts.push(`<p class="eyebrow">${esc(p.icon)} ${esc(p.title)} <span class="progress">${state.step + 1} of ${steps.length}</span></p>`);
      if (state.step === 0 && p.clinician) parts.push(`<div class="clinician-note">${esc(p.clinician)}</div>`);
      if (state.step === 0 && p.text) parts.push(`<p class="quiet">${esc(p.text)}</p>`);
      parts.push(`<h1>${esc(s.title)}</h1>`);
      if (s.text) parts.push(`<p class="lead">${esc(s.text)}</p>`);
      if (s.carry) parts.push(renderCarry(s.carry));
      if (s.info)
        parts.push(
          `<div class="info-box"><h2 class="q small">${esc(s.info.title)}</h2>${s.info.text ? `<p>${esc(s.info.text)}</p>` : ""}${
            s.info.list ? `<ul>${s.info.list.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""
          }</div>`
        );
      if (s.prompts) parts.push(renderPrompts(s.prompts, state.step === 0));
      if (s.talk) parts.push(`<div class="talk-space" aria-hidden="true">🌿</div>`);
      if (s.widget === "breathing") parts.push(renderBreathing());
      if (s.widget === "grounding") parts.push(renderGrounding());
      if (s.goals) parts.push(renderGoals());
      if (s.links) parts.push(renderLinks(s.links));
      if (s.searchHints) parts.push(renderSearchHints(s.searchHints));
      if (s.choices) parts.push(renderChoices(s.choices));
      if (s.scale) parts.push(renderScale(s.scale));
      if (s.workbooks) parts.push(renderWorkbooks(s.workbooks));
      if (s.activities) parts.push(`<div class="info-box"><h2 class="q small">Ward activities you could join</h2><p>${esc(s.activities)}</p></div>`);
      if (s.note) parts.push(renderNote(s.note));
      if (s.crisis) parts.push(renderCrisis());
      if (s.review) parts.push(renderReview());
      if (s.branch)
        parts.push(
          `<div class="tiles small">${s.branch
            .map((b) => `<button class="tile" data-action="topic" data-id="${esc(b.topic)}"><span class="tile-text">${esc(b.label)}</span></button>`)
            .join("")}</div>`
        );
      if (s.offer && (!s.offer.pathway || s.offer.pathway !== state.pathway))
        parts.push(`<div class="offer"><button class="secondary-btn" data-action="open" data-id="${s.offer.pathway}">${esc(s.offer.label)} →</button></div>`);
      if (s.softOffer)
        parts.push(`<div class="offer soft"><p>${esc(s.softOffer.text)}</p><button class="secondary-btn" data-action="open" data-id="${s.softOffer.pathway}">${esc(s.softOffer.label)} →</button></div>`);
      if (last && p.credit && !p.topics) parts.push(`<p class="credit">${esc(p.credit)}</p>`);

      const back =
        state.step > 0
          ? `<button class="secondary-btn" data-action="prev">Back</button>`
          : `<button class="secondary-btn" data-action="${p.topics ? "to-topics" : "menu"}">Back</button>`;
      let forward;
      if (!last) {
        forward = `<button class="primary-btn" data-action="next">Next</button>`;
      } else if (p.topics) {
        forward = `<button class="secondary-btn" data-action="to-topics">Another topic</button><button class="primary-btn" data-action="menu">Done with this</button>`;
      } else {
        forward = `<button class="primary-btn" data-action="menu">Done with this</button>`;
      }
      return `<section class="card">${parts.join("")}<div class="actions spread">${back}<span class="actions">${forward}</span></div></section>`;
    },

    end() {
      const faces = C.feelings
        .map(
          (f) => `
          <button class="face ${state.feelingEnd === f.value ? "selected" : ""}" data-action="feel-end" data-value="${f.value}" aria-pressed="${state.feelingEnd === f.value}">
            <span class="face-emoji" aria-hidden="true">${f.face}</span><span>${esc(f.label)}</span>
          </button>`
        )
        .join("");
      const start = C.feelings.find((f) => f.value === state.feelingStart);
      return `
        <section class="card">
          <h1>Before we finish</h1>
          <h2 class="q">How are you feeling now?</h2>
          ${start ? `<p class="quiet">At the start you said: ${start.face} ${esc(start.label)}</p>` : ""}
          <div class="faces">${faces}</div>
          <h2 class="q">What next?</h2>
          <ul class="prompts">
            <li>What would you like to do before we next meet?</li>
            <li>What would you like to focus on next time?</li>
          </ul>
          <label class="note">
            <span class="note-label">Next steps</span>
            <textarea autocomplete="off" spellcheck="false" autocorrect="off" data-gramm="false" data-enable-grammarly="false" data-input="nextTime" rows="3">${esc(state.nextTime)}</textarea>
          </label>
          <h2 class="q">How was using this today?</h2>
          <div class="chips">${C.toolFeedback
            .map(
              (f) =>
                `<button class="chip ${state.toolFeedback === f ? "selected" : ""}" data-action="tool-feedback" data-value="${esc(f)}" aria-pressed="${state.toolFeedback === f}">${esc(f)}</button>`
            )
            .join("")}</div>
          <h2 class="q">Summary</h2>
          <p class="quiet">Copy this into the notes, email it, or print it for you to keep. It has no name or personal details on it.</p>
          <p class="quiet small-print">Email opens your email app with the summary filled in; nothing is sent until you press send there. Follow Trust policy on where you send it, for example an nhs.net address.</p>
          <div class="summary" id="summary">${renderSummaryHtml()}</div>
          <div class="actions spread no-print">
            <button class="secondary-btn" data-action="menu">Back to choices</button>
            <span class="actions">
              <button class="secondary-btn" data-action="copy">Copy summary</button>
              <button class="secondary-btn" data-action="email">Email summary</button>
              <button class="secondary-btn" data-action="print">Print</button>
              <button class="danger-btn" data-action="clear">End and clear session</button>
            </span>
          </div>
        </section>`;
    },

    cleared() {
      return `
        <section class="card center">
          <h1>Session cleared</h1>
          <p class="lead">Everything from that session has been removed from this screen.</p>
          <button class="primary-btn big" data-action="restart">Start a new session</button>
        </section>`;
    },
  };

  // ---------- step parts ----------

  // One opening question is shown; the rest stay folded away so the screen
  // offers a starting point rather than a list to read through.
  function renderPrompts(prompts, firstStep) {
    const [first, ...rest] = prompts;
    return `
      ${firstStep ? `<p class="quiet small-print">A starting point. Put it in your own words, or follow wherever the conversation goes.</p>` : ""}
      <ul class="prompts"><li>${esc(first)}</li></ul>
      ${
        rest.length
          ? `<details class="more-ideas"><summary>More ideas, if they help</summary><ul>${rest.map((q) => `<li>${esc(q)}</li>`).join("")}</ul></details>`
          : ""
      }`;
  }

  // Text boxes turn off spell-check, autocorrect, autofill and grammar add-ons:
  // some of these (for example Chrome's enhanced spell check, Microsoft Editor,
  // Grammarly) send typed words to a cloud service to check them.

  // Note boxes start closed so writing doesn't become the task; one that
  // already has words in it stays open.
  function renderNote(n) {
    const v = state.answers[n.key] || "";
    return `
      <details class="note-fold" ${hasValue(v) ? "open" : ""}>
        <summary>Write something down together</summary>
        <label class="note">
          <span class="note-label">${esc(n.label)}</span>
          <textarea autocomplete="off" spellcheck="false" autocorrect="off" data-gramm="false" data-enable-grammarly="false" data-note="${esc(n.key)}" data-label="${esc(n.label)}" rows="4" placeholder="In your own words (optional)">${esc(v)}</textarea>
        </label>
      </details>`;
  }

  function renderChoices(c) {
    const cur = state.answers[c.key];
    const selected = (o) => (c.multi ? Array.isArray(cur) && cur.includes(o) : cur === o);
    return `
      <div class="choices" role="group" aria-label="${esc(c.label || "Options")}">
        ${c.label ? `<h2 class="q small">${esc(c.label)}</h2>` : ""}
        <div class="chips">
          ${c.options
            .map(
              (o) =>
                `<button class="chip ${selected(o) ? "selected" : ""}" aria-pressed="${selected(o)}" data-choice="${esc(c.key)}" data-label="${esc(c.label || "")}" data-multi="${c.multi ? 1 : 0}" data-value="${esc(o)}">${esc(o)}</button>`
            )
            .join("")}
        </div>
      </div>`;
  }

  function renderScale(sc) {
    const v = state.answers[sc.key];
    return `
      <label class="scale">
        <span class="note-label">${esc(sc.label)}</span>
        <input type="range" min="${sc.min}" max="${sc.max}" value="${v == null ? Math.round((sc.min + sc.max) / 2) : v}" data-scale="${esc(sc.key)}" data-label="${esc(sc.label)}">
        <span class="scale-ends"><span>${esc(sc.minLabel)}</span><span>${esc(sc.maxLabel)}</span></span>
      </label>`;
  }

  function renderGoals() {
    return state.goals
      .map(
        (g, i) => `
        <div class="goal">
          <label class="note">
            <span class="note-label">Goal ${i + 1}${i > 0 ? " (optional)" : ""}</span>
            <input autocomplete="off" spellcheck="false" autocorrect="off" data-gramm="false" data-enable-grammarly="false" type="text" data-goal="${i}" value="${esc(g.text)}" placeholder="For example: sleep through most nights">
          </label>
          <label class="scale">
            <span class="note-label">Where are you now with this goal? <strong class="goal-value" id="goal-value-${i}">${g.rating == null ? "Not rated" : g.rating + " out of 10"}</strong></span>
            <input type="range" min="0" max="10" value="${g.rating == null ? 0 : g.rating}" data-goal-rating="${i}" aria-label="Goal ${i + 1} rating, 0 not at all met, 10 fully met">
            <span class="scale-ends"><span>0 Not at all met</span><span>10 Fully met</span></span>
          </label>
        </div>`
      )
      .join("");
  }

  function renderCarry(kind) {
    if (kind === "goals") {
      const goals = state.goals.filter((g) => hasValue(g.text));
      if (!goals.length) return "";
      return `<div class="info-box"><h2 class="q small">Your goals from earlier</h2><ul>${goals
        .map((g) => `<li>${esc(g.text)}${g.rating != null ? ` (${g.rating}/10)` : ""}</li>`)
        .join("")}</ul></div>`;
    }
    if (kind === "questions") {
      const q = state.answers["dx-questions"];
      if (!hasValue(q)) return "";
      return `<div class="info-box"><h2 class="q small">Your questions from earlier</h2><p class="pre">${esc(q)}</p></div>`;
    }
    return "";
  }

  function renderLinks(links) {
    return `<div class="links">${links
      .map((l) => `<a class="link-card" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>`)
      .join("")}</div>`;
  }

  function renderSearchHints(key) {
    const picks = state.answers[key];
    if (!Array.isArray(picks) || !picks.length) return "";
    return `<div class="info-box"><h2 class="q small">Things you said you'd like</h2><p>${picks.map(esc).join(" · ")}</p></div>`;
  }

  function renderWorkbooks(list) {
    return `<div class="info-box"><h2 class="q small">Workbooks in your folder</h2><ul>${list.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>
      <p class="quiet">You can also find them on the <a href="https://www.cnwl.nhs.uk/services/mental-health-services/cnwl-trauma-informed-approaches-tia" target="_blank" rel="noopener noreferrer">CNWL website ↗</a>.</p></div>`;
  }

  function renderCrisis() {
    return `<ul class="crisis">${C.crisis.map((c) => `<li><strong>${esc(c.label)}</strong><span>${esc(c.detail)}</span></li>`).join("")}</ul>`;
  }

  function renderReview() {
    const keys = ["care-area", "care-needs", "care-help", "care-how", "care-leaving"];
    const rows = keys.filter((k) => hasValue(state.answers[k]));
    if (!rows.length) return `<p class="quiet">Nothing has been written down yet. You can go back and add to any part.</p>`;
    return `<dl class="review">${rows
      .map((k) => `<dt>${esc(state.labels[k].label)}</dt><dd class="pre">${esc(fmt(state.answers[k]))}</dd>`)
      .join("")}</dl>`;
  }

  // ---------- widgets ----------

  function renderBreathing() {
    return `
      <div class="breathing">
        <div class="breath-circle" id="breath-circle"><span id="breath-label">Ready</span></div>
        <button class="secondary-btn" data-action="breathe">Start</button>
      </div>`;
  }

  function startBreathing(btn) {
    const circle = document.getElementById("breath-circle");
    const label = document.getElementById("breath-label");
    if (breathingTimer) {
      stopBreathing();
      btn.textContent = "Start";
      label.textContent = "Ready";
      return;
    }
    btn.textContent = "Stop";
    let inhale = true;
    const phase = () => {
      label.textContent = inhale ? "Breathe in" : "Breathe out";
      circle.className = "breath-circle " + (inhale ? "in" : "out");
      breathingTimer = setTimeout(
        () => {
          inhale = !inhale;
          phase();
        },
        inhale ? 4000 : 6000
      );
    };
    phase();
  }

  function stopBreathing() {
    if (breathingTimer) clearTimeout(breathingTimer);
    breathingTimer = null;
  }

  const GROUNDING = [
    { n: 5, sense: "things you can see" },
    { n: 4, sense: "things you can feel or touch" },
    { n: 3, sense: "things you can hear" },
    { n: 2, sense: "things you can smell" },
    { n: 1, sense: "thing you can taste, or one kind thing to say to yourself" },
  ];

  function renderGrounding() {
    return `
      <div class="grounding" id="grounding" data-index="0">
        <div class="ground-card" id="ground-card" aria-live="polite">
          <span class="ground-n">${GROUNDING[0].n}</span>
          <span class="ground-sense">${GROUNDING[0].sense}</span>
        </div>
        <button class="secondary-btn" data-action="ground-next">Next</button>
      </div>`;
  }

  function groundNext(btn) {
    const box = document.getElementById("grounding");
    let i = Number(box.dataset.index) + 1;
    const card = document.getElementById("ground-card");
    if (i >= GROUNDING.length) {
      card.innerHTML = `<span class="ground-sense">Well done. Take a moment to notice how you feel now.</span>`;
      btn.textContent = "Start again";
      i = -1;
    } else {
      card.innerHTML = `<span class="ground-n">${GROUNDING[i].n}</span><span class="ground-sense">${GROUNDING[i].sense}</span>`;
      btn.textContent = "Next";
    }
    box.dataset.index = String(i);
  }

  // ---------- summary ----------

  function fmt(v) {
    return Array.isArray(v) ? v.join(", ") : String(v);
  }

  function summaryData() {
    const sections = [];
    for (const id of state.visited) {
      const p = pathwayById(id);
      const items = [];
      if (id === "proms") {
        state.goals.forEach((g, i) => {
          if (hasValue(g.text)) items.push({ label: `Goal ${i + 1}`, value: g.text + (g.rating != null ? ` (now ${g.rating}/10)` : "") });
        });
      }
      for (const key of Object.keys(state.answers)) {
        const meta = state.labels[key];
        if (!meta || meta.pathway !== id || key === "nextTime") continue;
        if (!hasValue(state.answers[key])) continue;
        const label = meta.label || "Answer";
        items.push({ label: meta.topic ? `${meta.topic}: ${label}` : label, value: fmt(state.answers[key]) });
      }
      if (id === "safety") items.push({ label: "Emergency professional support", value: C.crisis.map((c) => `${c.label}: ${c.detail}`).join("\n") });
      sections.push({ title: p.title, items: items });
    }
    return sections;
  }

  function feelingText(v) {
    const f = C.feelings.find((x) => x.value === v);
    return f ? f.label : null;
  }

  function renderSummaryHtml() {
    const out = ['<h2 class="print-only">1-1 session summary</h2>'];
    const fs = feelingText(state.feelingStart);
    const fe = feelingText(state.feelingEnd);
    if (fs || fe) out.push(`<p><strong>Feeling:</strong> ${esc(fs || "not said")} at the start, ${esc(fe || "not said")} at the end</p>`);
    const secs = summaryData();
    if (!secs.length) out.push(`<p class="quiet">Nothing was chosen in this session.</p>`);
    for (const s of secs) {
      out.push(`<h3>${esc(s.title)}</h3>`);
      if (!s.items.length) out.push(`<p class="quiet">Talked about, nothing written down.</p>`);
      else out.push(`<dl>${s.items.map((i) => `<dt>${esc(i.label)}</dt><dd class="pre">${esc(i.value)}</dd>`).join("")}</dl>`);
    }
    if (hasValue(state.nextTime)) out.push(`<h3>Next steps</h3><p class="pre">${esc(state.nextTime)}</p>`);
    if (hasValue(state.toolFeedback)) out.push(`<p><strong>Using the app today:</strong> ${esc(state.toolFeedback)}</p>`);
    return out.join("");
  }

  function summaryText() {
    const lines = ["1-1 session summary"];
    const fs = feelingText(state.feelingStart);
    const fe = feelingText(state.feelingEnd);
    if (fs || fe) lines.push(`Feeling: ${fs || "not said"} at the start, ${fe || "not said"} at the end`);
    for (const s of summaryData()) {
      lines.push("", s.title.toUpperCase());
      if (!s.items.length) lines.push("Talked about, nothing written down.");
      for (const i of s.items) lines.push(`${i.label}: ${i.value}`);
    }
    if (hasValue(state.nextTime)) lines.push("", "NEXT STEPS", state.nextTime);
    if (hasValue(state.toolFeedback)) lines.push("", `Using the app today: ${state.toolFeedback}`);
    return lines.join("\n");
  }

  function copySummary(btn) {
    const text = summaryText();
    const done = () => {
      btn.textContent = "Copied";
      setTimeout(() => (btn.textContent = "Copy summary"), 2500);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  // Opens the device's email app with the summary as the message body. Some
  // email apps cut off long links, so the full text is also copied to the
  // clipboard and a long body is shortened with a note to paste it instead.
  const MAILTO_MAX_BODY = 1800;

  function emailSummary(btn) {
    const text = summaryText();
    let body = text;
    if (body.length > MAILTO_MAX_BODY) {
      body = body.slice(0, MAILTO_MAX_BODY) + "\n\n[Summary shortened. The full summary has been copied: paste it here to replace this text.]";
    }
    const open = () => {
      window.location.href = "mailto:?subject=" + encodeURIComponent("1-1 session summary") + "&body=" + encodeURIComponent(body);
      btn.textContent = "Email app opened";
      setTimeout(() => (btn.textContent = "Email summary"), 4000);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(open, () => copyThenOpen(text, open));
    } else {
      copyThenOpen(text, open);
    }
  }

  function copyThenOpen(text, open) {
    try {
      fallbackCopy(text, () => {});
    } catch (e) {
      // Copying is a convenience here; open the email app either way.
    }
    open();
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } finally {
      ta.remove();
    }
  }

  // ---------- navigation ----------

  function openPathway(id) {
    const p = pathwayById(id);
    if (!p) return;
    if (!state.visited.includes(id)) state.visited.push(id);
    state.pathway = id;
    state.topic = null;
    state.step = 0;
    state.screen = p.topics ? "topics" : "step";
    render();
  }

  function clearSession() {
    stopTick();
    stopBreathing();
    closeModal();
    pauseScreen.hidden = true;
    clearTimeout(idleWarnTimer);
    clearTimeout(idleClearTimer);
    state = freshState();
    state.screen = "cleared";
    document.querySelectorAll(".toast").forEach((t) => t.remove());
    render();
  }

  const actions = {
    settle() {
      state.screen = "settle";
      render();
    },
    "feel-start"(el) {
      state.feelingStart = Number(el.dataset.value);
      render();
    },
    "feel-end"(el) {
      state.feelingEnd = Number(el.dataset.value);
      render();
    },
    duration(el) {
      state.duration = Number(el.dataset.value);
      render();
    },
    "to-menu"() {
      if (!state.startedAt) state.startedAt = Date.now();
      startTick();
      state.screen = "menu";
      render();
    },
    menu() {
      state.screen = "menu";
      render();
    },
    unsure() {
      state.screen = "unsure";
      render();
    },
    open(el) {
      openPathway(el.dataset.id);
    },
    topic(el) {
      state.topic = el.dataset.id;
      state.step = 0;
      state.screen = "step";
      render();
    },
    "to-topics"() {
      state.screen = "topics";
      render();
    },
    next() {
      state.step = Math.min(state.step + 1, currentSteps().length - 1);
      render();
    },
    prev() {
      state.step = Math.max(state.step - 1, 0);
      render();
    },
    "tool-feedback"(el) {
      state.toolFeedback = state.toolFeedback === el.dataset.value ? "" : el.dataset.value;
      render();
    },
    "using-well"() {
      openModal(`
        <h2>Using this well</h2>
        <ul class="using-well">${C.usingWell.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        <div class="actions"><button class="primary-btn" data-action="close-modal">Got it</button></div>`);
    },
    pause() {
      pauseScreen.hidden = false;
      pauseScreen.querySelector("button").focus();
    },
    resume() {
      pauseScreen.hidden = true;
    },
    end() {
      state.screen = "end";
      render();
    },
    copy(el) {
      copySummary(el);
    },
    email(el) {
      emailSummary(el);
    },
    print() {
      window.print();
    },
    clear() {
      openModal(`
        <h2>End and clear this session?</h2>
        <p>Everything typed will be removed. Copy or print the summary first if you need it.</p>
        <div class="actions"><button class="secondary-btn" data-action="close-modal">Go back</button><button class="danger-btn" data-action="confirm-clear">Clear session</button></div>`);
    },
    "confirm-clear"() {
      clearSession();
    },
    "close-modal"() {
      closeModal();
    },
    restart() {
      state = freshState();
      state.screen = "settle";
      render();
    },
    breathe(el) {
      startBreathing(el);
    },
    "ground-next"(el) {
      groundNext(el);
    },
  };

  function afterRender() {
    // Keep the summary in step with what's typed on the end screen.
    const sum = document.getElementById("summary");
    if (sum) sum.innerHTML = renderSummaryHtml();
  }

  // ---------- events ----------

  document.addEventListener("click", (e) => {
    resetIdle();
    const choice = e.target.closest("[data-choice]");
    if (choice) {
      const key = choice.dataset.choice;
      const value = choice.dataset.value;
      if (choice.dataset.multi === "1") {
        const cur = Array.isArray(state.answers[key]) ? state.answers[key].slice() : [];
        const i = cur.indexOf(value);
        if (i >= 0) cur.splice(i, 1);
        else cur.push(value);
        remember(key, choice.dataset.label, cur);
      } else {
        remember(key, choice.dataset.label, state.answers[key] === value ? "" : value);
      }
      if (key === "still-on-focus" && value === "Let's change the focus") {
        state.step = 0;
        render();
        return;
      }
      const group = choice.closest(".chips");
      group.querySelectorAll("[data-choice]").forEach((b) => {
        const v = state.answers[key];
        const on = Array.isArray(v) ? v.includes(b.dataset.value) : v === b.dataset.value;
        b.classList.toggle("selected", on);
        b.setAttribute("aria-pressed", String(on));
      });
      return;
    }
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const fn = actions[el.dataset.action];
    if (fn) {
      e.preventDefault();
      fn(el);
    }
  });

  document.addEventListener("input", (e) => {
    resetIdle();
    const t = e.target;
    if (t.dataset.note) {
      remember(t.dataset.note, t.dataset.label, t.value);
      if (t.dataset.note === "focus") renderTopbar();
    } else if (t.dataset.input === "nextTime") {
      state.nextTime = t.value;
      afterRender();
    } else if (t.dataset.goal != null) {
      state.goals[Number(t.dataset.goal)].text = t.value;
    } else if (t.dataset.goalRating != null) {
      const i = Number(t.dataset.goalRating);
      state.goals[i].rating = Number(t.value);
      const out = document.getElementById("goal-value-" + i);
      if (out) out.textContent = t.value + " out of 10";
    } else if (t.dataset.scale) {
      remember(t.dataset.scale, t.dataset.label, t.value);
    }
  });

  document.addEventListener("keydown", (e) => {
    resetIdle();
    if (e.key === "Escape") {
      if (!modal.hidden) closeModal();
      else if (!pauseScreen.hidden) pauseScreen.hidden = true;
    }
  });

  state = freshState();
  render();
})();
