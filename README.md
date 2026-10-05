# Auto Komis Danek & Syn: strona internetowa

Statyczna strona (HTML, CSS, JavaScript, bez bibliotek i bez WordPressa) przygotowana pod GitHub Pages, z panelem admina do zarządzania ofertą.

## Struktura

```
index.html                  strona główna
admin.html                  panel admina (link „Panel admina” w stopce)
polityka-prywatnosci.html   wzór polityki prywatności (uzupełnij dane firmy)
404.html                    strona błędu, GitHub Pages pokazuje ją automatycznie
robots.txt, sitemap.xml     dla wyszukiwarek (wpisz domenę)
.nojekyll                   GitHub Pages serwuje pliki bez przetwarzania
assets/
  css/style.css, css/admin.css
  js/config.js              dane firmy, godziny, ocena Google, social media, PIN panelu, kalkulator
  js/inventory.js           opublikowana oferta aut (tworzy ją panel admina)
  js/store.js               zapis zmian z panelu w przeglądarce i paczka do publikacji
  js/main.js, js/admin.js   logika strony i panelu
  fonts/                    Barlow i Barlow Condensed, hostowane lokalnie
  img/                      logo, favicony, obrazek do udostępnień, zdjęcia aut (img/cars/)
```

## Panel admina

Wejście: link „Panel admina” na dole strony albo adres `/admin.html`. Logowanie PIN-em.

Co można zrobić:

* dodać auto ze wszystkimi danymi i dowolną liczbą zdjęć (zdjęcia z telefonu same się zmniejszają do 1600 px),
* zmienić kolejność zdjęć i wybrać zdjęcie główne,
* edytować, duplikować, ukryć albo usunąć auto,
* ustawić kolejność aut (to kolejność „Polecane” na stronie).

### Jak to działa na tym etapie (tryb lokalny)

* Zmiany zapisują się w przeglądarce, w której używasz panelu. Na tym urządzeniu strona od razu je pokazuje, a na dole widać informację, że są niepublikowane.
* Inni odwiedzający widzą opublikowaną ofertę z `assets/js/inventory.js`.
* Publikacja: w panelu kliknij **Opublikuj zmiany → Pobierz paczkę**. Paczka ZIP zawiera nowy `assets/js/inventory.js` i nowe zdjęcia. Rozpakuj ją do głównego folderu repozytorium (zastąp pliki), zrób commit i push. Po kilku minutach oferta jest widoczna dla wszystkich, a panel sam rozpozna, że zmiany zostały opublikowane.
* Dane lokalne mogą zniknąć po wyczyszczeniu danych przeglądarki, dlatego zmiany warto publikować od razu.

### PIN

PIN zapisany jest w `config.js` jako `pinHash`. Żeby go zmienić: otwórz `admin.html`, otwórz konsolę przeglądarki, wpisz `danekHash("nowyPIN")` i wynik wklej do `config.js`.

PIN chroni panel przed przypadkowym wejściem. To nie jest zabezpieczenie przed włamaniem, ale na tym etapie panel i tak zapisuje dane tylko w przeglądarce osoby, która z niego korzysta.

## Podgląd na komputerze

Uruchom lokalny serwer w folderze strony (panel potrzebuje adresu http, nie pliku otwartego dwuklikiem):

```
python3 -m http.server 8000
```

i otwórz http://localhost:8000 oraz http://localhost:8000/admin.html.

## Publikacja na GitHub Pages

1. Utwórz repozytorium i wgraj zawartość tego folderu (z ukrytym plikiem `.nojekyll`).
2. Settings → Pages → Deploy from a branch → `main`, folder `/ (root)`.
3. Strona będzie pod `https://TWOJ-LOGIN.github.io/NAZWA-REPO/`.

## Własna domena

1. Settings → Pages → Custom domain: `www.twoja-domena.pl`.
2. U rejestratora: rekord `CNAME` dla `www` na `TWOJ-LOGIN.github.io` oraz rekordy `A` dla domeny bez www: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
3. Zaznacz **Enforce HTTPS**.
4. W `index.html` wpisz pełny adres w `og:image`, dodaj `og:url` i `<link rel="canonical">`. W `sitemap.xml` i `robots.txt` wpisz domenę.

## Ręczna edycja oferty

Można też edytować `assets/js/inventory.js` bezpośrednio. Każde auto to jeden obiekt: `id`, `make`, `model`, `version`, `year`, `mileage`, `fuel`, `engine`, `power`, `gearbox`, `gearboxNote`, `drive`, `body`, `color`, `origin`, `price`, `negotiable`, `facts`, `highlights`, `description`, `images` (lista ścieżek, pierwsze zdjęcie jest główne), `otomoto`, `hidden`.

Atuty w `facts`: `warranty: "12 miesięcy"`, `accidentFree`, `firstOwner`, `aso`, `registeredPL`, `inspection: "do 04.2027"`, `originalPaint`, `noSmoking`, `twoKeys`.

## Lista kontrolna przed publikacją

- [ ] Ocena i liczba opinii Google w `config.js` (teraz 4,6 i 82)
- [ ] Ford Fiesta: moc, skrzynia, wyposażenie i link do ogłoszenia
- [ ] Linki do Facebooka, Instagrama, YouTube i TikToka w `config.js`
- [ ] Własny PIN panelu admina
- [ ] Nazwa firmy z CEIDG i NIP w polityce prywatności
- [ ] Domena, `og:image`, `sitemap.xml`
- [ ] Google Search Console oraz adres strony w Profilu Firmy w Google

## Etap 2: panel online

Zamiast paczki ZIP panel może zapisywać zmiany od razu na serwerze (na przykład przez API GitHuba z logowaniem albo przez prostą usługę bazodanową). Wtedy komis dodaje auto z telefonu i od razu widzą je wszyscy.

## Uwagi techniczne

* Brak plików cookies analitycznych i reklamowych. Mapa Google ładuje się dopiero po kliknięciu.
* Link do konkretnego auta: `#auto-ID`, okno szczegółów ma galerię zdjęć (strzałki, miniatury, przesuwanie palcem, klawiatura).
* Status „Otwarte / Zamknięte” liczony jest w czasie polskim. Godziny zmienisz w `config.js` i w tabeli godzin w `index.html`.
* `404.html` sam rozpoznaje, czy strona działa pod własną domeną, pod `login.github.io`, czy w podfolderze repozytorium.

## Licencje

Fonty Barlow i Barlow Condensed: SIL Open Font License 1.1. Logo, zdjęcia i treści ogłoszeń należą do Auto Komis Danek & Syn.
