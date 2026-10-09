/* ==========================================================================
   OFERTA AUT (opublikowana, widzą ją wszyscy odwiedzający)
   Najwygodniej zmieniać ją w panelu admina (admin.html), który tworzy ten plik.
   Kolejność aut w tablicy = kolejność "Polecane" na stronie.

   Najważniejsze pola: id (link #auto-ID), make, model, version, year, mileage, fuel, price,
   images (lista zdjęć, pierwsze jest główne), facts (atuty), highlights (wyposażenie),
   description (opis), otomoto (link), hidden: true (auto ukryte na stronie).
   ========================================================================== */

window.DANEK_INVENTORY_VERSION = 0;

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
    images: ["assets/img/cars/audi-q3.webp"],
    imageAlt: "Białe Audi Q3 w komisie Danek & Syn",
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
    images: ["assets/img/cars/honda-civic.webp"],
    imagePos: "50% 64%",
    imageAlt: "Czarna Honda Civic",
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
    images: ["assets/img/cars/opel-mokka.webp"],
    imageAlt: "Brązowy Opel Mokka w komisie Danek & Syn",
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
    images: ["assets/img/cars/seat-leon.webp"],
    imageAlt: "Szary Seat Leon kombi w komisie Danek & Syn",
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
    images: ["assets/img/cars/nissan-qashqai.webp"],
    imageAlt: "Szary Nissan Qashqai w komisie Danek & Syn",
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
    images: ["assets/img/cars/ford-kuga.webp"],
    imageAlt: "Srebrny Ford Kuga ST-Line w komisie Danek & Syn",
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
    images: ["assets/img/cars/ford-fiesta.webp"],
    imageAlt: "Niebieski Ford Fiesta ST-Line w komisie Danek & Syn",
    otomoto: "https://danek.otomoto.pl/inventory"
  }
];

// Galeria: zdjęcia aut sprzedanych wcześniej (dodawane w panelu admina).
// NA RAZIE DO TESTU: aktualne zdjęcia aut. Komis zastąpi je własnymi w panelu (zakładka Galeria).
window.DANEK_GALLERY = [
  "assets/img/cars/audi-q3.webp",
  "assets/img/cars/ford-fiesta.webp",
  "assets/img/cars/ford-kuga.webp",
  "assets/img/cars/honda-civic.webp",
  "assets/img/cars/nissan-qashqai.webp",
  "assets/img/cars/opel-mokka.webp",
  "assets/img/cars/seat-leon.webp"
];

// Opinie klientów z Google pokazywane w przewijanej taśmie (edycja w panelu admina)
window.DANEK_REVIEWS = [
  {
    "author": "Kamil N.",
    "text": "Polecam. Bardzo miła obsługa. Kupiłem miesiąc temu Audi A4 B9 2.0 40 TFSI. Samochód sprawdzony przed zakupem, na stacji diagnostycznej opinia serwisanta: super stan. Dwa tygodnie po zakupie serwis startowy i kolejna opinia mechanika jak najbardziej pozytywna. Po miesiącu użytkowania jestem bardzo zadowolony i nie mam się do czego przyczepić.",
    "car": "Audi A4 B9"
  },
  {
    "author": "Ewa B.",
    "text": "Polecam sprzedającego, konkretny sprzedawca! Opinia późna, bo po przejechaniu około 10 tys. km i sprawdzeniu auta w trasie. Brak ukrytych wad. Całość zgodna z opisem i wiarygodna rozmowa ze sprzedającym już przy pierwszym kontakcie telefonicznym. Szybka procedura zakupu, bezproblemowy sprzedawca (auto zakupione do koloru szminki 🙂).",
    "car": "Skoda Superb Sportline"
  },
  {
    "author": "Piotr Z.",
    "text": "Zdecydowanie polecam, absolutnie pełny profesjonalizm i uczciwość. Konkretna komunikacja, stan samochodu potwierdził się w 100%. Samochód pięknie utrzymany, taki, jakiego szukaliśmy 3 miesiące. Z pewnością wrócę po następny, tylko do komisu Danek & Syn.",
    "car": "Audi A4"
  },
  {
    "author": "Aleksandra S.",
    "text": "Serdecznie polecam! Już nie jedno auto w mojej rodzinie zostało tam kupione i wszyscy są zadowoleni, łącznie ze mną. Auta są zadbane, czyste i sprawne. Ludzie, którzy tam pracują, są prawdziwymi profesjonalistami. Polecam także Przygucki Car Detailing, który współpracuje z komisem: autka wyjeżdżają jak po SPA."
  },
  {
    "author": "Marta",
    "text": "W komisie kupiłam moje pierwsze auto w bardzo dobrym stanie i w dobrej cenie. Właściciel bardzo profesjonalny, rzetelny, ale przede wszystkim szczery i uczciwy. Warto było przejechać 300 km po samochód. Polecam :)"
  },
  {
    "author": "Zbigniew P.",
    "text": "Auto kupione pół roku temu i nadal jeździ, więc dobry zakup. Warto było jechać ponad 300 km. Sprzedający udostępnia bardzo dużo dokładnych zdjęć przez WhatsApp, więc na miejscu naprawdę brak jakiegokolwiek zaskoczenia co do wyglądu auta. Jednym słowem polecam ten komis."
  },
  {
    "author": "Kinga M.",
    "text": "Bardzo duży wybór aut. Kompetentni i przemili pracownicy. Wszystko można załatwić na miejscu, sprawnie, szybko, bez problemów. Przy okazji można skorzystać z usług detailingu: perfekcyjne, kompleksowe mycie aut. Z komisu wyjeżdża się jak nowym autem z salonu! Najlepszy komis w mieście i okolicy."
  },
  {
    "author": "Mateusz G.",
    "text": "To pierwszy komis, w którym kupiłem samochód, i szczerze powiem, że na pewno bym tu wrócił. Bardzo sympatyczni właściciele. W stu procentach da się z nimi dogadać, nie stwarzają żadnego problemu. Polecam!"
  },
  {
    "author": "Paweł G.",
    "text": "Świetne podejście do klienta. Wstrzymałem się jakiś czas z komentarzem, żeby zobaczyć, czy coś się będzie działo, ale żadnych problemów z autem. Świetne samochody i jest z czego wybierać. Ze swojego jestem bardzo zadowolony, dziękuję!"
  },
  {
    "author": "Agata K.",
    "text": "Zakup wymarzonego samochodu w tym komisie to duża przyjemność. Bardzo miła i kompetentna obsługa. Samochód zgodny z opisem. Transakcja przebiegła bezproblemowo i z wielkim profesjonalizmem. Serdecznie polecamy!"
  },
  {
    "author": "Michałek",
    "text": "Bardzo miła i profesjonalna obsługa. Samochód całkowicie zgodny z opisem, przygotowany do jazdy. Polecam, bo warto! Nowy właściciel Audi A3 ;)",
    "car": "Audi A3"
  },
  {
    "author": "Marcin",
    "text": "Jak najbardziej polecam. Bardzo miła obsługa. Auto kupiłem miesiąc temu, zgodne z opisem, jeździ bez zarzutu. Jestem zadowolony z zakupu. Pozdrawiam, właściciel Leona FR!",
    "car": "Seat Leon FR"
  }
];
