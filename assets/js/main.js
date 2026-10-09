/* ==========================================================================
   Auto Komis Danek & Syn: logika strony (bez bibliotek)
   Oferta: assets/js/inventory.js albo niepublikowane zmiany z panelu admina (store.js)
   ========================================================================== */
(function () {
  "use strict";

  var C = window.DANEK_CONFIG;
  var B = C.business;
  var CARS = [];

  /* ---------- Narzędzia ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NBSP = "\u00A0";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touchDevice = window.matchMedia("(pointer: coarse)").matches;

  function fmt(n) {
    var v = Math.round(n);
    return (v < 0 ? "-" : "") + String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  }
  function zl(n) { return fmt(n) + NBSP + "zł"; }
  function km(n) { return fmt(n) + NBSP + "km"; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function plural(n, one, few, many) {
    n = Math.abs(n);
    if (n === 1) return one;
    var d = n % 10, h = n % 100;
    return d >= 2 && d <= 4 && (h < 12 || h > 14) ? few : many;
  }
  function decimal(n) { return String(n).replace(".", ","); }
  function carName(c) { return c.make + " " + c.model; }
  function icon(id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function median(arr) {
    var s = arr.slice().sort(function (a, b) { return a - b; });
    return s.length ? s[Math.floor((s.length - 1) / 2)] : 0;
  }
  function photos(c) {
    if (c.imageUrls && c.imageUrls.length) return c.imageUrls;
    if (c.images && c.images.length) return c.images.filter(function (r) { return !/^idb:/.test(r); });
    return c.image ? [c.image] : [];
  }

  // Polska typografia: jednoliterowe spójniki i przyimki nie zostają na końcu wiersza
  var ORPHAN = /(^|[\s(])([aiouwzAIOUWZ])\s+/g;
  function fixOrphans(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        return n.parentElement && !n.parentElement.closest("script,style,textarea,select,option")
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      var t = node.nodeValue;
      if (/(^|\s)[aiouwzAIOUWZ]\s/.test(t)) {
        node.nodeValue = t.replace(ORPHAN, "$1$2" + NBSP).replace(ORPHAN, "$1$2" + NBSP);
      }
    }
  }

  var toastTimer = 0;
  function toast(msg) {
    var el = $("[data-toast]");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 3200);
  }

  function scrollToEl(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* ---------- Oznaczenia aut ---------- */
  var FACT_FULL = {
    warranty: function (v) { return "Gwarancja " + v; },
    accidentFree: "Bezwypadkowy",
    firstOwner: "Pierwszy właściciel",
    aso: "Serwisowany w ASO",
    registeredPL: "Zarejestrowany w Polsce",
    inspection: function (v) { return "Przegląd ważny " + v; },
    originalPaint: "Oryginalny lakier",
    noSmoking: "Nie palono w aucie",
    twoKeys: "Dwa kluczyki"
  };
  var FACT_SHORT = {
    accidentFree: "Bezwypadkowy",
    firstOwner: "1. właściciel",
    aso: "Serwis w ASO",
    registeredPL: "Zarejestrowany w PL"
  };
  var CARD_FACT_ORDER = ["accidentFree", "firstOwner", "aso", "registeredPL"];
  var FUEL_SHORT = { "Hybryda plug-in": "Hybryda", "Benzyna + LPG": "LPG" };
  var GEAR_SHORT = { "Automatyczna": "Automat", "Manualna": "Manual" };

  function factLabel(key, val) {
    var f = FACT_FULL[key];
    return typeof f === "function" ? f(val) : f;
  }
  function carFlag(c) {
    return c.facts && c.facts.warranty ? "Gwarancja " + String(c.facts.warranty).replace("miesięcy", "mies.") : "";
  }
  function payment(principal, months, ratePct) {
    if (principal <= 0 || months <= 0) return 0;
    var r = ratePct / 100 / 12;
    if (r === 0) return principal / months;
    return principal * r / (1 - Math.pow(1 + r, -months));
  }
  function askText(c) {
    return "Dzień dobry, pytam o " + carName(c) + (c.version ? " " + c.version : "") + ", rocznik " + c.year + " (" + zl(c.price) + "), ogłoszenie ze strony internetowej.";
  }
  function smsHref(text) { return "sms:" + B.phone + "?&body=" + encodeURIComponent(text); }
  function mailHref(subject, text) { return "mailto:" + B.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text); }

  /* ---------- Teksty zależne od danych ---------- */
  function bindTexts() {
    var prices = CARS.map(function (c) { return c.price; });
    var n = CARS.length;
    var med = median(prices);

    $$('[data-bind="count"]').forEach(function (el) { el.textContent = n; });
    $$('[data-bind="pcc-example"]').forEach(function (el) {
      if (med) el.textContent = "Przy aucie za " + zl(med) + " to " + zl(med * 0.02) + " oszczędności.";
    });
    $$('[data-bind="year"]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    var R = C.reviews || {};
    if (R.rating) {
      $$('[data-bind="rating"]').forEach(function (el) { el.textContent = decimal(R.rating); });
      $$('[data-bind="rating-count"]').forEach(function (el) {
        el.textContent = R.count + " " + plural(R.count, "opinia", "opinie", "opinii");
      });
      $$("[data-stars]").forEach(function (el) { el.style.setProperty("--pct", (R.rating / 5 * 100).toFixed(1) + "%"); });
    } else {
      $$("[data-show-if-rating]").forEach(function (el) { el.hidden = true; });
    }

    $$("[data-link]").forEach(function (el) {
      var url = C.links[el.getAttribute("data-link")];
      if (url) el.href = url;
    });

    var social = $("[data-social]");
    if (social) {
      var NETS = [["facebook", "Facebook"], ["instagram", "Instagram"], ["youtube", "YouTube"], ["tiktok", "TikTok"]];
      social.innerHTML = NETS.filter(function (x) { return C.links[x[0]]; }).map(function (x) {
        return '<li><a href="' + esc(C.links[x[0]]) + '" target="_blank" rel="noopener" aria-label="' + x[1] + '">' + icon("i-" + x[0]) + "</a></li>";
      }).join("");
    }

  }

  /* ---------- Nagłówek i menu ---------- */
  function initHeader() {
    var header = $("[data-header]");
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 24); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var toggle = $(".menu-toggle"), nav = $("#site-nav");
    function setMenu(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Zamknij menu" : "Otwórz menu");
      nav.classList.toggle("is-open", open);
      document.documentElement.classList.toggle("menu-open", open);
    }
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    window.matchMedia("(min-width: 1101px)").addEventListener("change", function (e) { if (e.matches) setMenu(false); });

    if ("IntersectionObserver" in window) {
      var links = $$(".nav a[href^='#']");
      var map = {};
      links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && map[en.target.id]) {
            links.forEach(function (a) { a.removeAttribute("aria-current"); });
            map[en.target.id].setAttribute("aria-current", "true");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  /* ---------- Otwarte teraz (czas Polski) ---------- */
  var DAYS_ACC = ["w poniedziałek", "we wtorek", "w środę", "w czwartek", "w piątek", "w sobotę", "w niedzielę"];
  function warsawNow() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Warsaw", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var get = function (t) { var p = parts.find(function (x) { return x.type === t; }); return p ? p.value : ""; };
    var day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday"));
    return { day: day, minutes: (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10) };
  }
  function toMin(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function hhmm(t) { var p = t.split(":"); return +p[0] + ":" + p[1]; }
  function openStatus() {
    var now = warsawNow(), H = B.hours, today = H[now.day];
    if (today) {
      var o = toMin(today[0]), c = toMin(today[1]);
      if (now.minutes >= o && now.minutes < c) {
        var left = c - now.minutes;
        return { open: true, text: left <= 60 ? "Otwarte jeszcze " + left + " min" : "Otwarte do " + hhmm(today[1]) };
      }
      if (now.minutes < o) return { open: false, text: "Zamknięte. Otwieramy dziś o " + hhmm(today[0]) };
    }
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7;
      if (H[d]) return { open: false, text: "Zamknięte. Otwieramy " + (i === 1 ? "jutro" : DAYS_ACC[d]) + " o " + hhmm(H[d][0]) };
    }
    return { open: false, text: "Zamknięte" };
  }
  function updateStatus() {
    var s = openStatus(), day = warsawNow().day;
    $$("[data-status]").forEach(function (el) {
      el.setAttribute("data-state", s.open ? "open" : "closed");
      var t = $("[data-status-text]", el);
      if (t) t.textContent = s.text;
    });
    $$(".hours__table tr").forEach(function (tr) {
      tr.classList.toggle("is-today", +tr.getAttribute("data-day") === day);
    });
  }

  /* ---------- Oferta ---------- */
  var grid = $("[data-cars]");
  var filtersForm = $("[data-filters]");
  var state = { q: "", make: "", fuel: "", gear: "", max: "", sort: "default" };

  function uniq(arr) { return arr.filter(function (v, i) { return v && arr.indexOf(v) === i; }); }
  function fillSelect(sel, options) {
    options.forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = o[0]; opt.textContent = o[1];
      sel.appendChild(opt);
    });
  }
  function initFilters() {
    var makes = uniq(CARS.map(function (c) { return c.make; })).sort();
    fillSelect($("#f-make"), makes.map(function (m) {
      var n = CARS.filter(function (c) { return c.make === m; }).length;
      return [m, m + " (" + n + ")"];
    }));
    fillSelect($("#f-fuel"), uniq(CARS.map(function (c) { return c.fuel; })).map(function (f) { return [f, f]; }));
    fillSelect($("#f-gear"), uniq(CARS.map(function (c) { return c.gearbox; })).map(function (g) { return [g, g]; }));
    var minPrice = CARS.length ? Math.min.apply(null, CARS.map(function (c) { return c.price; })) : 0;
    fillSelect($("#f-max"), [30000, 40000, 50000, 70000, 100000, 150000]
      .filter(function (p) { return p > minPrice; })
      .map(function (p) { return [String(p), "do " + zl(p)]; }));

    var debounce;
    filtersForm.addEventListener("input", function (e) {
      var t = e.target;
      if (!t.name || t.tagName !== "INPUT") return;
      state[t.name] = t.value.trim();
      clearTimeout(debounce);
      debounce = setTimeout(renderCars, 140);
    });
    filtersForm.addEventListener("change", function (e) {
      if (e.target.name) { state[e.target.name] = e.target.value.trim(); renderCars(); }
    });
    $$("[data-reset-filters]").forEach(function (b) {
      b.addEventListener("click", function () {
        filtersForm.reset();
        state = { q: "", make: "", fuel: "", gear: "", max: "", sort: "default" };
        renderCars();
      });
    });
  }

  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l"); }
  function matches(c) {
    if (state.make && c.make !== state.make) return false;
    if (state.fuel && c.fuel !== state.fuel) return false;
    if (state.gear && c.gearbox !== state.gear) return false;
    if (state.max && c.price > +state.max) return false;
    if (state.q) {
      var hay = norm([c.make, c.model, c.version, c.body, c.fuel, c.color, c.year].join(" "));
      return norm(state.q).split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
    }
    return true;
  }
  function sorted(list) {
    var by = {
      "price-asc": function (a, b) { return a.price - b.price; },
      "price-desc": function (a, b) { return b.price - a.price; },
      "year-desc": function (a, b) { return b.year - a.year || a.price - b.price; },
      "km-asc": function (a, b) { return a.mileage - b.mileage; }
    }[state.sort];
    return by ? list.slice().sort(by) : list;
  }

  function cardHTML(c) {
    var flag = carFlag(c);
    var img = photos(c)[0];
    var lastSpec = c.gearbox ? ["Skrzynia", GEAR_SHORT[c.gearbox] || c.gearbox] : ["Nadwozie", c.body || "b.d."];
    var specs = [["Rok", c.year], ["Przebieg", km(c.mileage)], ["Paliwo", FUEL_SHORT[c.fuel] || c.fuel], lastSpec];
    var facts = CARD_FACT_ORDER.filter(function (k) { return c.facts && c.facts[k]; }).slice(0, 2);
    return '<article class="car">' +
      '<div class="car__media">' +
        (img
          ? '<img src="' + esc(img) + '" alt="' + esc(c.imageAlt || carName(c) + (c.color ? ", " + c.color.toLowerCase() : "")) + '" width="600" height="450" loading="lazy" decoding="async"' +
            (c.imagePos ? ' style="object-position:' + esc(c.imagePos) + '"' : "") + ">"
          : '<div class="car__noimg">Zdjęcia wkrótce</div>') +
        (flag ? '<span class="car__flag">' + esc(flag) + "</span>" : "") +
        (photos(c).length > 1 ? '<span class="car__count">' + icon("i-image") + photos(c).length + "</span>" : "") +
      "</div>" +
      '<div class="car__body">' +
        '<h3 class="car__title"><button class="car__open" type="button" data-open-car="' + esc(c.id) + '" aria-haspopup="dialog">' + esc(carName(c)) + "</button></h3>" +
        '<p class="car__version">' + esc(c.version || "\u00A0") + "</p>" +
        '<dl class="car__specs">' + specs.map(function (s) { return "<div><dt>" + s[0] + "</dt><dd>" + esc(s[1]) + "</dd></div>"; }).join("") + "</dl>" +
        (facts.length ? '<ul class="car__facts">' + facts.map(function (k) { return "<li>" + icon("i-check") + esc(FACT_SHORT[k]) + "</li>"; }).join("") + "</ul>" : "") +
        '<div class="car__foot">' +
          '<p class="plate plate--price">' + fmt(c.price) + "<small>zł</small></p>" +
          '<span class="car__more" aria-hidden="true">Szczegóły</span>' +
        "</div>" +
      "</div>" +
    "</article>";
  }

  function renderCars() {
    var list = sorted(CARS.filter(matches));
    grid.innerHTML = list.map(cardHTML).join("");
    fixOrphans(grid);
    $("[data-cars-empty]").hidden = list.length > 0;
    var filtered = state.q || state.make || state.fuel || state.gear || state.max;
    $("[data-results-count]").textContent = filtered
      ? "Pokazujemy " + list.length + " z " + CARS.length + " " + plural(CARS.length, "auta", "aut", "aut")
      : "Pokazujemy wszystkie auta: " + CARS.length;
    $(".filters__meta [data-reset-filters]").hidden = !filtered && state.sort === "default";
  }

  /* ---------- Szczegóły auta z galerią ---------- */
  var dlg = $("#car-dialog");
  var baseTitle = document.title;
  var lastFocus = null;
  var currentCar = null;
  var galIndex = 0;

  function dialogHTML(c) {
    var imgs = photos(c);
    var multi = imgs.length > 1;
    var specs = [
      ["Rok produkcji", c.year],
      ["Przebieg", km(c.mileage)],
      ["Paliwo", c.fuel],
      ["Pojemność", c.engine ? fmt(c.engine) + NBSP + "cm³" : ""],
      ["Moc", c.power ? c.power + NBSP + "KM" : ""],
      ["Skrzynia biegów", c.gearbox ? c.gearbox + (c.gearboxNote ? ", " + c.gearboxNote : "") : ""],
      ["Napęd", c.drive],
      ["Nadwozie", c.body],
      ["Kolor", c.color],
      ["Kraj pochodzenia", c.origin]
    ].filter(function (s) { return s[1]; });

    var facts = Object.keys(c.facts || {}).filter(function (k) { return c.facts[k] && FACT_FULL[k]; });
    var est = payment(c.price, C.financing.months, C.financing.rate);
    var priceMeta = [];
    if (c.negotiable) priceMeta.push("Cena do negocjacji");
    priceMeta.push("Faktura VAT-marża");
    var ask = touchDevice
      ? '<a class="btn btn--ghost" href="' + esc(smsHref(askText(c))) + '">' + icon("i-message") + "Wyślij SMS</a>"
      : '<a class="btn btn--ghost" href="' + esc(mailHref(carName(c) + " " + c.year + ": pytanie ze strony", askText(c))) + '">' + icon("i-mail") + "Napisz e-mail</a>";

    return '<div class="dlg">' +
      '<div class="dlg__media">' +
        '<figure class="dlg__photo">' +
          (imgs[0]
            ? '<img src="' + esc(imgs[0]) + '" alt="' + esc(c.imageAlt || carName(c)) + '" width="1600" height="1200"' + (c.imagePos ? ' style="object-position:' + esc(c.imagePos) + '"' : "") + ">"
            : '<div class="car__noimg">Zdjęcia wkrótce</div>') +
          (multi
            ? '<button class="gal__nav gal__nav--prev" type="button" data-gal="-1" aria-label="Poprzednie zdjęcie">' + icon("i-chev-l") + "</button>" +
              '<button class="gal__nav gal__nav--next" type="button" data-gal="1" aria-label="Następne zdjęcie">' + icon("i-chev-r") + "</button>" +
              '<span class="gal__count" aria-live="polite">1 / ' + imgs.length + "</span>"
            : "") +
        "</figure>" +
        (multi
          ? '<div class="gal__thumbs">' + imgs.map(function (u, i) {
              return '<button class="gal__thumb' + (i === 0 ? " is-active" : "") + '" type="button" data-gal-to="' + i + '" aria-label="Zdjęcie ' + (i + 1) + " z " + imgs.length + '"><img src="' + esc(u) + '" alt="" loading="lazy"></button>';
            }).join("") + "</div>"
          : "") +
        '<div class="dlg__where">' +
          "<h3>Gdzie obejrzeć</h3>" +
          "<p>" + esc(B.street) + ", " + esc(B.zip) + " " + esc(B.city) + '. <a href="' + esc(C.links.directions) + '" target="_blank" rel="noopener">Wyznacz trasę</a></p>' +
          '<p class="status" data-status><span class="status__dot" aria-hidden="true"></span><span data-status-text></span></p>' +
          "<p>Zadzwoń przed przyjazdem, przygotujemy auto do jazdy próbnej.</p>" +
        "</div>" +
      "</div>" +
      '<div class="dlg__main">' +
        '<div class="dlg__bar">' +
          '<p class="dlg__bar-title" aria-hidden="true">' + esc(carName(c)) + "<span>" + zl(c.price) + "</span></p>" +
          '<button class="dlg__close" type="button" data-close aria-label="Zamknij szczegóły">' + icon("i-close") + "</button>" +
        "</div>" +
        '<h2 class="dlg__title" id="dlg-title">' + esc(carName(c)) + "</h2>" +
        '<p class="dlg__version">' + esc(c.version ? c.version + ", " + c.year : String(c.year)) + "</p>" +
        '<div class="dlg__price">' +
          '<p class="plate plate--price">' + fmt(c.price) + "<small>zł</small></p>" +
          '<p class="dlg__price-meta">' + priceMeta.join("<br>") + "</p>" +
        "</div>" +
        (facts.length ? '<ul class="dlg__facts">' + facts.map(function (k) { return "<li>" + icon("i-check") + esc(factLabel(k, c.facts[k])) + "</li>"; }).join("") + "</ul>" : "") +
        '<div class="dlg__cta">' +
          '<a class="btn btn--gold" href="tel:' + esc(B.phone) + '">' + icon("i-phone") + "Zadzwoń</a>" +
          ask +
        "</div>" +
        '<p class="dlg__fin">Przykładowa rata: ok. ' + zl(est) + " miesięcznie przy " + C.financing.months + " ratach, bez wkładu własnego (symulacja). " +
          '<button class="link-btn" type="button" data-calc-car="' + esc(c.id) + '">Policz swój wariant</button></p>' +
        (c.description ? '<h3 class="dlg__h">Opis</h3><div class="dlg__desc">' + esc(c.description).split(/\n{2,}/).map(function (p) { return "<p>" + p.replace(/\n/g, "<br>") + "</p>"; }).join("") + "</div>" : "") +
        '<h3 class="dlg__h">Dane techniczne</h3>' +
        '<dl class="spec">' + specs.map(function (s) { return "<div><dt>" + s[0] + "</dt><dd>" + esc(s[1]) + "</dd></div>"; }).join("") + "</dl>" +
        (c.highlights && c.highlights.length
          ? '<h3 class="dlg__h">Wybrane wyposażenie</h3><ul class="equip">' + c.highlights.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + "</ul>"
          : "") +
        '<div class="dlg__tools">' +
          '<button class="btn btn--ghost btn--compact" type="button" data-share="' + esc(c.id) + '">' + icon("i-share") + "Wyślij komuś</button>" +
          (c.otomoto ? '<a class="btn btn--ghost btn--compact" href="' + esc(c.otomoto) + '" target="_blank" rel="noopener">' + icon("i-external") + "Ogłoszenie na Otomoto</a>" : "") +
        "</div>" +
        '<p class="dlg__legal">Informacja handlowa, nie oferta w rozumieniu art.' + NBSP + "66" + NBSP + "§" + NBSP + "1 Kodeksu cywilnego.</p>" +
      "</div>" +
    "</div>";
  }

  function showPhoto(i) {
    var imgs = currentCar ? photos(currentCar) : [];
    if (imgs.length < 2) return;
    galIndex = (i + imgs.length) % imgs.length;
    var img = $(".dlg__photo img", dlg);
    img.src = imgs[galIndex];
    img.style.objectPosition = galIndex === 0 && currentCar.imagePos ? currentCar.imagePos : "";
    var cnt = $(".gal__count", dlg);
    if (cnt) cnt.textContent = (galIndex + 1) + " / " + imgs.length;
    $$(".gal__thumb", dlg).forEach(function (t, k) {
      t.classList.toggle("is-active", k === galIndex);
      if (k === galIndex) {
        var strip = t.parentElement;
        var left = t.offsetLeft - (strip.clientWidth - t.clientWidth) / 2;
        strip.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
    var next = new Image();
    next.src = imgs[(galIndex + 1) % imgs.length];
  }

  function openCar(id, push) {
    var c = CARS.find(function (x) { return x.id === id; });
    if (!c) return;
    if (!dlg.open) lastFocus = document.activeElement;
    currentCar = c;
    galIndex = 0;
    dlg.classList.remove("is-scrolled");
    dlg.innerHTML = dialogHTML(c);
    fixOrphans(dlg);
    updateStatus();
    if (!dlg.open) {
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    }
    document.documentElement.classList.add("is-locked");
    dlg.scrollTop = 0;
    var main = $(".dlg__main", dlg);
    if (main) main.scrollTop = 0;
    var photo = $(".dlg__photo", dlg);
    var onScroll = function () {
      var mobile = window.matchMedia("(max-width: 860px)").matches;
      var y = mobile ? dlg.scrollTop : main.scrollTop;
      var limit = mobile ? (photo ? photo.offsetHeight - 64 : 200) : 70;
      dlg.classList.toggle("is-scrolled", y > limit);
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    dlg.onscroll = onScroll;
    onScroll();
    var closeBtn = $("[data-close]", dlg);
    if (closeBtn) closeBtn.focus();
    document.title = carName(c) + " " + c.year + " | " + B.name;
    var hash = "#auto-" + c.id;
    if (push !== false && location.hash !== hash) history.pushState({ car: c.id }, "", hash);
  }

  function closeDialog() { if (dlg.open) dlg.close(); }

  function initDialog() {
    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".car");
      if (!card) return;
      var btn = $("[data-open-car]", card);
      if (btn) openCar(btn.getAttribute("data-open-car"));
    });

    dlg.addEventListener("close", function () {
      document.documentElement.classList.remove("is-locked");
      document.title = baseTitle;
      if (/^#auto-/.test(location.hash)) {
        if (history.state && history.state.car) history.back();
        else history.replaceState(null, "", location.pathname + location.search);
      }
      if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    });

    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) {
        var r = dlg.getBoundingClientRect();
        var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (!inside) closeDialog();
      }
      if (e.target.closest("[data-close]")) closeDialog();
      var nav = e.target.closest("[data-gal]");
      if (nav) showPhoto(galIndex + +nav.getAttribute("data-gal"));
      var to = e.target.closest("[data-gal-to]");
      if (to) showPhoto(+to.getAttribute("data-gal-to"));
      var calcBtn = e.target.closest("[data-calc-car]");
      if (calcBtn) {
        var cid = calcBtn.getAttribute("data-calc-car");
        closeDialog();
        setTimeout(function () { selectCalcCar(cid); scrollToEl($("#finansowanie")); }, 80);
      }
      if (e.target.closest("[data-share]")) shareCar(currentCar);
    });

    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") showPhoto(galIndex + 1);
      if (e.key === "ArrowLeft") showPhoto(galIndex - 1);
    });

    // przesuwanie zdjęć palcem
    var startX = null;
    dlg.addEventListener("pointerdown", function (e) { startX = e.target.closest(".dlg__photo") ? e.clientX : null; });
    dlg.addEventListener("pointerup", function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) showPhoto(galIndex + (dx < 0 ? 1 : -1));
    });

    window.addEventListener("popstate", function () {
      var m = location.hash.match(/^#auto-(.+)$/);
      if (m) openCar(decodeURIComponent(m[1]), false);
      else closeDialog();
    });

    var m = location.hash.match(/^#auto-(.+)$/);
    if (m) openCar(decodeURIComponent(m[1]), false);
  }

  function shareCar(c) {
    if (!c) return;
    var url = location.href.split("#")[0] + "#auto-" + c.id;
    var data = { title: carName(c) + " | " + B.name, text: carName(c) + (c.version ? " " + c.version : "") + ", " + c.year + ", " + zl(c.price), url: url };
    if (navigator.share) {
      navigator.share(data).catch(function () {});
      return;
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(function () { toast("Link skopiowany. Wklej go w wiadomości."); }, function () { window.prompt("Skopiuj link do auta:", url); });
    } else {
      window.prompt("Skopiuj link do auta:", url);
    }
  }

  /* ---------- Kalkulator raty ---------- */
  var calc = $("[data-calc]");
  function setFill(range) {
    var p = (range.value - range.min) / (range.max - range.min) * 100;
    range.style.setProperty("--fill", p + "%");
  }
  function parsePrice() { return parseInt(String(calc.price.value).replace(/\D/g, ""), 10) || 0; }
  function parseRate() { return Math.min(30, Math.max(0, parseFloat(String(calc.rate.value).replace(",", ".").replace(/[^\d.]/g, "")) || 0)); }
  function calcValues() {
    var price = parsePrice();
    var downPct = +calc.down.value;
    var months = +calc.months.value;
    var rate = parseRate();
    var down = Math.round(price * downPct / 100);
    var principal = price - down;
    var pay = payment(principal, months, rate);
    return { price: price, downPct: downPct, down: down, months: months, rate: rate, principal: principal, pay: pay, total: pay * months };
  }
  function updateCalc() {
    var v = calcValues();
    var years = v.months / 12;
    var out = function (k) { return $('[data-out="' + k + '"]', calc); };
    out("down").textContent = zl(v.down) + " (" + v.downPct + "%)";
    out("months").textContent = v.months + " " + plural(v.months, "rata", "raty", "rat") + " (" + years + " " + plural(years, "rok", "lata", "lat") + ")";
    out("payment").textContent = fmt(v.pay);
    out("principal").textContent = zl(v.principal);
    out("total").textContent = zl(v.total);
    out("interest").textContent = zl(Math.max(0, v.total - v.principal));
    $$(".range", calc).forEach(setFill);
  }
  function selectCalcCar(id) {
    var sel = calc.car;
    sel.value = id;
    var c = CARS.find(function (x) { return x.id === id; });
    if (c) calc.price.value = fmt(c.price);
    updateCalc();
  }
  function initCalc() {
    if (!calc) return;
    var F = C.financing;
    var sel = calc.car;
    CARS.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c.id; o.textContent = carName(c) + ", " + c.year + " (" + zl(c.price) + ")";
      sel.appendChild(o);
    });
    var custom = document.createElement("option");
    custom.value = ""; custom.textContent = "Inna kwota";
    sel.appendChild(custom);

    calc.down.max = F.maxDownPct;
    calc.months.min = F.minMonths; calc.months.max = F.maxMonths; calc.months.value = F.months;
    calc.rate.value = decimal(F.rate);

    var mid = median(CARS.map(function (c) { return c.price; }));
    var start = CARS.find(function (c) { return c.price === mid; }) || CARS[0];
    if (start) selectCalcCar(start.id); else { sel.value = ""; calc.price.value = fmt(40000); updateCalc(); }

    sel.addEventListener("change", function () {
      if (sel.value) selectCalcCar(sel.value); else { calc.price.focus(); updateCalc(); }
    });
    calc.price.addEventListener("input", function () {
      var c = CARS.find(function (x) { return x.id === sel.value; });
      if (c && parsePrice() !== c.price) sel.value = "";
      updateCalc();
    });
    calc.price.addEventListener("blur", function () { calc.price.value = parsePrice() ? fmt(parsePrice()) : ""; });
    calc.rate.addEventListener("blur", function () { calc.rate.value = decimal(parseRate()); updateCalc(); });
    calc.addEventListener("input", function (e) { if (e.target !== calc.price) updateCalc(); });
  }

  /* ---------- Opinie klientów: płynnie przewijana taśma ---------- */
  function initReviews(list) {
    var Q = list || [];
    var box = $("[data-reviews]"), track = $("[data-reviews-track]");
    if (!box || !track) return;
    if (!Q.length) { box.hidden = true; return; }
    function card(q, clone) {
      var name = String(q.author || "Klient");
      return '<figure class="review"' + (clone ? ' aria-hidden="true"' : "") + ">" +
        '<div class="review__top">' + icon("i-quote") + (q.car ? '<span class="review__car">' + esc(q.car) + "</span>" : "") + "</div>" +
        "<blockquote><p>" + esc(q.text) + "</p></blockquote>" +
        '<figcaption><span class="review__avatar" aria-hidden="true">' + esc(name.charAt(0).toUpperCase()) + "</span>" +
          '<span class="review__who"><span class="review__name">' + esc(name) + '</span><span class="review__src">' + esc(q.source || "Opinia z Google") + "</span></span>" +
        "</figcaption>" +
      "</figure>";
    }
    // dwa komplety kart: po dojściu do końca pierwszego taśma niezauważalnie wraca na początek
    track.innerHTML = Q.map(function (q) { return card(q, false); }).join("") + Q.map(function (q) { return card(q, true); }).join("");
    fixOrphans(track);
    var cards = $$(".review", track);
    function loopWidth() { return cards[Q.length].offsetLeft - cards[0].offsetLeft; }
    function step() { return cards[1].offsetLeft - cards[0].offsetLeft; }

    var toggle = $("[data-rev-toggle]");
    var playing = !reduceMotion, hover = false, hold = false, inView = false;
    var pos = 0, last = 0, holdTimer = 0;
    if (reduceMotion && toggle) toggle.hidden = true;

    function holdFor(ms) {
      hold = true;
      clearTimeout(holdTimer);
      holdTimer = setTimeout(function () { hold = false; pos = track.scrollLeft; }, ms);
    }
    function frame(t) {
      var dt = last ? Math.min(64, t - last) : 0;
      last = t;
      if (playing && inView && !hover && !hold && !document.hidden) {
        pos += 32 * dt / 1000;
        var lw = loopWidth();
        if (lw > 0 && pos >= lw) pos -= lw;
        track.scrollLeft = pos;
      }
      requestAnimationFrame(frame);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }).observe(track);
    } else { inView = true; }

    track.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hover = true; });
    track.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { hover = false; pos = track.scrollLeft; } });
    track.addEventListener("focusin", function () { hover = true; });
    track.addEventListener("focusout", function () { hover = false; pos = track.scrollLeft; });
    ["touchstart", "wheel", "pointerdown"].forEach(function (ev) {
      track.addEventListener(ev, function () { holdFor(3000); }, { passive: true });
    });
    track.addEventListener("scroll", function () { if (hold || hover) pos = track.scrollLeft; }, { passive: true });

    $$("[data-rev]").forEach(function (b) {
      b.addEventListener("click", function () {
        holdFor(3500);
        var dir = +b.getAttribute("data-rev"), lw = loopWidth(), st = step();
        if (dir < 0 && track.scrollLeft < st) track.scrollLeft += lw;
        if (dir > 0 && track.scrollLeft + st >= lw) track.scrollLeft -= lw;
        track.scrollBy({ left: dir * st, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
    if (toggle) toggle.addEventListener("click", function () {
      playing = !playing;
      toggle.setAttribute("aria-pressed", String(!playing));
      toggle.setAttribute("aria-label", playing ? "Zatrzymaj przewijanie" : "Wznów przewijanie");
      pos = track.scrollLeft;
    });
    requestAnimationFrame(frame);
  }

  /* ---------- Poznaj naszą ofertę: film w tle ---------- */
  function initOfferVideo() {
    var v = $("[data-offer-video]");
    var src = C.media && C.media.offerVideo;
    if (!v) return;
    if (!src || reduceMotion) { v.remove(); return; }
    var started = false;
    function start() {
      if (started) return;
      started = true;
      var source = document.createElement("source");
      source.src = src;
      source.type = "video/mp4";
      source.addEventListener("error", function () { v.remove(); });   // brak pliku: zostaje tło zastępcze
      v.addEventListener("loadeddata", function () { v.classList.add("is-ready"); });
      v.appendChild(source);
      v.load();
    }
    function play() { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (!v.isConnected) return;
          if (e.isIntersecting) { start(); play(); } else if (started) v.pause();
        });
      }, { rootMargin: "200px 0px" }).observe(v);
    } else { start(); play(); }
  }

  /* ---------- Galeria sprzedanych aut z powiększaniem ---------- */
  var lb = $("[data-lightbox]"), lbList = [], lbIndex = 0;
  function lbShow(i) {
    if (!lbList.length) return;
    lbIndex = (i + lbList.length) % lbList.length;
    $(".lightbox__img", lb).src = lbList[lbIndex];
    $("[data-lb-count]", lb).textContent = lbList.length > 1 ? (lbIndex + 1) + " / " + lbList.length : "";
  }
  function initGallery(urls) {
    var wrap = $("[data-gallery-wrap]"), list = $("[data-gallery]");
    if (!wrap || !list || !lb) return;
    if (!urls.length) { wrap.hidden = true; return; }
    lbList = urls;
    list.innerHTML = urls.map(function (u, i) {
      return '<li><button class="sold__item" type="button" data-sold="' + i + '" aria-label="Powiększ zdjęcie ' + (i + 1) + '">' +
        '<img src="' + esc(u) + '" alt="Samochód sprzedany przez komis ' + esc(B.name) + '" loading="lazy" decoding="async"></button></li>';
    }).join("");
    wrap.hidden = false;
    $$(".lightbox__nav", lb).forEach(function (n) { n.hidden = urls.length < 2; });
    list.addEventListener("click", function (e) {
      var b = e.target.closest("[data-sold]");
      if (!b) return;
      lbShow(+b.getAttribute("data-sold"));
      lb.showModal();
      document.documentElement.classList.add("is-locked");
    });
    lb.addEventListener("close", function () { document.documentElement.classList.remove("is-locked"); });
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.closest("[data-lb-close]")) { lb.close(); return; }
      var n = e.target.closest("[data-lb]");
      if (n) lbShow(lbIndex + +n.getAttribute("data-lb"));
    });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") lbShow(lbIndex + 1);
      if (e.key === "ArrowLeft") lbShow(lbIndex - 1);
    });
    var sx = null;
    lb.addEventListener("pointerdown", function (e) { sx = e.target.closest(".lightbox__img") ? e.clientX : null; });
    lb.addEventListener("pointerup", function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 40) lbShow(lbIndex + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- Social media: kafelki z config.js ---------- */
  function initSocial() {
    var box = $("[data-social-cards]");
    if (!box) return;
    var path = function (u) { try { return new URL(u).pathname.replace(/\/+$/, "").split("/").pop(); } catch (e) { return ""; } };
    var NETS = [
      { key: "facebook", name: "Facebook", handle: B.name, cta: "Obserwuj na Facebooku" },
      { key: "instagram", name: "Instagram", handle: "@" + path(C.links.instagram || ""), cta: "Obserwuj na Instagramie" },
      { key: "tiktok", name: "TikTok", handle: path(C.links.tiktok || ""), cta: "Obserwuj na TikToku" },
      { key: "youtube", name: "YouTube", handle: "Kanał komisu", cta: "Zobacz na YouTube" }
    ].filter(function (n) { return C.links[n.key]; });
    if (!NETS.length) { $("#social").hidden = true; return; }
    box.innerHTML = NETS.map(function (n) {
      return '<li><a class="social-card social-card--' + n.key + '" href="' + esc(C.links[n.key]) + '" target="_blank" rel="noopener">' +
        '<span class="social-card__icon">' + icon("i-" + n.key) + "</span>" +
        '<span class="social-card__text"><span class="social-card__name">' + n.name + '</span><span class="social-card__handle">' + esc(n.handle) + "</span></span>" +
        '<span class="social-card__cta">' + n.cta + icon("i-external") + "</span>" +
      "</a></li>";
    }).join("");
  }

  /* ---------- Tablica w hero: delikatny ruch za kursorem ---------- */
  function initPlate() {
    var plate = $("[data-plate]"), hero = $(".hero");
    if (!plate || reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    var raf = 0;
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        plate.style.setProperty("--ry", (-12 + x * 18).toFixed(2) + "deg");
        plate.style.setProperty("--rx", (5 - y * 10).toFixed(2) + "deg");
        plate.style.setProperty("--sheen", (115 - (x + 0.5) * 130).toFixed(1) + "%");
      });
    });
    hero.addEventListener("pointerleave", function () {
      ["--ry", "--rx", "--sheen"].forEach(function (p) { plate.style.removeProperty(p); });
    });
  }

  /* ---------- Dane strukturalne ofert (Google) ---------- */
  function injectSchema() {
    var base = location.href.split("#")[0];
    var abs = function (p) { try { return new URL(p, base).href; } catch (e) { return p; } };
    var items = CARS.map(function (c, i) {
      var imgs = (c.images || []).filter(function (r) { return !/^idb:/.test(r); });
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Car",
          name: carName(c) + (c.version ? " " + c.version : ""),
          brand: { "@type": "Brand", name: c.make },
          model: c.model,
          vehicleModelDate: String(c.year),
          mileageFromOdometer: { "@type": "QuantitativeValue", value: c.mileage, unitCode: "KMT" },
          fuelType: c.fuel,
          vehicleTransmission: c.gearbox || undefined,
          color: c.color || undefined,
          image: imgs.length ? imgs.map(abs) : undefined,
          url: base + "#auto-" + c.id,
          offers: {
            "@type": "Offer",
            price: c.price,
            priceCurrency: "PLN",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/UsedCondition",
            seller: { "@type": "AutoDealer", name: B.name }
          }
        }
      };
    });
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", name: "Oferta aut: " + B.name, itemListElement: items });
    document.head.appendChild(s);
  }

  /* ---------- Start ---------- */
  initHeader();
  updateStatus();
  setInterval(updateStatus, 60000);
  initPlate();
  initSocial();
  initOfferVideo();

  var fallback = function () {
    return {
      cars: (window.DANEK_INVENTORY || []).slice(),
      galleryUrls: (window.DANEK_GALLERY || []).slice(),
      reviews: (window.DANEK_REVIEWS || []).slice(),
      source: "published"
    };
  };
  var Store = window.DanekStore;
  var loading = Store
    ? Store.load().then(function (r) {
        return Promise.all([Store.resolveCars(r.cars), Store.resolveRefs(r.gallery || [])]).then(function (res) {
          return { cars: res[0], galleryUrls: res[1], reviews: r.reviews || [], source: r.source };
        });
      })
    : Promise.resolve(fallback());

  loading.catch(fallback).then(function (r) {
    CARS = (r.cars || []).filter(function (c) { return !c.hidden; });
    bindTexts();
    initFilters();
    renderCars();
    initDialog();
    initCalc();
    initReviews(r.reviews);
    initGallery(r.galleryUrls || []);
    injectSchema();
    fixOrphans(document.body);
    document.documentElement.classList.add("is-ready");
  });
})();
