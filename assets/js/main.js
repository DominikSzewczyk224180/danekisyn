/* ==========================================================================
   Auto Komis Danek & Syn: logika strony (bez bibliotek)
   ========================================================================== */
(function () {
  "use strict";

  var C = window.DANEK_CONFIG;
  var CARS = (window.DANEK_INVENTORY || []).slice();
  var B = C.business;

  /* ---------- Narzędzia ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NBSP = "\u00A0";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  var FUEL_SHORT = { "Hybryda plug-in": "Hybryda" };
  var GEAR_SHORT = { "Automatyczna": "Automat", "Manualna": "Manual" };

  function factLabel(key, val) {
    var f = FACT_FULL[key];
    return typeof f === "function" ? f(val) : f;
  }
  function carFlag(c) {
    if (c.facts && c.facts.warranty) return "Gwarancja " + c.facts.warranty.replace("miesięcy", "mies.");
    if (c.lowest30) return "Cena obniżona";
    return "";
  }
  function payment(principal, months, ratePct) {
    if (principal <= 0 || months <= 0) return 0;
    var r = ratePct / 100 / 12;
    if (r === 0) return principal / months;
    return principal * r / (1 - Math.pow(1 + r, -months));
  }

  /* ---------- Teksty zależne od danych ---------- */
  function bindTexts() {
    var prices = CARS.map(function (c) { return c.price; });
    var n = CARS.length;
    var min = Math.min.apply(null, prices), max = Math.max.apply(null, prices);
    var med = median(prices);

    $$('[data-bind="count"]').forEach(function (el) { el.textContent = n; });
    $$('[data-bind="inventory-summary"]').forEach(function (el) {
      el.textContent = n
        ? n + " " + plural(n, "auto", "auta", "aut") + " w cenach od " + fmt(min) + " do " + zl(max) + ". Każde obejrzysz i sprawdzisz na miejscu, przy Raciborskiej 267."
        : "Oferta właśnie się zmienia. Zadzwoń, powiemy, co jest na placu.";
    });
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

    // linki z konfiguracji
    $$("[data-link]").forEach(function (el) {
      var url = C.links[el.getAttribute("data-link")];
      if (url) el.href = url;
    });

    // social media
    var social = $("[data-social]");
    if (social) {
      var NETS = [["facebook", "Facebook"], ["instagram", "Instagram"], ["youtube", "YouTube"], ["tiktok", "TikTok"]];
      social.innerHTML = NETS.filter(function (x) { return C.links[x[0]]; }).map(function (x) {
        return '<li><a href="' + esc(C.links[x[0]]) + '" target="_blank" rel="noopener" aria-label="' + x[1] + '">' + icon("i-" + x[0]) + "</a></li>";
      }).join("");
    }

    // prawdziwe opinie (jeśli wklejone w konfiguracji)
    var quotesEl = $("[data-quotes]");
    if (quotesEl && R.quotes && R.quotes.length) {
      quotesEl.innerHTML = R.quotes.map(function (q) {
        return '<blockquote class="quote"><p>' + esc(q.text) + "</p><footer>" + esc(q.author) + (q.source ? ", " + esc(q.source) : "") + "</footer></blockquote>";
      }).join("");
      quotesEl.hidden = false;
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
    window.matchMedia("(min-width: 981px)").addEventListener("change", function (e) { if (e.matches) setMenu(false); });

    // podświetlenie sekcji w menu
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

  /* ---------- Otwarte teraz (czas Polski, niezależnie od strefy odwiedzającego) ---------- */
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
    var minPrice = Math.min.apply(null, CARS.map(function (c) { return c.price; }));
    fillSelect($("#f-max"), [30000, 40000, 50000, 70000, 100000, 150000]
      .filter(function (p) { return p > minPrice; })
      .map(function (p) { return [String(p), "do " + zl(p)]; }));

    var debounce;
    filtersForm.addEventListener("input", function (e) {
      var t = e.target;
      if (!t.name || t.tagName !== "INPUT") return;
      state[t.name] = t.value.trim();
      clearTimeout(debounce);
      debounce = setTimeout(renderCars, t.type === "search" ? 140 : 0);
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
    var lastSpec = c.gearbox ? ["Skrzynia", GEAR_SHORT[c.gearbox] || c.gearbox] : ["Nadwozie", c.body];
    var specs = [["Rok", c.year], ["Przebieg", km(c.mileage)], ["Paliwo", FUEL_SHORT[c.fuel] || c.fuel], lastSpec];
    var facts = CARD_FACT_ORDER.filter(function (k) { return c.facts && c.facts[k]; }).slice(0, 2);
    var showOmnibus = c.lowest30 && flag === "Cena obniżona";
    return '<article class="car">' +
      '<div class="car__media">' +
        '<img src="' + esc(c.image) + '" alt="' + esc(c.imageAlt || carName(c)) + '" width="600" height="450" loading="lazy" decoding="async"' +
        (c.imagePos ? ' style="object-position:' + esc(c.imagePos) + '"' : "") + ">" +
        (flag ? '<span class="car__flag">' + esc(flag) + "</span>" : "") +
      "</div>" +
      '<div class="car__body">' +
        '<h3 class="car__title"><button class="car__open" type="button" data-open-car="' + esc(c.id) + '" aria-haspopup="dialog">' + esc(carName(c)) + "</button></h3>" +
        '<p class="car__version">' + esc(c.version) + "</p>" +
        '<dl class="car__specs">' + specs.map(function (s) { return "<div><dt>" + s[0] + "</dt><dd>" + esc(s[1]) + "</dd></div>"; }).join("") + "</dl>" +
        (facts.length ? '<ul class="car__facts">' + facts.map(function (k) { return "<li>" + icon("i-check") + esc(FACT_SHORT[k]) + "</li>"; }).join("") + "</ul>" : "") +
        '<div class="car__foot">' +
          "<div>" +
            '<p class="plate plate--price">' + fmt(c.price) + "<small>zł</small></p>" +
            (showOmnibus ? '<p class="car__price-note">Najniższa cena z 30 dni przed obniżką: ' + zl(c.lowest30) + "</p>" : "") +
          "</div>" +
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

  /* ---------- Szczegóły auta ---------- */
  var dlg = $("#car-dialog");
  var baseTitle = document.title;
  var lastFocus = null;
  var currentCar = null;

  function dialogHTML(c) {
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

    return '<div class="dlg">' +
      '<div class="dlg__media">' +
        '<figure class="dlg__photo"><img src="' + esc(c.image) + '" alt="' + esc(c.imageAlt || carName(c)) + '" width="600" height="450"' +
          (c.imagePos ? ' style="object-position:' + esc(c.imagePos) + '"' : "") + "></figure>" +
        '<a class="dlg__gallery" href="' + esc(c.otomoto) + '" target="_blank" rel="noopener">' +
          "<span>" + (c.photos ? "Zobacz wszystkie " + c.photos + " " + plural(c.photos, "zdjęcie", "zdjęcia", "zdjęć") + " na Otomoto" : "Zobacz ogłoszenie na Otomoto") + "</span>" + icon("i-external") +
        "</a>" +
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
        '<p class="dlg__version">' + esc(c.version) + ", " + c.year + "</p>" +
        '<div class="dlg__price">' +
          '<p class="plate plate--price">' + fmt(c.price) + "<small>zł</small></p>" +
          '<p class="dlg__price-meta">' + priceMeta.join("<br>") + "</p>" +
        "</div>" +
        (c.lowest30 ? '<p class="dlg__omnibus">Cena obniżona o ' + zl(c.lowest30 - c.price) + ". Najniższa cena z 30 dni przed obniżką: " + zl(c.lowest30) + ".</p>" : "") +
        (facts.length ? '<ul class="dlg__facts">' + facts.map(function (k) { return "<li>" + icon("i-check") + esc(factLabel(k, c.facts[k])) + "</li>"; }).join("") + "</ul>" : "") +
        '<div class="dlg__cta">' +
          '<a class="btn btn--gold" href="tel:' + esc(B.phone) + '">' + icon("i-phone") + "Zadzwoń</a>" +
          '<button class="btn btn--ghost" type="button" data-ask-car="' + esc(c.id) + '">' + icon("i-message") + "Zapytaj o auto</button>" +
        "</div>" +
        '<p class="dlg__fin">Przykładowa rata: ok. ' + zl(est) + " miesięcznie przy " + C.financing.months + " ratach, bez wkładu własnego (symulacja). " +
          '<button class="link-btn" type="button" data-calc-car="' + esc(c.id) + '">Policz swój wariant</button></p>' +
        '<h3 class="dlg__h">Dane techniczne</h3>' +
        '<dl class="spec">' + specs.map(function (s) { return "<div><dt>" + s[0] + "</dt><dd>" + esc(s[1]) + "</dd></div>"; }).join("") + "</dl>" +
        (c.highlights && c.highlights.length
          ? '<h3 class="dlg__h">Wybrane wyposażenie</h3><ul class="equip">' + c.highlights.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + "</ul>"
          : "") +
        '<div class="dlg__tools">' +
          '<button class="btn btn--ghost btn--compact" type="button" data-share="' + esc(c.id) + '">' + icon("i-share") + "Wyślij komuś</button>" +
          '<a class="btn btn--ghost btn--compact" href="' + esc(c.otomoto) + '" target="_blank" rel="noopener">' + icon("i-external") + "Ogłoszenie na Otomoto</a>" +
        "</div>" +
        '<p class="dlg__legal">Dane pochodzą z ogłoszenia komisu. Informacja handlowa, nie oferta w rozumieniu art.' + NBSP + "66" + NBSP + "§" + NBSP + "1 Kodeksu cywilnego.</p>" +
      "</div>" +
    "</div>";
  }

  function openCar(id, push) {
    var c = CARS.find(function (x) { return x.id === id; });
    if (!c) return;
    if (!dlg.open) lastFocus = document.activeElement;
    currentCar = c;
    dlg.innerHTML = dialogHTML(c);
    fixOrphans(dlg);
    updateStatus();
    if (!dlg.open) {
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    }
    document.documentElement.classList.add("is-locked");
    dlg.scrollTop = 0;
    var main = $(".dlg__main", dlg); if (main) main.scrollTop = 0;
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
    var closeBtn = $("[data-close]", dlg); if (closeBtn) closeBtn.focus();
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

    // klik w tło zamyka okno
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) {
        var r = dlg.getBoundingClientRect();
        var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (!inside) closeDialog();
      }
      if (e.target.closest("[data-close]")) closeDialog();

      var ask = e.target.closest("[data-ask-car]");
      if (ask) {
        var id = ask.getAttribute("data-ask-car");
        closeDialog();
        setTimeout(function () { prefillForm("auto", id); }, 80);
      }
      var calcBtn = e.target.closest("[data-calc-car]");
      if (calcBtn) {
        var cid = calcBtn.getAttribute("data-calc-car");
        closeDialog();
        setTimeout(function () { selectCalcCar(cid); scrollToEl($("#finansowanie")); }, 80);
      }
      var share = e.target.closest("[data-share]");
      if (share) shareCar(currentCar);
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
    var data = { title: carName(c) + " | " + B.name, text: carName(c) + " " + c.version + ", " + c.year + ", " + zl(c.price), url: url };
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

    // na start auto o środkowej cenie z oferty
    var mid = median(CARS.map(function (c) { return c.price; }));
    var start = CARS.find(function (c) { return c.price === mid; }) || CARS[0];
    if (start) selectCalcCar(start.id); else updateCalc();

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

    $("[data-ask-financing]").addEventListener("click", function () {
      var v = calcValues();
      var c = CARS.find(function (x) { return x.id === sel.value; });
      var msg = "Dzień dobry, proszę o informację o finansowaniu" + (c ? " auta " + carName(c) + " " + c.version + " (" + zl(c.price) + ")" : " auta za " + zl(v.price)) +
        ". Wkład własny: " + zl(v.down) + ", liczba rat: " + v.months + ".";
      prefillForm("finansowanie", c ? c.id : "", msg);
    });
  }

  /* ---------- Formularz kontaktowy ---------- */
  var form = $("[data-contact-form]");
  var TOPICS = {};

  function syncTopic() {
    var t = form.topic.value;
    $("[data-field-car]", form).hidden = ["auto", "jazda", "finansowanie"].indexOf(t) === -1;
    var trade = $("[data-field-trade]", form);
    trade.hidden = t !== "zamiana";
    $$("input", trade).forEach(function (i) { i.disabled = t !== "zamiana"; });
  }

  function prefillForm(topic, carId, message) {
    form.topic.value = topic;
    if (carId !== undefined) form.car.value = carId || "";
    if (message) form.message.value = message;
    else if (topic === "auto" && carId) {
      var c = CARS.find(function (x) { return x.id === carId; });
      if (c && !form.message.value) form.message.value = "Dzień dobry, interesuje mnie " + carName(c) + " " + c.version + " (" + c.year + "). Proszę o kontakt.";
    }
    syncTopic();
    scrollToEl(form);
    setTimeout(function () { form.imie.focus({ preventScroll: true }); }, reduceMotion ? 0 : 450);
  }

  function setError(input, on) {
    input.setAttribute("aria-invalid", on ? "true" : "false");
    var err = document.getElementById(input.id + "-err");
    if (err) err.hidden = !on;
  }
  function validate() {
    var ok = true, first = null;
    var nameOk = form.imie.value.trim().length >= 2;
    setError(form.imie, !nameOk); if (!nameOk) { ok = false; first = first || form.imie; }
    var digits = form.phone.value.replace(/\D/g, "");
    var phoneOk = digits.length >= 9 && digits.length <= 13;
    setError(form.phone, !phoneOk); if (!phoneOk) { ok = false; first = first || form.phone; }
    var email = form.email.value.trim();
    var emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    setError(form.email, !emailOk); if (!emailOk) { ok = false; first = first || form.email; }
    if (first) first.focus();
    return ok;
  }

  function collect() {
    var topicLabel = form.topic.options[form.topic.selectedIndex].textContent;
    var c = CARS.find(function (x) { return x.id === form.car.value; });
    var showCar = !$("[data-field-car]", form).hidden && c;
    var trade = form.topic.value === "zamiana";
    var lines = [
      "Imię: " + form.imie.value.trim(),
      "Telefon: " + form.phone.value.trim(),
      form.email.value.trim() ? "E-mail: " + form.email.value.trim() : "",
      "Sprawa: " + topicLabel,
      showCar ? "Auto z oferty: " + carName(c) + " " + c.version + ", " + c.year + ", " + zl(c.price) : "",
      trade ? "Auto klienta: " + (form.tradeModel.value || "nie podano") + ", rocznik " + (form.tradeYear.value || "?") + ", przebieg " + (form.tradeKm.value ? km(+form.tradeKm.value) : "?") : "",
      form.message.value.trim() ? "\nWiadomość:\n" + form.message.value.trim() : ""
    ].filter(Boolean);
    return {
      subject: "Strona www: " + topicLabel + (showCar ? ", " + carName(c) : ""),
      body: lines.join("\n"),
      fields: {
        imie: form.imie.value.trim(),
        telefon: form.phone.value.trim(),
        email: form.email.value.trim(),
        sprawa: topicLabel,
        auto: showCar ? carName(c) + " " + c.version + " " + c.year : "",
        auto_klienta: trade ? [form.tradeModel.value, form.tradeYear.value, form.tradeKm.value && form.tradeKm.value + " km"].filter(Boolean).join(", ") : "",
        wiadomosc: form.message.value.trim()
      }
    };
  }

  function showStatus(text, tone) {
    var el = $("[data-form-status]", form);
    el.textContent = text;
    el.setAttribute("data-tone", tone || "ok");
    el.hidden = false;
  }

  function initForm() {
    if (!form) return;
    CARS.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c.id; o.textContent = carName(c) + ", " + c.year + ", " + zl(c.price);
      form.car.appendChild(o);
    });
    form.topic.addEventListener("change", syncTopic);
    syncTopic();

    $$('[data-topic]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        prefillForm(a.getAttribute("data-topic"));
      });
    });

    ["imie", "phone", "email"].forEach(function (n) {
      form[n].addEventListener("input", function () { if (form[n].getAttribute("aria-invalid") === "true") setError(form[n], false); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.company.value) { showStatus("Wiadomość wysłana. Oddzwonimy w godzinach otwarcia komisu."); form.reset(); return; }
      if (!validate()) return;

      var data = collect();
      var P = C.form || {};
      var btn = $(".form__submit", form);

      if (P.provider === "web3forms" || P.provider === "formspree") {
        if (!P.key) { mailtoFallback(data); return; }
        btn.disabled = true;
        var label = btn.textContent;
        btn.textContent = "Wysyłanie…";
        var url = P.provider === "web3forms" ? "https://api.web3forms.com/submit" : "https://formspree.io/f/" + encodeURIComponent(P.key);
        var payload = Object.assign({}, data.fields, { tresc: data.body });
        if (P.provider === "web3forms") { payload.access_key = P.key; payload.subject = data.subject; payload.from_name = B.name + " (strona www)"; }
        else { payload._subject = data.subject; }
        if (data.fields.email) payload.replyto = data.fields.email;

        fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return r.ok && j.success !== false; }); })
          .then(function (ok) {
            if (!ok) throw new Error("send");
            showStatus("Wiadomość wysłana. Oddzwonimy w godzinach otwarcia komisu.");
            form.reset(); syncTopic();
          })
          .catch(function () {
            showStatus("Nie udało się wysłać wiadomości. Zadzwoń: " + B.phoneDisplay + " albo spróbuj ponownie za chwilę.", "error");
          })
          .finally(function () { btn.disabled = false; btn.textContent = label; });
        return;
      }
      mailtoFallback(data);
    });
  }

  function mailtoFallback(data) {
    var href = "mailto:" + B.email + "?subject=" + encodeURIComponent(data.subject) + "&body=" + encodeURIComponent(data.body);
    window.location.href = href;
    showStatus("Otwieramy Twój program pocztowy z gotową wiadomością. Jeśli nic się nie stało, napisz na " + B.email + " albo zadzwoń: " + B.phoneDisplay + ".", "info");
  }

  /* ---------- Mapa ładowana na żądanie ---------- */
  function initMap() {
    var btn = $("[data-load-map]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = C.links.mapEmbed;
      f.title = "Mapa dojazdu: " + B.name + ", " + B.street + ", " + B.city;
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.allowFullscreen = true;
      $("[data-map]").replaceWith(f);
    });
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
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Car",
          name: carName(c) + " " + c.version,
          brand: { "@type": "Brand", name: c.make },
          model: c.model,
          vehicleModelDate: String(c.year),
          mileageFromOdometer: { "@type": "QuantitativeValue", value: c.mileage, unitCode: "KMT" },
          fuelType: c.fuel,
          vehicleTransmission: c.gearbox || undefined,
          color: c.color || undefined,
          image: abs(c.image),
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
  bindTexts();
  initHeader();
  updateStatus();
  setInterval(updateStatus, 60000);
  initFilters();
  renderCars();
  initDialog();
  initCalc();
  initForm();
  initMap();
  initPlate();
  injectSchema();
  fixOrphans(document.body);
})();
