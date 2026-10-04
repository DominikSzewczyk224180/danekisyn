# Auto Komis Danek & Syn: strona internetowa

Statyczna strona (HTML, CSS, JavaScript, bez bibliotek i bez WordPressa) przygotowana pod GitHub Pages.

## Struktura

```
index.html                  strona główna
polityka-prywatnosci.html   wzór polityki prywatności (uzupełnij dane firmy)
404.html                    strona błędu, GitHub Pages pokazuje ją automatycznie
robots.txt, sitemap.xml     dla wyszukiwarek (wpisz domenę)
.nojekyll                   GitHub Pages serwuje pliki bez przetwarzania
assets/
  css/style.css
  js/config.js              dane firmy, godziny, ocena Google, social media, formularz, kalkulator
  js/inventory.js           oferta aut
  js/main.js                logika strony (zwykle nie trzeba jej ruszać)
  fonts/                    Barlow i Barlow Condensed, hostowane lokalnie
  img/                      logo i napis w SVG, favicony, obrazek do udostępnień, zdjęcia aut
```

## Podgląd na komputerze

Najlepiej przez lokalny serwer (fonty i wszystkie funkcje działają wtedy tak jak w internecie):

```
python3 -m http.server 8000
```

i otwórz http://localhost:8000. W VS Code można też użyć rozszerzenia Live Server.

## Publikacja na GitHub Pages

1. Utwórz repozytorium, na przykład `danek-syn`.
2. Wgraj zawartość tego folderu tak, żeby `index.html` był w katalogu głównym repozytorium (razem z ukrytym plikiem `.nojekyll`).
3. Settings → Pages → Build and deployment → Source: **Deploy from a branch**, gałąź `main`, folder `/ (root)`, Save.
4. Po chwili strona będzie dostępna pod `https://TWOJ-LOGIN.github.io/danek-syn/`.

## Własna domena (zalecane)

1. Kup domenę (sprawdź dostępność, np. danekisyn.pl albo komisdanek.pl).
2. Settings → Pages → Custom domain: wpisz `www.twoja-domena.pl`. GitHub sam doda plik `CNAME`.
3. U rejestratora domeny ustaw:
   * rekord `CNAME` dla `www` wskazujący na `TWOJ-LOGIN.github.io`,
   * rekordy `A` dla domeny bez www: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
4. Po weryfikacji zaznacz **Enforce HTTPS**.
5. Uzupełnij adresy w plikach:
   * `index.html`: w `og:image` pełny adres obrazka (`https://www.twoja-domena.pl/assets/img/og-image.jpg`), dodaj `<meta property="og:url">` i `<link rel="canonical">`,
   * `sitemap.xml` i `robots.txt`: wpisz domenę.

## Jak dodać, zmienić albo usunąć auto

Oferta jest w pliku `assets/js/inventory.js`. Każde auto to jeden blok:

```js
{
  id: "skoda-octavia-2020",           // unikalny, trafia do linku: strona.pl/#auto-skoda-octavia-2020
  make: "Skoda", model: "Octavia", version: "2.0 TDI Style",
  year: 2020, mileage: 98000, fuel: "Diesel",
  engine: 1968, power: 150,
  gearbox: "Automatyczna", gearboxNote: "DSG",
  drive: "Na przednie koła", body: "Kombi", color: "Szary metalik", origin: "Niemcy",
  price: 69900,
  lowest30: null,                     // tylko przy obniżce: najniższa cena z 30 dni przed obniżką
  negotiable: true,
  facts: { firstOwner: true, aso: true, accidentFree: true },
  highlights: ["Virtual Cockpit", "Kamera cofania", "Podgrzewane fotele"],
  image: "assets/img/cars/skoda-octavia.webp",
  imageAlt: "Szara Skoda Octavia na placu komisu Danek & Syn",
  photos: 35,
  otomoto: "https://www.otomoto.pl/osobowe/oferta/..."
}
```

* **Sprzedane auto:** usuń jego blok.
* **Zdjęcie:** format 4:3, najlepiej 1600 × 1200 px w WebP (wygodnie przez squoosh.app). Wrzuć do `assets/img/cars/`.
* **Obniżka ceny:** wpisz `lowest30`. Auto dostanie oznaczenie „Cena obniżona” razem z wymaganą przez dyrektywę Omnibus informacją o najniższej cenie z 30 dni.
* Dostępne atuty w `facts`: `warranty: "12 miesięcy"`, `accidentFree`, `firstOwner`, `aso`, `registeredPL`, `inspection: "do 04.2027"`, `originalPaint`, `noSmoking`, `twoKeys`.

Filtry, licznik aut, zakres cen, kalkulator i dane dla Google aktualizują się same.

## Formularz kontaktowy

GitHub Pages nie wysyła e-maili, więc formularz korzysta z zewnętrznej usługi:

1. Wejdź na web3forms.com, podaj e-mail komisu (`samochody.danek@interia.pl`) i odbierz Access Key.
2. W `assets/js/config.js` ustaw `form: { provider: "web3forms", key: "TWOJ_KLUCZ" }`.
3. Wyślij wiadomość testową.

Działa też Formspree (`provider: "formspree"`, `key`: ID formularza). Bez klucza formularz otwiera program pocztowy z gotową wiadomością.

## Lista kontrolna przed publikacją

- [ ] Ocena i liczba opinii Google w `config.js` (teraz 4,6 i 82, do sprawdzenia w profilu Google)
- [ ] Ford Fiesta: moc, skrzynia, wyposażenie i link do ogłoszenia (wersja ST-Line odczytana ze zdjęcia)
- [ ] Obniżki Hondy, Seata i Kugi: potwierdzić najniższą cenę z 30 dni przed obniżką
- [ ] Czy komis przyjmuje auta w rozliczeniu lub skupuje (sekcja „Zamiana”)
- [ ] Linki do Facebooka, Instagrama, YouTube i TikToka w `config.js`
- [ ] Klucz Web3Forms
- [ ] Nazwa firmy z CEIDG i NIP w polityce prywatności
- [ ] Zdjęcia w pełnej rozdzielczości, bez znaku wodnego Otomoto (te same nazwy plików)
- [ ] Domena, `og:image`, `sitemap.xml`
- [ ] Google Search Console oraz adres strony w Profilu Firmy w Google

## Etap 2: oferta aktualizowana automatycznie

GitHub Action uruchamiany na przykład co godzinę pobiera ogłoszenia komisu (oficjalne API Otomoto dla dealerów, po uzyskaniu dostępu) i generuje `inventory.js`. Komis dodaje auta na Otomoto tak jak dziś, a strona aktualizuje się sama.

## Uwagi techniczne

* Brak plików cookies analitycznych i reklamowych. Mapa Google ładuje się dopiero po kliknięciu.
* Link do konkretnego auta: `#auto-ID` (otwiera okno ze szczegółami, działa przy udostępnianiu).
* Status „Otwarte / Zamknięte” liczony jest w czasie polskim, niezależnie od strefy czasowej odwiedzającego. Godziny zmienisz w `config.js` (i w tabeli godzin w `index.html`).
* `404.html` zakłada stronę pod własną domeną albo pod adresem repozytorium `login.github.io/repozytorium/`.

## Licencje

Fonty Barlow i Barlow Condensed: SIL Open Font License 1.1. Logo, zdjęcia i treści ogłoszeń należą do Auto Komis Danek & Syn.
