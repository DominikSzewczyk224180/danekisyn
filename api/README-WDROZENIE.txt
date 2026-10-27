API SAMOCHODY DANEK & SYN  (api.samochodydanekisyn.pl)

Wymagania: hosting z PHP 7.4 lub nowszym (zalecane 8.1+), serwer z obsługą .htaccess (Apache albo LiteSpeed).

WDROŻENIE
1. W panelu SEOHOST utwórz subdomenę api.samochodydanekisyn.pl i ustaw dla niej PHP 8.1 lub nowsze.
2. Wgraj całą zawartość tego folderu do katalogu subdomeny, razem z ukrytymi plikami .htaccess.
3. Foldery data/ i uploads/ muszą mieć prawo zapisu (zwykle 755).
4. Włącz certyfikat SSL Let's Encrypt dla api.samochodydanekisyn.pl.
5. Sprawdź w przeglądarce:
   https://api.samochodydanekisyn.pl/index.php?r=status   ->  {"ok":true,...}
   https://api.samochodydanekisyn.pl/data/                 ->  403 (dane są chronione)

PIERWSZE URUCHOMIENIE
- Dopóki nikt nic nie zapisze, strona pokazuje ofertę z pliku assets/js/inventory.js.
- Pierwszy zapis w panelu admina przenosi całą ofertę na serwer.
- Jeśli na danym urządzeniu są zmiany z wersji demo, panel zaproponuje przeniesienie ich na serwer.

HASŁO
- Hasło do panelu ustawia się tylko w config.php (password_hash). W panelu nie ma opcji zmiany hasła.
- Nowe hasło: wygeneruj hash, np. poleceniem  php -r 'echo password_hash("NOWE_HASLO", PASSWORD_DEFAULT);'
  i wklej go do config.php. Żeby od razu wylogować wszystkie urządzenia, usuń plik data/sessions.json.

KOPIE ZAPASOWE
- Każdy zapis tworzy kopię poprzedniej wersji w data/backups (40 ostatnich).
- Przywrócenie: skopiuj wybraną kopię jako data/oferta.json.

BEZPIECZEŃSTWO
- config.php i folder data/ są zablokowane w .htaccess. Nie wrzucaj config.php do GitHuba.
- API przyjmuje zapytania tylko ze stron wpisanych w config.php (allowed_origins).
- Zdjęcia: tylko JPG, PNG i WebP do 8 MB, z losowymi nazwami. W folderze uploads nie da się uruchomić skryptu.
- 5 nieudanych logowań blokuje kolejne próby z tego adresu na 15 minut.
