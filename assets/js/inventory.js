/* ==========================================================================
   OFERTA AUT
   Dane przepisane z ogłoszeń komisu na Otomoto (stan na 4.10.2026).
   Kolejność w tablicy = kolejność "Kolejność komisu" na stronie.

   Pola:
     id          unikalny identyfikator, trafia do linku (#auto-ID)
     price       cena w zł
     lowest30    najniższa cena z 30 dni przed obniżką (wymóg dyrektywy Omnibus).
                 Wpisz tylko, gdy cena została obniżona. Wtedy auto dostaje oznaczenie "Cena obniżona".
     negotiable  true = "Cena do negocjacji"
     facts       atuty auta (pokazywane jako odznaki), tylko te potwierdzone w ogłoszeniu
     highlights  wybrane wyposażenie (6 do 8 pozycji)
     image       zdjęcie 4:3, najlepiej 1600 x 1200 px w formacie WebP
     imagePos    opcjonalnie: kadrowanie zdjęcia (CSS object-position)
     photos      liczba zdjęć w ogłoszeniu na Otomoto
     otomoto     link do ogłoszenia
   ========================================================================== */

window.DANEK_INVENTORY = [
  {
    id: "audi-q3-2019",
    make: "Audi",
    model: "Q3",
    version: "2.0 TFSI quattro S tronic",
    year: 2019,
    mileage: 75000,
    fuel: "Benzyna",
    engine: 1984,
    power: 230,
    gearbox: "Automatyczna",
    gearboxNote: "S tronic, 7 biegów",
    drive: "4x4 (quattro)",
    body: "SUV",
    color: "Biały metalik",
    origin: "Niemcy",
    price: 94900,
    negotiable: true,
    facts: { firstOwner: true, aso: true, noSmoking: true, twoKeys: true },
    highlights: [
      "Reflektory Matrix LED",
      "Audi Virtual Cockpit",
      "Tempomat adaptacyjny",
      "Skóra z Alcantarą",
      "Elektryczna klapa bagażnika",
      "Apple CarPlay i Android Auto",
      "Podgrzewane fotele",
      "Keyless Go"
    ],
    image: "assets/img/cars/audi-q3.webp",
    imageAlt: "Białe Audi Q3 na placu komisu Danek & Syn",
    photos: 40,
    otomoto: "https://www.otomoto.pl/osobowe/oferta/audi-q3-ID6Igw3p.html"
  },
  {
    id: "honda-civic-2015",
    make: "Honda",
    model: "Civic",
    version: "1.6 i-DTEC Elegance",
    year: 2015,
    mileage: 290000,
    fuel: "Diesel",
    engine: 1597,
    power: 120,
    gearbox: "Manualna",
    gearboxNote: "6 biegów",
    drive: "Na przednie koła",
    body: "Hatchback, 5 drzwi",
    color: "Czarny",
    origin: "Dania",
    price: 21900,
    lowest30: 23900, // TODO: potwierdź z komisem (na Otomoto obniżka o 2 000 zł)
    negotiable: false,
    facts: { warranty: "12 miesięcy", accidentFree: true, firstOwner: true, aso: true },
    highlights: [
      "Gwarancja na 12 miesięcy",
      "Kamera cofania",
      "Szklany dach",
      "Podgrzewane fotele",
      "Klimatyzacja dwustrefowa",
      "Czujniki parkowania przód i tył",
      "Reflektory bi-ksenonowe",
      "Keyless Go"
    ],
    image: "assets/img/cars/honda-civic.webp",
    imagePos: "50% 64%",
    imageAlt: "Czarna Honda Civic",
    photos: 11,
    otomoto: "https://www.otomoto.pl/osobowe/oferta/honda-civic-ID6Ifa1f.html"
  },
  {
    id: "opel-mokka-2013",
    make: "Opel",
    model: "Mokka",
    version: "1.4 Turbo Cosmo 4x4",
    year: 2013,
    mileage: 132408,
    fuel: "Benzyna",
    engine: 1364,
    power: 140,
    gearbox: "Manualna",
    gearboxNote: "6 biegów",
    drive: "4x4",
    body: "SUV",
    color: "Brązowy metalik",
    origin: "Niemcy",
    price: 32900,
    negotiable: true,
    facts: { registeredPL: true, inspection: "do 04.2027", aso: true, noSmoking: true, twoKeys: true },
    highlights: [
      "Napęd 4x4",
      "Podgrzewana kierownica",
      "Podgrzewane fotele",
      "Nawigacja",
      "Klimatyzacja dwustrefowa",
      "Czujniki parkowania przód i tył",
      "Tempomat",
      "Felgi aluminiowe 18 cali"
    ],
    image: "assets/img/cars/opel-mokka.webp",
    imageAlt: "Brązowy Opel Mokka na placu komisu Danek & Syn",
    photos: 40,
    otomoto: "https://www.otomoto.pl/osobowe/oferta/opel-mokka-ID6If8U0.html"
  },
  {
    id: "seat-leon-2018",
    make: "Seat",
    model: "Leon",
    version: "2.0 TDI DSG Xcellence",
    year: 2018,
    mileage: 229000,
    fuel: "Diesel",
    engine: 1968,
    power: 150,
    gearbox: "Automatyczna",
    gearboxNote: "DSG",
    drive: "Na przednie koła",
    body: "Kombi",
    color: "Szary metalik",
    origin: "Dania",
    price: 39900,
    lowest30: 42900, // TODO: potwierdź z komisem (na Otomoto obniżka o 3 000 zł)
    negotiable: true,
    facts: { firstOwner: true, accidentFree: true, aso: true, noSmoking: true },
    highlights: [
      "Virtual Cockpit",
      "Tempomat adaptacyjny",
      "Apple CarPlay i Android Auto",
      "Nawigacja",
      "Asystent martwego pola",
      "Podgrzewane fotele",
      "Łopatki zmiany biegów",
      "Felgi aluminiowe 18 cali"
    ],
    image: "assets/img/cars/seat-leon.webp",
    imageAlt: "Szary Seat Leon kombi na placu komisu Danek & Syn",
    photos: 34,
    otomoto: "https://www.otomoto.pl/osobowe/oferta/seat-leon-ID6Ie9o2.html"
  },
  {
    id: "nissan-qashqai-2016",
    make: "Nissan",
    model: "Qashqai",
    version: "1.6 dCi Xtronic N-Connecta",
    year: 2016,
    mileage: 157000,
    fuel: "Diesel",
    engine: 1598,
    power: 130,
    gearbox: "Automatyczna",
    gearboxNote: "Xtronic",
    drive: "Na przednie koła",
    body: "SUV",
    color: "Szary metalik",
    origin: "Dania",
    price: 39900,
    negotiable: true,
    facts: { accidentFree: true, firstOwner: true, aso: true, originalPaint: true, noSmoking: true, twoKeys: true },
    highlights: [
      "Kamera 360°",
      "Hak holowniczy",
      "Nawigacja",
      "Felgi aluminiowe 19 cali",
      "Podgrzewane fotele",
      "Klimatyzacja dwustrefowa",
      "Keyless Go",
      "Świeżo po serwisie"
    ],
    image: "assets/img/cars/nissan-qashqai.webp",
    imageAlt: "Szary Nissan Qashqai na placu komisu Danek & Syn",
    photos: 37,
    otomoto: "https://www.otomoto.pl/osobowe/oferta/nissan-qashqai-ID6Ie3hK.html"
  },
  {
    id: "ford-kuga-2021",
    make: "Ford",
    model: "Kuga",
    version: "2.5 Duratec PHEV ST-Line",
    year: 2021,
    mileage: 60035,
    fuel: "Hybryda plug-in",
    engine: 2488,
    power: 225,
    gearbox: "Automatyczna",
    drive: "Na przednie koła",
    body: "SUV",
    color: "Srebrny metalik",
    origin: "Niemcy",
    price: 97900,
    lowest30: 99900, // TODO: potwierdź z komisem (na Otomoto obniżka o 2 000 zł)
    negotiable: true,
    facts: { firstOwner: true, aso: true, noSmoking: true, twoKeys: true },
    highlights: [
      "Dach panoramiczny",
      "Wyświetlacz Head-Up",
      "Nagłośnienie Bang & Olufsen",
      "Tempomat adaptacyjny",
      "Podgrzewana kierownica i szyba",
      "Elektryczny hak",
      "Klapa otwierana ruchem stopy",
      "Apple CarPlay i Android Auto"
    ],
    image: "assets/img/cars/ford-kuga.webp",
    imageAlt: "Srebrny Ford Kuga ST-Line na placu komisu Danek & Syn",
    photos: 40,
    otomoto: "https://www.otomoto.pl/osobowe/oferta/ford-kuga-ID6IanwW.html"
  },
  {
    // TODO: uzupełnij z ogłoszenia (moc, skrzynia, wyposażenie, link). Wersja odczytana ze zdjęcia.
    id: "ford-fiesta-2018",
    make: "Ford",
    model: "Fiesta",
    version: "1.0 EcoBoost ST-Line",
    year: 2018,
    mileage: 127500,
    fuel: "Benzyna",
    engine: 998,
    power: null,
    gearbox: null,
    body: "Hatchback",
    color: "Niebieski",
    price: 36900,
    negotiable: false,
    facts: {},
    highlights: [],
    image: "assets/img/cars/ford-fiesta.webp",
    imageAlt: "Niebieski Ford Fiesta ST-Line na placu komisu Danek & Syn",
    photos: null,
    otomoto: "https://danek.otomoto.pl/inventory"
  }
];
