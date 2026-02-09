# web-recomendation-parfume

Website sederhana untuk memberikan rekomendasi parfum lokal Indonesia berdasarkan preferensi pengguna.

## Cara Menjalankan

Agar data parfum bisa dimuat dengan benar, jalankan server statis:

```bash
python -m http.server 8000
```

Kemudian buka `http://localhost:8000` di browser.

> Jika dibuka langsung via `file://`, browser dapat memblokir pemanggilan `fetch` ke JSON.
> Halaman ini sudah memiliki data cadangan agar tetap bisa dipakai, tetapi server lokal tetap
> disarankan.

## Data Parfum

Data parfum lokal disimpan di `data/parfumes.json` dengan rentang harga 100-500 ribu.
