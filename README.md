# Cari & Kenali Belanjawan 2027

Permainan carian visual dalam Bahasa Melayu. Padankan lapan gambar kecil dengan watak atau objek dalam ilustrasi, kemudian ketik padanannya.

## Cara bermain

- Setiap pusingan memilih lapan sasaran daripada 37 pilihan yang disemak: dua subjek besar, tiga objek sederhana dan tiga butiran kecil. Subjek sama tidak dipilih dua kali dalam satu pusingan; pilihan tepat pusingan terdahulu diberi keutamaan lebih rendah.
- Cari mana-mana sasaran, atau pilih satu kad gambar untuk menumpukan carian. Pemilihan kad tidak mendedahkan lokasi.
- Panel gambar berada di sisi pada desktop dan di atas pada telefon; ia tidak menutupi ilustrasi.
- Seret untuk bergerak, cubit dua jari atau gunakan roda tetikus dan butang + / − untuk zum. Butang Muat skrin memulihkan paparan penuh.
- Pemasa lalai dua minit; pilihan Tanpa had masa tersedia. Pertukaran tetapan masa memulakan pusingan baharu selepas pengesahan.
- Empat tekaan salah dalam lima saat menghentikan tekaan selama 2.2 saat. Pemasa terus berjalan.
- Selepas pusingan tamat, Lihat jawapan menandakan lokasi mengikut nombor kad. Main lagi memilih sasaran baharu.

## Fail aktif

- `index.html`: antara muka permainan.
- `visual-targets.js`: gambar rujukan, kawasan jawapan dan kumpulan subjek; koordinat piksel pada ilustrasi 1437 × 1095.
- `visual-game.js`: carian, pemilihan rawak, pemasa, zum, input sentuh dan kaunter sedia ada.
- `visual-game.css`: susun atur desktop dan mudah alih.
- `illustration.png`: imej permainan sedia ada, dikekalkan tanpa perubahan oleh kemas kini ini. Gambar rujukan dipotong daripada imej ini pada kanvas pelayar.
- `landing.html`: menu permainan dan kaunter pengunjung sedia ada.

Fail `data.js`, `game.js`, `style.css`, `hotspots.json`, `bubble-transcript.txt`, `index_v1.html` dan `version2.html` ialah bahan versi terdahulu dan tidak digunakan oleh permainan aktif.

## Ilustrasi

Ilustrasi permainan sedia ada ialah versi yang sebelum ini dibuang gelembung teks dengan bantuan AI. Sumber asal yang direkodkan: `Program Yakin MADANI Backdrop - Perak@10x-100.jpg`, 11340 × 8647. Karya asal tidak dilesenkan semula oleh projek ini. Kemas kini carian visual ini tidak mengubah fail ilustrasi dan tidak memaparkan penerangan dasar yang belum disahkan.

## Pengesahan — 28 November 2026

- Sintaks JavaScript dan batas koordinat 37 sasaran disemak.
- 5,000 pilihan pusingan mengandungi lapan kumpulan subjek unik dengan campuran kesukaran 2/3/3.
- Semakan logik meliputi kemenangan 8/8, pusingan baharu, sasaran terpilih, jeda tekaan salah, masa tamat, tanpa had masa serta sentuhan berganda/seretan/pembatalan tanpa tekaan tidak sengaja.
- Semakan pelayar desktop: pusingan penuh 8/8, kemajuan, masa penyelesaian, jawapan, pusingan baharu, zum, seretan dan pertukaran pemasa.
- Susun atur diperiksa dalam bingkai pelayar 390 × 844, 320 × 568 dan 740 × 360.
- Cubit pada peranti sentuh fizikal belum diuji.

## Penerbitan

GitHub Pages menggunakan cawangan `main`, direktori akar. Tiada pemasangan atau proses binaan diperlukan.

© 2026 IBJ. All rights reserved. Made by IBJ.
