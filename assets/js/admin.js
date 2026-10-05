/* ==========================================================================
   PANEL ADMINA: dodawanie, edycja, ukrywanie i usuwanie aut (zapis lokalny + paczka do publikacji)
   ========================================================================== */
(function () {
  "use strict";

  var C = window.DANEK_CONFIG;
  var S = window.DanekStore;

  /* ---------- Narzędzia ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NBSP = "\u00A0";
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
  function icon(id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  var toastTimer = 0;
  function toast(msg) {
    var el = $("[data-toast]");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 3600);
  }
  function slug(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  /* ---------- Logowanie PIN-em ---------- */
  // Uwaga: na statycznej stronie PIN chroni przed przypadkowym wejściem, nie przed włamaniem.
  // Dane i tak zapisują się tylko w przeglądarce osoby, która z panelu korzysta.
  function hash(str) {
    var s = "danek-syn:" + str, h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ("0000000" + h.toString(16)).slice(-8);
  }
  window.danekHash = hash; // w konsoli: danekHash("nowyPIN") i wynik wpisz do config.js
  var SESSION = "danek-admin";
  function authed() { try { return sessionStorage.getItem(SESSION) === "1"; } catch (e) { return false; } }
  function setAuthed(on) { try { if (on) sessionStorage.setItem(SESSION, "1"); else sessionStorage.removeItem(SESSION); } catch (e) {} }

  var loginEl = $("[data-login]"), appEl = $("[data-app]");
  function showApp() { loginEl.hidden = true; appEl.hidden = false; load(); }
  function showLogin() {
    appEl.hidden = true; loginEl.hidden = false;
    setTimeout(function () { $("#adm-pin").focus(); }, 30);
  }
  $("[data-login-form]").addEventListener("submit", function (e) {
    e.preventDefault();
    var pin = $("#adm-pin").value.trim();
    if (pin && C.admin && hash(pin) === C.admin.pinHash) {
      setAuthed(true);
      $("[data-login-err]").hidden = true;
      $("#adm-pin").value = "";
      showApp();
    } else {
      $("[data-login-err]").hidden = false;
      $("#adm-pin").select();
    }
  });
  $("[data-logout]").addEventListener("click", function () { setAuthed(false); showLogin(); });

  /* ---------- Stan ---------- */
  var st = { cars: [], source: "published", updatedAt: 0, storageError: false };
  var urls = {};
  function urlOf(ref) { return S.imageUrl(ref).then(function (u) { urls[ref] = u; return u; }); }
  function loadThumbs() { return Promise.all(st.cars.map(function (c) { return c.images[0] ? urlOf(c.images[0]) : null; })); }

  function load() {
    return S.load().then(function (r) {
      st.cars = r.cars;
      st.source = r.source;
      st.updatedAt = r.updatedAt;
      st.storageError = !!r.storageError;
      return loadThumbs();
    }).then(render);
  }

  function save(message) {
    return S.saveLocal(st.cars).then(function (meta) {
      st.source = "local";
      st.updatedAt = meta.updatedAt;
      return S.cleanupImages(st.cars);
    }).then(loadThumbs).then(function () {
      render();
      if (message) toast(message);
    }).catch(function (err) {
      if (window.console) console.error(err);
      toast("Nie udało się zapisać zmian. Sprawdź, czy przeglądarka nie jest w trybie prywatnym.");
    });
  }

  /* ---------- Widok listy ---------- */
  function when(ts) {
    return new Date(ts).toLocaleString("pl-PL", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  }
  function renderState() {
    var el = $("[data-state]");
    if (st.storageError) {
      el.className = "adm-state adm-state--error";
      el.innerHTML = '<div class="adm-state__text"><h2>Ta przeglądarka nie zapisuje danych</h2>' +
        "<p>Otwórz panel w zwykłym oknie (nie prywatnym) albo w innej przeglądarce. Bez tego zmiany nie zostaną zapamiętane.</p></div>";
      return;
    }
    if (st.source === "local") {
      el.className = "adm-state adm-state--local";
      el.innerHTML = '<div class="adm-state__text"><h2>Zmiany zapisane na tym urządzeniu</h2>' +
        "<p>Ostatnia zmiana: " + esc(when(st.updatedAt)) + ". Strona w\u00A0tej przeglądarce już je pokazuje.</p></div>" +
        '<div class="adm-state__actions">' +
          '<button class="btn btn--gold" type="button" data-publish-open>' + icon("i-upload") + "Opublikuj zmiany</button>" +
          '<button class="btn btn--ghost" type="button" data-discard>Cofnij wszystkie zmiany</button>' +
        "</div>";
    } else {
      el.className = "adm-state";
      el.innerHTML = '<div class="adm-state__text"><h2>Oferta zgodna ze stroną</h2>' +
        "<p>Zmiany zapisują się automatycznie i od razu widać je na stronie na tym urządzeniu.</p></div>";
    }
  }

  function renderList() {
    var list = $("[data-list]");
    var n = st.cars.length;
    var visible = st.cars.filter(function (c) { return !c.hidden; }).length;
    $("[data-count]").textContent = n
      ? n + " " + plural(n, "auto", "auta", "aut") + (visible !== n ? ", na stronie widoczne: " + visible : ", wszystkie widoczne na stronie")
      : "";
    $("[data-empty]").hidden = n > 0;
    list.innerHTML = st.cars.map(function (c, i) {
      var thumb = c.images[0] ? urls[c.images[0]] : "";
      var nImg = c.images.length;
      return '<li class="adm-car' + (c.hidden ? " is-hidden" : "") + '" data-i="' + i + '">' +
        '<div class="adm-car__order">' +
          '<button class="adm-icon-btn" type="button" data-act="up" aria-label="Przesuń wyżej"' + (i === 0 ? " disabled" : "") + ">" + icon("i-up") + "</button>" +
          '<button class="adm-icon-btn" type="button" data-act="down" aria-label="Przesuń niżej"' + (i === n - 1 ? " disabled" : "") + ">" + icon("i-down") + "</button>" +
        "</div>" +
        '<div class="adm-car__thumb">' + (thumb ? '<img src="' + esc(thumb) + '" alt="">' : "<span>Brak zdjęcia</span>") + "</div>" +
        '<div class="adm-car__info">' +
          '<p class="adm-car__name">' + esc(c.make + " " + c.model) + (c.hidden ? ' <span class="adm-badge">Ukryte</span>' : "") + "</p>" +
          (c.version ? '<p class="adm-car__ver">' + esc(c.version) + "</p>" : "") +
          '<p class="adm-car__meta"><span>' + esc(c.year) + "</span><span>" + km(c.mileage) + "</span><span>" + esc(c.fuel) + "</span><span>" + nImg + " " + plural(nImg, "zdjęcie", "zdjęcia", "zdjęć") + "</span></p>" +
        "</div>" +
        '<p class="adm-car__price">' + zl(c.price) + "</p>" +
        '<div class="adm-car__actions">' +
          '<button class="btn btn--ghost btn--compact" type="button" data-act="edit">' + icon("i-edit") + "Edytuj</button>" +
          '<button class="adm-icon-btn" type="button" data-act="toggle" aria-label="' + (c.hidden ? "Pokaż na stronie" : "Ukryj na stronie") + '" title="' + (c.hidden ? "Pokaż na stronie" : "Ukryj na stronie") + '">' + icon(c.hidden ? "i-eye-off" : "i-eye") + "</button>" +
          '<button class="adm-icon-btn" type="button" data-act="copy" aria-label="Duplikuj" title="Duplikuj">' + icon("i-copy") + "</button>" +
          '<button class="adm-icon-btn adm-icon-btn--danger" type="button" data-act="delete" aria-label="Usuń" title="Usuń">' + icon("i-trash") + "</button>" +
        "</div>" +
      "</li>";
    }).join("");
  }
  function render() { renderState(); renderList(); }

  function uniqueId(c, except) {
    var base = slug(c.make + "-" + c.model + "-" + c.year) || "auto";
    var id = base, k = 2;
    while (st.cars.some(function (x) { return x.id === id && x !== except; })) id = base + "-" + k++;
    return id;
  }

  $("[data-list]").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var i = +btn.closest("[data-i]").getAttribute("data-i");
    var c = st.cars[i];
    var act = btn.getAttribute("data-act");
    if (act === "edit") openEditor(i);
    if (act === "up" && i > 0) { st.cars.splice(i - 1, 0, st.cars.splice(i, 1)[0]); save(); }
    if (act === "down" && i < st.cars.length - 1) { st.cars.splice(i + 1, 0, st.cars.splice(i, 1)[0]); save(); }
    if (act === "toggle") {
      c.hidden = !c.hidden;
      if (!c.hidden) delete c.hidden;
      save(c.hidden ? "Auto ukryte na stronie" : "Auto znowu widoczne na stronie");
    }
    if (act === "copy") {
      var copy = clone(c);
      copy.hidden = true;
      copy.id = uniqueId(copy);
      st.cars.splice(i + 1, 0, copy);
      save("Skopiowano auto. Kopia jest ukryta, dopóki jej nie pokażesz.");
    }
    if (act === "delete" && window.confirm("Usunąć " + c.make + " " + c.model + " (" + c.year + ") z oferty?")) {
      st.cars.splice(i, 1);
      save("Auto usunięte z oferty");
    }
  });

  $("[data-add]").addEventListener("click", function () { openEditor(null); });

  /* ---------- Publikacja ---------- */
  var pubDialog = $("[data-publish]");
  var soonDialog = $("[data-soon]");
  // admin.html?dev: pobieranie paczki do publikacji (dla opiekuna strony, komis widzi "wkrótce")
  var DEV = /[?&]dev(=|&|$)/.test(location.search);
  $("[data-state]").addEventListener("click", function (e) {
    if (e.target.closest("[data-publish-open]")) (DEV ? pubDialog : soonDialog).showModal();
    if (e.target.closest("[data-discard]") && window.confirm("Cofnąć wszystkie zmiany i wrócić do oferty, która jest teraz na stronie?")) {
      S.clearLocal().then(load).then(function () { toast("Przywrócono ofertę ze strony"); });
    }
  });
  $("[data-pub-close]").addEventListener("click", function () { pubDialog.close(); });
  $("[data-soon-close]").addEventListener("click", function () { soonDialog.close(); });
  $("[data-pub-download]").addEventListener("click", function () {
    var btn = this;
    btn.disabled = true;
    S.exportZip(st.cars, st.updatedAt).then(function (blob) {
      var name = "danek-syn-oferta-" + new Date().toISOString().slice(0, 10) + ".zip";
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 5000);
      toast("Pobrano paczkę " + name);
    }).catch(function () {
      toast("Nie udało się przygotować paczki. Spróbuj ponownie.");
    }).then(function () { btn.disabled = false; });
  });

  /* ---------- Edytor auta ---------- */
  var ed = $("[data-editor]");
  var form = $("[data-editor-form]");
  var F = form.elements;
  var edit = null;
  var saved = false;

  var FACT_KEYS = ["accidentFree", "firstOwner", "aso", "registeredPL", "originalPaint", "noSmoking", "twoKeys"];
  var TEXT_FIELDS = ["make", "model", "version", "year", "mileage", "price", "fuel", "gearbox", "gearboxNote", "engine", "power", "drive", "body", "color", "origin", "description", "otomoto"];
  var SUGGEST = [
    "Klimatyzacja automatyczna", "Klimatyzacja dwustrefowa", "Nawigacja", "Kamera cofania", "Kamera 360°",
    "Czujniki parkowania przód i tył", "Tempomat", "Tempomat adaptacyjny", "Podgrzewane fotele",
    "Podgrzewana kierownica", "Reflektory LED", "Apple CarPlay i Android Auto", "Bluetooth", "Keyless Go",
    "Hak holowniczy", "Dach panoramiczny", "Skórzana tapicerka", "Elektryczna klapa bagażnika", "Felgi aluminiowe"
  ];

  function field(name) { return F.namedItem(name); }
  function setVal(name, v) {
    var el = field(name);
    if (!el) return;
    if (el.type === "checkbox") { el.checked = !!v; return; }
    var value = v == null ? "" : String(v);
    if (el.tagName === "SELECT" && value && !$$("option", el).some(function (o) { return o.value === value; })) {
      var opt = document.createElement("option");
      opt.value = opt.textContent = value;
      el.appendChild(opt);
    }
    el.value = value;
  }
  function txt(name) { return String(field(name).value || "").trim(); }
  function num(name) {
    var v = txt(name).replace(/\s/g, "").replace(",", ".");
    return v === "" ? null : Number(v);
  }

  function syncDeps() {
    field("warranty").disabled = !field("warrantyOn").checked;
    field("inspection").disabled = !field("inspectionOn").checked;
  }
  form.addEventListener("change", function (e) {
    if (e.target.name === "warrantyOn" || e.target.name === "inspectionOn") syncDeps();
    if (e.target.name === "highlights") renderChips();
  });

  function fillForm(c) {
    form.reset();
    TEXT_FIELDS.forEach(function (n) { setVal(n, c[n]); });
    setVal("negotiable", c.negotiable);
    setVal("visible", !c.hidden);
    var f = c.facts || {};
    FACT_KEYS.forEach(function (k) { setVal("f_" + k, f[k]); });
    setVal("warrantyOn", !!f.warranty);
    setVal("warranty", f.warranty || "12 miesięcy");
    setVal("inspectionOn", !!f.inspection);
    setVal("inspection", f.inspection ? String(f.inspection).replace(/^do\s*/, "") : "");
    setVal("highlights", (c.highlights || []).join("\n"));
    syncDeps();
    clearErrors();
    renderChips();
  }

  function readForm() {
    var orig = edit.car;
    var facts = {};
    FACT_KEYS.forEach(function (k) { if (field("f_" + k).checked) facts[k] = true; });
    if (field("warrantyOn").checked && txt("warranty")) facts.warranty = txt("warranty");
    if (field("inspectionOn").checked && txt("inspection")) facts.inspection = "do " + txt("inspection");
    var out = {
      id: orig.id,
      make: txt("make"),
      model: txt("model"),
      version: txt("version"),
      year: num("year"),
      mileage: num("mileage"),
      fuel: txt("fuel"),
      engine: num("engine"),
      power: num("power"),
      gearbox: txt("gearbox"),
      gearboxNote: txt("gearboxNote"),
      drive: txt("drive"),
      body: txt("body"),
      color: txt("color"),
      origin: txt("origin"),
      price: num("price"),
      negotiable: field("negotiable").checked,
      facts: facts,
      highlights: txt("highlights").split(/\n+/).map(function (s) { return s.trim(); }).filter(function (s, i, a) { return s && a.indexOf(s) === i; }),
      description: txt("description"),
      images: edit.images.slice(),
      otomoto: txt("otomoto"),
      hidden: !field("visible").checked
    };
    if (orig.imagePos && out.images[0] === (orig.images || [])[0]) out.imagePos = orig.imagePos;
    if (orig.imageAlt && orig.make === out.make && orig.model === out.model && out.images[0] === (orig.images || [])[0]) out.imageAlt = orig.imageAlt;
    Object.keys(out).forEach(function (k) {
      if (out[k] === "" || out[k] === null || out[k] === undefined || out[k] === false) delete out[k];
    });
    if (!out.facts) out.facts = {};
    if (!out.highlights) out.highlights = [];
    if (!out.images) out.images = [];
    return out;
  }

  // komunikat znika od razu, gdy poprawiasz pole
  function updateEditorMsg() {
    var left = $$("[data-err]", form).filter(function (p) { return !p.hidden; }).length;
    var msg = $("[data-ed-msg]");
    if (!left) msg.hidden = true;
    else if (!msg.hidden) msg.textContent = "Popraw zaznaczone pola (" + left + ").";
  }
  function clearFieldError(el) {
    if (!el || !el.name) return;
    el.removeAttribute("aria-invalid");
    var p = $('[data-err="' + el.name + '"]', form);
    if (p) p.hidden = true;
    updateEditorMsg();
  }
  form.addEventListener("input", function (e) { clearFieldError(e.target); });
  form.addEventListener("change", function (e) { clearFieldError(e.target); });

  function clearErrors() {
    $$("[data-err]", form).forEach(function (p) { p.hidden = true; });
    $$("[aria-invalid]", form).forEach(function (i) { i.removeAttribute("aria-invalid"); });
    $("[data-ed-msg]").hidden = true;
  }
  function validate(c) {
    clearErrors();
    var nowY = new Date().getFullYear();
    var errors = [];
    if (!c.make) errors.push(["make", "Wpisz markę."]);
    if (!c.model) errors.push(["model", "Wpisz model."]);
    if (!c.year || c.year % 1 || c.year < 1950 || c.year > nowY + 1) errors.push(["year", "Podaj rok od 1950 do " + (nowY + 1) + "."]);
    if (c.mileage == null || isNaN(c.mileage) || c.mileage < 0) errors.push(["mileage", "Podaj przebieg w km."]);
    if (!c.price || isNaN(c.price) || c.price <= 0) errors.push(["price", "Podaj cenę w zł."]);
    if (!c.fuel) errors.push(["fuel", "Wybierz rodzaj paliwa."]);
    if (c.engine != null && (isNaN(c.engine) || c.engine < 0)) errors.push(["engine", "Podaj pojemność w cm³."]);
    if (c.power != null && (isNaN(c.power) || c.power < 0)) errors.push(["power", "Podaj moc w KM."]);
    if (c.otomoto && !/^https?:\/\//i.test(c.otomoto)) errors.push(["otomoto", "Link powinien zaczynać się od https://"]);
    if (!c.images.length) errors.push(["images", "Dodaj co najmniej jedno zdjęcie."]);
    errors.forEach(function (er) {
      var p = $('[data-err="' + er[0] + '"]', form);
      if (p) { p.textContent = er[1]; p.hidden = false; }
      var input = field(er[0]);
      if (input && input.setAttribute) input.setAttribute("aria-invalid", "true");
    });
    if (errors.length) {
      var first = errors[0][0];
      var target = first === "images" ? $("[data-drop]", form) : field(first);
      if (target) {
        target.scrollIntoView({ block: "center", behavior: "smooth" });
        if (target.focus) setTimeout(function () { target.focus({ preventScroll: true }); }, 250);
      }
      var msg = $("[data-ed-msg]");
      msg.textContent = "Popraw zaznaczone pola (" + errors.length + ").";
      msg.hidden = false;
    }
    return !errors.length;
  }

  function openEditor(index) {
    var car = index == null ? { facts: {}, highlights: [], images: [] } : clone(st.cars[index]);
    edit = { index: index, car: car, images: (car.images || []).slice() };
    saved = false;
    $("[data-ed-title]").textContent = index == null ? "Nowe auto" : "Edycja: " + car.make + " " + car.model;
    fillForm(car);
    if (index == null) setVal("visible", true);
    $("[data-progress]").hidden = true;
    renderPhotos();
    ed.showModal();
    $(".adm-editor__body", ed).scrollTop = 0;
    document.documentElement.classList.add("is-locked");
  }
  function closeEditor() { if (ed.open) ed.close(); }
  ed.addEventListener("close", function () {
    document.documentElement.classList.remove("is-locked");
    if (!saved) S.cleanupImages(st.cars).catch(function () {});
    edit = null;
  });
  $$("[data-ed-cancel]").forEach(function (b) { b.addEventListener("click", closeEditor); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!edit) return;
    var out = readForm();
    if (!validate(out)) return;
    var isNew = edit.index == null;
    if (isNew) {
      out.id = uniqueId(out);
      st.cars.unshift(out);
    } else {
      st.cars[edit.index] = out;
    }
    saved = true;
    closeEditor();
    save(isNew ? "Dodano: " + out.make + " " + out.model + ". Auto jest już na stronie (na tym urządzeniu)." : "Zapisano zmiany: " + out.make + " " + out.model);
  });

  /* ---------- Zdjęcia w edytorze ---------- */
  function renderPhotos() {
    if (!edit) return;
    var listEl = $("[data-photos]");
    var refs = edit.images.slice();
    Promise.all(refs.map(urlOf)).then(function (us) {
      if (!edit) return;
      listEl.innerHTML = us.map(function (u, i) {
        return '<li class="adm-photo">' +
          '<img src="' + esc(u) + '" alt="Zdjęcie ' + (i + 1) + '">' +
          (i === 0 ? '<span class="adm-photo__main">Główne</span>' : "") +
          '<div class="adm-photo__tools">' +
            '<button type="button" class="adm-icon-btn" data-ph="left" data-i="' + i + '" aria-label="Przesuń w lewo"' + (i === 0 ? " disabled" : "") + ">" + icon("i-chev-l") + "</button>" +
            (i > 0 ? '<button type="button" class="adm-icon-btn" data-ph="main" data-i="' + i + '" aria-label="Ustaw jako główne" title="Ustaw jako główne">' + icon("i-star") + "</button>" : "") +
            '<button type="button" class="adm-icon-btn" data-ph="right" data-i="' + i + '" aria-label="Przesuń w prawo"' + (i === us.length - 1 ? " disabled" : "") + ">" + icon("i-chev-r") + "</button>" +
            '<button type="button" class="adm-icon-btn adm-icon-btn--danger" data-ph="del" data-i="' + i + '" aria-label="Usuń zdjęcie" title="Usuń zdjęcie">' + icon("i-trash") + "</button>" +
          "</div>" +
        "</li>";
      }).join("");
      $("[data-photo-count]").textContent = us.length ? us.length + " " + plural(us.length, "zdjęcie", "zdjęcia", "zdjęć") : "";
      if (us.length) { $('[data-err="images"]', form).hidden = true; updateEditorMsg(); }
    });
  }

  $("[data-photos]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-ph]");
    if (!b || !edit) return;
    var i = +b.getAttribute("data-i"), a = b.getAttribute("data-ph"), im = edit.images;
    if (a === "left" && i > 0) im.splice(i - 1, 0, im.splice(i, 1)[0]);
    if (a === "right" && i < im.length - 1) im.splice(i + 1, 0, im.splice(i, 1)[0]);
    if (a === "main") im.unshift(im.splice(i, 1)[0]);
    if (a === "del") im.splice(i, 1);
    renderPhotos();
  });

  function addFiles(fileList) {
    if (!edit) return;
    var files = Array.prototype.slice.call(fileList || []).filter(function (f) {
      return /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(f.name);
    });
    if (!files.length) return;
    var prog = $("[data-progress]");
    var done = 0, failed = [];
    prog.hidden = false;
    prog.textContent = "Przygotowuję zdjęcia: 0 z " + files.length;
    var chain = Promise.resolve();
    files.forEach(function (f) {
      chain = chain.then(function () {
        return S.processImage(f).then(S.saveImage).then(function (ref) {
          if (edit) { edit.images.push(ref); renderPhotos(); }
        }).catch(function () { failed.push(f.name); }).then(function () {
          done++;
          prog.textContent = "Przygotowuję zdjęcia: " + done + " z " + files.length;
        });
      });
    });
    chain.then(function () {
      var ok = files.length - failed.length;
      prog.textContent = failed.length
        ? "Nie udało się wczytać: " + failed.join(", ") + ". Zapisz te zdjęcia jako JPG i dodaj ponownie."
        : "Dodano " + ok + " " + plural(ok, "zdjęcie", "zdjęcia", "zdjęć") + ".";
      if (!failed.length) setTimeout(function () { prog.hidden = true; }, 2600);
    });
  }

  $("[data-files]").addEventListener("change", function () { addFiles(this.files); this.value = ""; });
  var drop = $("[data-drop]");
  ["dragenter", "dragover"].forEach(function (t) {
    drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("is-over"); });
  });
  ["dragleave", "drop"].forEach(function (t) {
    drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("is-over"); });
  });
  drop.addEventListener("drop", function (e) { addFiles(e.dataTransfer && e.dataTransfer.files); });

  /* ---------- Podpowiedzi wyposażenia ---------- */
  function renderChips() {
    var have = txt("highlights").toLowerCase().split(/\n+/).map(function (s) { return s.trim(); });
    $("[data-chips]").innerHTML = SUGGEST.map(function (s) {
      var on = have.indexOf(s.toLowerCase()) !== -1;
      return '<button type="button" class="adm-chip' + (on ? " is-on" : "") + '" data-chip="' + esc(s) + '" aria-pressed="' + on + '">' + (on ? icon("i-check") : "+ ") + esc(s) + "</button>";
    }).join("");
  }
  $("[data-chips]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-chip]");
    if (!b) return;
    var s = b.getAttribute("data-chip");
    var ta = field("highlights");
    var lines = ta.value.split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
    var idx = lines.map(function (x) { return x.toLowerCase(); }).indexOf(s.toLowerCase());
    if (idx === -1) lines.push(s); else lines.splice(idx, 1);
    ta.value = lines.join("\n");
    renderChips();
  });
  field("highlights").addEventListener("input", function () {
    clearTimeout(this._t);
    this._t = setTimeout(renderChips, 250);
  });

  /* ---------- Start ---------- */
  if (!S) { document.body.innerHTML = "<p style='padding:24px'>Brak pliku store.js.</p>"; return; }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
  if (authed()) showApp(); else showLogin();
})();
