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
    email: "samochody.danek_syn@o2.pl",
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
    facebook: "https://www.facebook.com/p/Auto-Komis-Danek-Syn-100024195412057/",
    instagram: "https://www.instagram.com/autokomisdanekisyn/",
    youtube: "",
    tiktok: "https://www.tiktok.com/@autokomisdanek",
    youtubeVideo: "https://www.youtube.com/watch?v=jQN-iTO20rs",
    googleReviews: "https://www.google.com/maps/search/?api=1&query=Auto%20Komis%20Danek%20%26%20Syn%20Rydu%C5%82towy",
    directions: "https://www.google.com/maps/dir/?api=1&destination=50.07286814,18.40691913"
  },

  // Oceny liczbowej z Google nie pokazujemy (decyzja komisu). Opinie edytuje się w panelu admina (inventory.js).
  reviews: {
    rating: null,
    count: null
  },

  // Film w tle zakładki "Poznaj naszą ofertę": wgraj plik MP4 do assets/video/ (instrukcja w README)
  media: {
    offerVideo: "assets/video/oferta.mp4"
  },

  // Panel admina (admin.html). Zmiana PIN-u: otwórz panel, w konsoli przeglądarki wpisz
  // danekHash("nowyPIN") i wynik wklej poniżej.
  admin: {
    pinHash: "5d1f5626"
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
