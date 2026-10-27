<?php
/* Ustawienia API. Ten plik zostaje tylko na serwerze, nie wrzucaj go do GitHuba. */
return [
    // adresy stron, które mogą korzystać z API (bez ukośnika na końcu)
    'allowed_origins' => [
        'https://samochodydanekisyn.pl',
        'https://www.samochodydanekisyn.pl',
        'https://dominikszewczyk224180.github.io',
    ],
    // hasło do panelu admina (zapisany tylko hash). Po wdrożeniu można je zmienić w panelu: „Zmień hasło”.
    'password_hash' => '$2y$10$At3wZuBwZHbT.XX6gEWnfuBxvfzzlmoSrYuRN17sqITiVRNfwwj2O',
    // gdzie API trzyma dane i zdjęcia
    'data_dir' => __DIR__ . '/data',
    'uploads_dir' => __DIR__ . '/uploads',
    'public_uploads_url' => 'https://api.samochodydanekisyn.pl/uploads',
];
