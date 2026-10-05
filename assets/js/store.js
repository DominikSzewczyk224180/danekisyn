/* ==========================================================================
   MAGAZYN DANYCH OFERTY (wspólny dla strony i panelu admina)

   Oferta opublikowana: assets/js/inventory.js (to widzą wszyscy).
   Zmiany z panelu admina: IndexedDB w tej przeglądarce (to widzi tylko to urządzenie),
   razem ze zdjęciami. Strona pokazuje zmiany lokalne, jeśli są nowsze od opublikowanej oferty.
   "Opublikuj" w panelu tworzy paczkę ZIP z nowym inventory.js i zdjęciami do wgrania na GitHub.
   Po wgraniu paczki strona sama rozpozna, że zmiany są już opublikowane.
   ========================================================================== */
(function () {
  "use strict";

  var DB_NAME = "danek-syn-admin";
  var DB_VERSION = 1;
  var dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!("indexedDB" in window)) { reject(new Error("Brak IndexedDB")); return; }
      var req;
      try { req = indexedDB.open(DB_NAME, DB_VERSION); } catch (e) { reject(e); return; }
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
        if (!db.objectStoreNames.contains("images")) db.createObjectStore("images");
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
      req.onblocked = function () { reject(new Error("Baza zablokowana")); };
    });
    dbPromise.catch(function () { dbPromise = null; });
    return dbPromise;
  }

  function run(store, mode, fn) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var t = db.transaction(store, mode);
        var req = fn(t.objectStore(store));
        var result;
        if (req) req.onsuccess = function () { result = req.result; };
        t.oncomplete = function () { resolve(result); };
        t.onerror = function () { reject(t.error); };
        t.onabort = function () { reject(t.error || new Error("Przerwano zapis")); };
      });
    });
  }
  function idbGet(store, key) { return run(store, "readonly", function (s) { return s.get(key); }); }
  function idbPut(store, key, value) { return run(store, "readwrite", function (s) { return s.put(value, key); }); }
  function idbDel(store, key) { return run(store, "readwrite", function (s) { return s.delete(key); }); }
  function idbKeys(store) { return run(store, "readonly", function (s) { return s.getAllKeys(); }); }
  function idbClear(store) { return run(store, "readwrite", function (s) { return s.clear(); }); }

  /* ---------- Oferta ---------- */
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function publishedCars() { return clone(window.DANEK_INVENTORY || []).map(normalize); }
  function publishedVersion() { return +window.DANEK_INVENTORY_VERSION || 0; }

  // starszy format (image) zamieniamy na listę zdjęć
  function normalize(c) {
    if (!Array.isArray(c.images)) c.images = c.image ? [c.image] : [];
    delete c.image;
    delete c.lowest30;
    delete c.photos;
    if (!c.facts) c.facts = {};
    if (!Array.isArray(c.highlights)) c.highlights = [];
    return c;
  }

  function load() {
    return idbGet("meta", "inventory").then(function (local) {
      if (local && Array.isArray(local.cars) && local.updatedAt > publishedVersion()) {
        return { cars: local.cars.map(normalize), source: "local", updatedAt: local.updatedAt };
      }
      if (local) clearLocal().catch(function () {}); // te zmiany są już opublikowane
      return { cars: publishedCars(), source: "published", updatedAt: publishedVersion() };
    }).catch(function () {
      return { cars: publishedCars(), source: "published", updatedAt: publishedVersion(), storageError: true };
    });
  }

  function saveLocal(cars) {
    var meta = { cars: clone(cars.map(stripRuntime)), updatedAt: Date.now() };
    return idbPut("meta", "inventory", meta).then(function () { return meta; });
  }

  function clearLocal() {
    revokeAll();
    return Promise.all([idbDel("meta", "inventory"), idbClear("images")]);
  }

  function stripRuntime(c) {
    var copy = {};
    Object.keys(c).forEach(function (k) { if (k !== "imageUrls") copy[k] = c[k]; });
    return copy;
  }

  /* ---------- Zdjęcia ---------- */
  var urlCache = {};
  function isLocalRef(ref) { return /^idb:/.test(ref); }
  function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function saveImage(blob) {
    var id = newId();
    return idbPut("images", id, blob).then(function () { return "idb:" + id; });
  }
  function imageBlob(ref) { return idbGet("images", ref.slice(4)); }
  function imageUrl(ref) {
    if (!isLocalRef(ref)) return Promise.resolve(ref);
    if (urlCache[ref]) return Promise.resolve(urlCache[ref]);
    return imageBlob(ref).then(function (b) {
      if (!b) return "";
      urlCache[ref] = URL.createObjectURL(b);
      return urlCache[ref];
    }).catch(function () { return ""; });
  }
  function revokeAll() {
    Object.keys(urlCache).forEach(function (k) { URL.revokeObjectURL(urlCache[k]); });
    urlCache = {};
  }
  // usuwa zdjęcia, których nie używa żadne auto (np. po usunięciu auta albo anulowaniu edycji)
  function cleanupImages(cars) {
    var used = {};
    cars.forEach(function (c) { (c.images || []).forEach(function (r) { if (isLocalRef(r)) used[r.slice(4)] = true; }); });
    return idbKeys("images").then(function (keys) {
      return Promise.all((keys || []).filter(function (k) { return !used[k]; }).map(function (k) {
        if (urlCache["idb:" + k]) { URL.revokeObjectURL(urlCache["idb:" + k]); delete urlCache["idb:" + k]; }
        return idbDel("images", k);
      }));
    });
  }
  function resolveCars(cars) {
    return Promise.all(cars.map(function (c) {
      return Promise.all((c.images || []).map(imageUrl)).then(function (urls) {
        var copy = Object.assign({}, c);
        copy.imageUrls = urls.filter(Boolean);
        return copy;
      });
    }));
  }

  // Zmniejsza zdjęcie z telefonu/aparatu do max 1600 px (dłuższy bok), WebP albo JPEG
  function processImage(file, maxSide) {
    maxSide = maxSide || 1600;
    return new Promise(function (resolve, reject) {
      var src = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight;
        var s = Math.min(1, maxSide / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * s)), ch = Math.max(1, Math.round(h * s));
        var cv = document.createElement("canvas");
        cv.width = cw; cv.height = ch;
        var ctx = cv.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, cw, ch);
        URL.revokeObjectURL(src);
        cv.toBlob(function (webp) {
          if (webp && webp.type === "image/webp") { resolve(webp); return; }
          cv.toBlob(function (jpg) { if (jpg) resolve(jpg); else reject(new Error("Nie udało się zapisać zdjęcia")); }, "image/jpeg", 0.86);
        }, "image/webp", 0.84);
      };
      img.onerror = function () { URL.revokeObjectURL(src); reject(new Error("Nie udało się odczytać pliku " + file.name)); };
      img.src = src;
    });
  }

  /* ---------- Paczka do publikacji (ZIP bez kompresji, bez bibliotek) ---------- */
  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(u8) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function makeZip(files) {
    var enc = new TextEncoder();
    var parts = [], central = [], offset = 0;
    var d = new Date();
    var time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    var date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach(function (f) {
      var name = enc.encode(f.name), data = f.data, crc = crc32(data);
      var lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(8, 0, true); lh.setUint16(10, time, true); lh.setUint16(12, date, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      var ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, time, true); ch.setUint16(14, date, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
      ch.setUint16(28, name.length, true); ch.setUint16(30, 0, true); ch.setUint16(32, 0, true);
      ch.setUint16(34, 0, true); ch.setUint16(36, 0, true); ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + data.length;
    });
    var cdSize = central.reduce(function (a, p) { return a + p.length; }, 0);
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(4, 0, true); end.setUint16(6, 0, true);
    end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true); end.setUint16(20, 0, true);
    return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]), { type: "application/zip" });
  }

  function blobBytes(b) {
    if (b.arrayBuffer) return b.arrayBuffer().then(function (buf) { return new Uint8Array(buf); });
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(new Uint8Array(fr.result)); };
      fr.onerror = function () { reject(fr.error); };
      fr.readAsArrayBuffer(b);
    });
  }

  function inventoryFile(cars, version) {
    var stamp = new Date(version || Date.now()).toLocaleString("pl-PL");
    return "/* ==========================================================================\n" +
      "   OFERTA AUT: plik wygenerowany przez panel admina (" + stamp + ").\n" +
      "   Najwygodniej edytować w panelu (admin.html). Ręcznie też można, zachowując format.\n" +
      "   ========================================================================== */\n\n" +
      "window.DANEK_INVENTORY_VERSION = " + (version || 0) + ";\n\n" +
      "window.DANEK_INVENTORY = " + JSON.stringify(cars, null, 2) + ";\n";
  }

  var PUBLISH_README =
    "JAK OPUBLIKOWAĆ OFERTĘ\n\n" +
    "1. Rozpakuj tę paczkę do głównego folderu strony (tam, gdzie leży index.html).\n" +
    "   Zastąp plik assets/js/inventory.js i dodaj nowe zdjęcia z assets/img/cars/.\n" +
    "2. Wyślij zmiany na GitHub (commit i push) albo przekaż paczkę osobie, która opiekuje się stroną.\n" +
    "3. Po kilku minutach oferta będzie widoczna dla wszystkich.\n" +
    "   Panel admina sam rozpozna, że zmiany zostały opublikowane.\n";

  function exportZip(cars, version) {
    var files = [];
    var enc = new TextEncoder();
    return Promise.all(cars.map(function (c) {
      return Promise.all((c.images || []).map(function (ref) {
        if (!isLocalRef(ref)) return ref;
        return imageBlob(ref).then(function (b) {
          if (!b) return null;
          var ext = b.type === "image/webp" ? "webp" : b.type === "image/png" ? "png" : "jpg";
          var path = "assets/img/cars/" + c.id + "-" + ref.slice(4) + "." + ext;
          return blobBytes(b).then(function (bytes) { files.push({ name: path, data: bytes }); return path; });
        });
      })).then(function (paths) {
        var out = stripRuntime(c);
        out.images = paths.filter(Boolean);
        return out;
      });
    })).then(function (outCars) {
      files.push({ name: "assets/js/inventory.js", data: enc.encode(inventoryFile(outCars, version)) });
      files.push({ name: "JAK-OPUBLIKOWAC.txt", data: enc.encode(PUBLISH_README) });
      return makeZip(files);
    });
  }

  window.DanekStore = {
    load: load,
    saveLocal: saveLocal,
    clearLocal: clearLocal,
    saveImage: saveImage,
    imageUrl: imageUrl,
    cleanupImages: cleanupImages,
    resolveCars: resolveCars,
    processImage: processImage,
    exportZip: exportZip,
    isLocalRef: isLocalRef,
    publishedVersion: publishedVersion
  };
})();
