/* ==========================================================================
   KONFIGURACJA STRONY: Auto Komis Danek & Syn
   Tu zmieniasz dane firmy, godziny, oceny, social media i formularz.
   Oferta aut jest osobno, w pliku inventory.js.
   ========================================================================== */

window.DANEK_CONFIG = {
  business: {
    name: "Auto Komis Danek & Syn",
    phone: "+48792624919",
    phoneDisplay: "792 624 919",
    email: "samochody.danek@interia.pl",
    street: "ul. Raciborska 267",
    zip: "44-280",
    city: "Rydułtowy",
    // Współrzędne z profilu Otomoto
    lat: 50.07286814,
    lng: 18.40691913,
    // Godziny otwarcia: [otwarcie, zamknięcie], indeks 0 = poniedziałek, null = zamknięte
    hours: [
      ["09:00", "17:00"],
      ["09:00", "17:00"],
      ["09:00", "17:00"],
      ["09:00", "17:00"],
      ["09:00", "17:00"],
      ["09:00", "14:00"],
      null
    ]
  },

  // Linki zewnętrzne. Puste pola są ukrywane na stronie.
  links: {
    otomoto: "https://danek.otomoto.pl/inventory",
    facebook: "",   // TODO: wklej adres profilu (w ogłoszeniach: "Auto Komis DanekiSyn")
    instagram: "",  // TODO
    youtube: "",    // TODO
    tiktok: "",     // TODO
    googleReviews: "https://www.google.com/maps/search/?api=1&query=Auto%20Komis%20Danek%20%26%20Syn%20Rydu%C5%82towy",
    directions: "https://www.google.com/maps/dir/?api=1&destination=50.07286814,18.40691913",
    mapEmbed: "https://www.google.com/maps?q=Auto+Komis+Danek+%26+Syn,+Raciborska+267,+44-280+Rydu%C5%82towy&z=16&output=embed"
  },

  // Ocena Google. TODO: sprawdź w profilu Google przed publikacją.
  // Ustaw rating: null, żeby ukryć ocenę na stronie.
  reviews: {
    rating: 4.6,
    count: 82,
    // Opcjonalnie: 3 prawdziwe opinie z Google (skopiowane dosłownie, z imieniem autora).
    // Jeśli lista jest pusta, sekcja pokazuje tylko ocenę i wyróżnienia.
    quotes: [
      // { author: "Imię N.", text: "Treść opinii", source: "Google" }
    ]
  },

  // Panel admina (admin.html). Zmiana PIN-u: otwórz panel, w konsoli przeglądarki wpisz
  // danekHash("nowyPIN") i wynik wklej poniżej.
  admin: {
    pinHash: "4fe43efc"
  },

  // Kalkulator raty: wartości startowe symulacji (nie oferta)
  financing: {
    rate: 9.9,        // oprocentowanie roczne w %
    months: 84,       // domyślna liczba rat
    minMonths: 12,
    maxMonths: 120,
    maxDownPct: 60    // maksymalny wkład własny w %
  }
};
