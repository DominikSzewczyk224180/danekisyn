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
    facebook: "https://www.facebook.com/p/Auto-Komis-Danek-Syn-100024195412057/",
    instagram: "https://www.instagram.com/autokomisdanekisyn/",
    youtube: "",
    tiktok: "https://www.tiktok.com/@autokomisdanek",
    googleReviews: "https://www.google.com/maps/search/?api=1&query=Auto%20Komis%20Danek%20%26%20Syn%20Rydu%C5%82towy",
    directions: "https://www.google.com/maps/dir/?api=1&destination=50.07286814,18.40691913"
  },

  // Ocena Google. TODO: sprawdź w profilu Google przed publikacją.
  // Ustaw rating: null, żeby ukryć ocenę na stronie.
  reviews: {
    rating: 4.6,
    count: 82,
    // Opcjonalnie: 3 prawdziwe opinie z Google (skopiowane dosłownie, z imieniem autora).
    // Jeśli lista jest pusta, sekcja pokazuje tylko ocenę i wyróżnienia.
    // Wybrane opinie z Google (nazwiska skrócone do inicjału). Pokazują się w przewijanej taśmie.
    quotes: [
      {"author": "Kamil N.", "text": "Polecam. Bardzo miła obsługa. Kupiłem miesiąc temu Audi A4 B9 2.0 40 TFSI. Samochód sprawdzony przed zakupem, na stacji diagnostycznej opinia serwisanta: super stan. Dwa tygodnie po zakupie serwis startowy i kolejna opinia mechanika jak najbardziej pozytywna. Po miesiącu użytkowania jestem bardzo zadowolony i nie mam się do czego przyczepić.", "car": "Audi A4 B9"},
      {"author": "Ewa B.", "text": "Polecam sprzedającego, konkretny sprzedawca! Opinia późna, bo po przejechaniu około 10 tys. km i sprawdzeniu auta w trasie. Brak ukrytych wad. Całość zgodna z opisem i wiarygodna rozmowa ze sprzedającym już przy pierwszym kontakcie telefonicznym. Szybka procedura zakupu, bezproblemowy sprzedawca (auto zakupione do koloru szminki 🙂).", "car": "Skoda Superb Sportline"},
      {"author": "Piotr Z.", "text": "Zdecydowanie polecam, absolutnie pełny profesjonalizm i uczciwość. Konkretna komunikacja, stan samochodu potwierdził się w 100%. Samochód pięknie utrzymany, taki, jakiego szukaliśmy 3 miesiące. Z pewnością wrócę po następny, tylko do komisu Danek & Syn.", "car": "Audi A4"},
      {"author": "Aleksandra S.", "text": "Serdecznie polecam! Już nie jedno auto w mojej rodzinie zostało tam kupione i wszyscy są zadowoleni, łącznie ze mną. Auta są zadbane, czyste i sprawne. Ludzie, którzy tam pracują, są prawdziwymi profesjonalistami. Polecam także Przygucki Car Detailing, który współpracuje z komisem: autka wyjeżdżają jak po SPA."},
      {"author": "Marta", "text": "W komisie kupiłam moje pierwsze auto w bardzo dobrym stanie i w dobrej cenie. Właściciel bardzo profesjonalny, rzetelny, ale przede wszystkim szczery i uczciwy. Warto było przejechać 300 km po samochód. Polecam :)"},
      {"author": "Zbigniew P.", "text": "Auto kupione pół roku temu i nadal jeździ, więc dobry zakup. Warto było jechać ponad 300 km. Sprzedający udostępnia bardzo dużo dokładnych zdjęć przez WhatsApp, więc na miejscu naprawdę brak jakiegokolwiek zaskoczenia co do wyglądu auta. Jednym słowem polecam ten komis."},
      {"author": "Kinga M.", "text": "Bardzo duży wybór aut. Kompetentni i przemili pracownicy. Wszystko można załatwić na miejscu, sprawnie, szybko, bez problemów. Przy okazji można skorzystać z usług detailingu: perfekcyjne, kompleksowe mycie aut. Z komisu wyjeżdża się jak nowym autem z salonu! Najlepszy komis w mieście i okolicy."},
      {"author": "Mateusz G.", "text": "To pierwszy komis, w którym kupiłem samochód, i szczerze powiem, że na pewno bym tu wrócił. Bardzo sympatyczni właściciele. W stu procentach da się z nimi dogadać, nie stwarzają żadnego problemu. Polecam!"},
      {"author": "Paweł G.", "text": "Świetne podejście do klienta. Wstrzymałem się jakiś czas z komentarzem, żeby zobaczyć, czy coś się będzie działo, ale żadnych problemów z autem. Świetne samochody i jest z czego wybierać. Ze swojego jestem bardzo zadowolony, dziękuję!"},
      {"author": "Agata K.", "text": "Zakup wymarzonego samochodu w tym komisie to duża przyjemność. Bardzo miła i kompetentna obsługa. Samochód zgodny z opisem. Transakcja przebiegła bezproblemowo i z wielkim profesjonalizmem. Serdecznie polecamy!"},
      {"author": "Michałek", "text": "Bardzo miła i profesjonalna obsługa. Samochód całkowicie zgodny z opisem, przygotowany do jazdy. Polecam, bo warto! Nowy właściciel Audi A3 ;)", "car": "Audi A3"},
      {"author": "Marcin", "text": "Jak najbardziej polecam. Bardzo miła obsługa. Auto kupiłem miesiąc temu, zgodne z opisem, jeździ bez zarzutu. Jestem zadowolony z zakupu. Pozdrawiam, właściciel Leona FR!", "car": "Seat Leon FR"}
    ]
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
