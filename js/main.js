// ===== Daten: hier ändert der Wirt Zeiten und Mittagsmenü =====

// Öffnungszeiten in Minuten ab Mitternacht. 0 = Sonntag ... 6 = Samstag. null = Ruhetag
const HOURS = {
  0: [11 * 60, 15 * 60],
  1: null,
  2: [11 * 60, 22 * 60],
  3: [11 * 60, 22 * 60],
  4: [11 * 60, 22 * 60],
  5: [11 * 60, 22 * 60],
  6: [11 * 60, 22 * 60],
};

const LUNCH = {
  2: { soup: "Kürbiscremesuppe mit Kernöl", main: "Schweinsbraten mit Semmelknödel und warmem Krautsalat" },
  3: { soup: "Rindsuppe mit Grießnockerl", main: "Spinatknödel mit Bergkäse und brauner Butter" },
  4: { soup: "Klare Gemüsesuppe", main: "Gebratene Hühnerbrust mit Rahmpolenta und Saisongemüse" },
  5: { soup: "Steirische Klachlsuppe", main: "Gebackenes Forellenfilet mit Erdäpfelsalat" },
};

const DAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

// ===== Aktuelle Uhrzeit in Österreich (egal wo der Besucher ist) =====
function viennaNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Vienna",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (type) => parts.find((p) => p.type === type).value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));
  return { day, minutes };
}

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} Uhr` : `${h}:${String(m).padStart(2, "0")} Uhr`;
}

// ===== Live-Status im Hero ("Jetzt geöffnet bis 22 Uhr") =====
function updateStatus() {
  const el = document.getElementById("status");
  const { day, minutes } = viennaNow();
  const today = HOURS[day];

  el.classList.remove("is-open");

  if (today && minutes >= today[0] && minutes < today[1]) {
    el.textContent = `Jetzt geöffnet bis ${formatTime(today[1])}`;
    el.classList.add("is-open");
    return;
  }
  if (today && minutes < today[0]) {
    el.textContent = `Heute ab ${formatTime(today[0])} geöffnet`;
    return;
  }

  // Nächsten offenen Tag suchen
  for (let i = 1; i <= 7; i++) {
    const next = (day + i) % 7;
    if (HOURS[next]) {
      const when = i === 1 ? "morgen" : `am ${DAY_NAMES[next]}`;
      const prefix = today ? "Geschlossen" : `${DAY_NAMES[day]} Ruhetag`;
      el.textContent = `${prefix}, ${when} ab ${formatTime(HOURS[next][0])}`;
      return;
    }
  }
}

// ===== Heutigen Tag in der Tabelle hervorheben =====
function highlightToday() {
  const { day } = viennaNow();
  const row = document.querySelector(`#hours tr[data-day="${day}"]`);
  if (row) row.classList.add("today");
}

// ===== Mittagsmenü-Tabs =====
function setupLunchTabs() {
  const tabs = document.querySelectorAll(".tabs button");
  const soup = document.querySelector("#lunch-dish .soup");
  const main = document.querySelector("#lunch-dish .main");

  function show(day) {
    tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.day === String(day)));
    soup.textContent = LUNCH[day].soup;
    main.textContent = LUNCH[day].main;
  }

  tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.day)));

  // Automatisch den heutigen Tag zeigen (sonst Dienstag)
  const { day } = viennaNow();
  show(LUNCH[day] ? day : 2);
}

// ===== Handy-Menü =====
function setupNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.textContent = open ? "Schließen" : "Menü";
  });

  // Nach Klick auf einen Link Menü wieder schließen
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menü";
    })
  );
}

// ===== Start =====
document.getElementById("year").textContent = new Date().getFullYear();
setupNav();
setupLunchTabs();
updateStatus();
highlightToday();
setInterval(updateStatus, 60 * 1000); // jede Minute aktualisieren
