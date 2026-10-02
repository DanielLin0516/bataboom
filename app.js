// Bataboom! site. No third-party code, no tracking. Two jobs: the language menu (with a
// first-visit redirect on the home page from the browser's language) and the home page's
// Laces demo (tap to hit, mood gallery, video sound toggle).

(() => {
  const root = document.documentElement;
  const here = root.dataset.folder || "";          // "" = English at the root
  const page = root.dataset.page || "index";
  const KEY = "bataboom.lang";
  const supported = ["", "ja", "ko", "zh-hant", "zh-hans", "es", "fr"];

  function fromBrowser() {
    for (const tag of navigator.languages || [navigator.language || "en"]) {
      const t = String(tag).toLowerCase();
      if (t.startsWith("zh")) return /hant|-tw|-hk|-mo/.test(t) ? "zh-hant" : "zh-hans";
      const base = t.split(/[-_]/)[0];
      if (base === "en") return "";
      if (supported.includes(base)) return base;
    }
    return "";
  }

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  // First visit to the English home page: go to the visitor's language. Never for crawlers and
  // link previews (each language has its own URL and hreflang links), never once a visitor has
  // picked a language from the menu.
  const bot = /bot|crawl|spider|slurp|google|bing|duckduck|baidu|yandex|gpt|claude|anthropic|perplexity|facebookexternalhit|meta-external|twitterbot|linkedin|slack|discord|telegram|whatsapp|embedly|preview|lighthouse|headless|petal|sogou|naver|daum|yeti|seznam|qwant|ecosia|bytespider|amazonbot|applebot|ccbot|cohere|diffbot|you\.com|mistral/i.test(navigator.userAgent);
  if (!bot && saved === null && here === "" && page === "index") {
    const want = fromBrowser();
    if (want) { location.replace(want + "/" + location.hash); return; }
  }

  const menu = document.getElementById("lang");
  if (menu) {
    menu.querySelectorAll("a[data-folder]").forEach(a => {
      a.addEventListener("click", () => { try { localStorage.setItem(KEY, a.dataset.folder); } catch (e) {} });
    });
    document.addEventListener("click", e => { if (!menu.contains(e.target)) menu.open = false; });
    document.addEventListener("keydown", e => { if (e.key === "Escape") menu.open = false; });
  }

  if (document.getElementById("laces")) {
    if (window.Laces) home(); else addEventListener("DOMContentLoaded", home);
  }
})();

function home() {
  if (!window.Laces) return;
  const L = JSON.parse(document.getElementById("bb-i18n").textContent);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const box = document.getElementById("laces"), call = document.getElementById("call"), hint = document.getElementById("hint");
  let mood = "idle", gx = 0, gy = 0, blink = false, busy = false;
  const draw = () => { box.innerHTML = Laces.svg(mood, { gx, gy, blink, id: "hero" }); };
  draw();

  // Eyes follow the pointer while idle.
  addEventListener("pointermove", e => {
    if (mood !== "idle") return;
    const r = box.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const d = Math.max(1, Math.hypot(dx, dy));
    gx = dx / d * Math.min(1, d / 300); gy = dy / d * Math.min(1, d / 300);
    draw();
  });
  // Blink now and then.
  (function blinkLoop() {
    setTimeout(() => {
      if (mood === "idle") { blink = true; draw(); setTimeout(() => { blink = false; draw(); }, 130); }
      blinkLoop();
    }, 2200 + Math.random() * 2600);
  })();

  // The app's home-run calls by distance: 340 ft HOME RUN!, 400 BOMB!, 450 MOONSHOT!, 480 LIFTOFF!
  // Metres in Japanese, Korean and Chinese, as in the app.
  function callFor(ft) {
    return ft >= 480 ? L.calls.liftoff : ft >= 450 ? L.calls.moon : ft >= 400 ? L.calls.bomb : L.calls.hr;
  }
  function swing() {
    if (busy) return;
    busy = true; hint.textContent = L.again;
    mood = "contact"; draw();
    box.classList.remove("pop"); void box.offsetWidth; box.classList.add("pop");
    setTimeout(() => {
      const ft = 360 + Math.round(Math.random() * 140);
      const shown = L.unit === "m" ? Math.round(ft * 0.3048) : ft;
      mood = "homeRun"; draw();
      call.innerHTML = "";
      const big = document.createElement("span"); big.textContent = callFor(ft);
      const small = document.createElement("small"); small.textContent = shown + " " + L.unit;
      call.append(big, small);
      call.classList.add("on");
      if (!reduce) launch();
    }, 160);
    setTimeout(() => { call.classList.remove("on"); mood = "idle"; draw(); busy = false; }, 2200);
  }
  box.addEventListener("click", swing);

  // A ball arcs off toward the outfield with a gold trail.
  function launch() {
    const r = box.getBoundingClientRect();
    const b = document.createElement("div");
    b.className = "flyball";
    b.style.left = (r.left + r.width / 2) + "px"; b.style.top = (r.top + r.height * 0.4 + scrollY) + "px";
    document.body.appendChild(b);
    const dir = Math.random() < 0.5 ? -1 : 1;
    b.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dir * 180}px,-260px) scale(.6)`, opacity: 1, offset: .6 },
      { transform: `translate(${dir * 300}px,-330px) scale(.25)`, opacity: 0 }
    ], { duration: 1300, easing: "cubic-bezier(.2,.7,.4,1)" }).onfinish = () => b.remove();
  }

  // Mood gallery.
  const keys = ["ready", "contact", "homeRun", "strike", "wink", "sleep"];
  const g = document.getElementById("moods");
  keys.forEach((m, i) => {
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "mood";
    btn.innerHTML = Laces.svg(m, { id: "m" + i });
    const label = document.createElement("span"); label.textContent = L.moods[i];
    btn.appendChild(label);
    btn.addEventListener("click", () => {
      if (busy) return;
      mood = m; gx = gy = 0; draw();
      box.classList.remove("pop"); void box.offsetWidth; box.classList.add("pop");
      box.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      clearTimeout(btn._t); btn._t = setTimeout(() => { if (!busy) { mood = "idle"; draw(); } }, 2600);
    });
    g.appendChild(btn);
  });

  // Video sound toggle (videos may only autoplay muted).
  const v = document.getElementById("reel"), s = document.getElementById("sound");
  s.addEventListener("click", () => {
    v.muted = !v.muted;
    if (!v.muted) { v.currentTime = 0; v.play().catch(() => {}); }
    s.textContent = v.muted ? L.soundOn : L.soundOff;
    s.setAttribute("aria-pressed", String(!v.muted));
  });
  if (reduce) { v.removeAttribute("autoplay"); v.pause(); }
}
