# Setup OCR untuk Scan Struk di iOS Shortcuts

Dengan fitur OCR, kamu bisa scan struk belanja langsung dari kamera iPhone dan otomatis tercatat di Finance Tracker!

## Cara Setup

### 1. Buka Aplikasi Shortcuts

### 2. Buat Shortcut Baru

### 3. Tambahkan Actions (Urutan Penting!)

#### Action 1: Take Photo
- Cari: **"Take Photo"**
- Settings:
  - Camera: Back
  - Show Preview: ON (biar bisa lihat hasil)

#### Action 2: Extract Text from Image (OCR)
- Cari: **"Extract Text from Image"**
- Ini fitur bawaan iOS 15+ (Live Text)

#### Action 3: Get Clipboard
- Cari: **"Get Clipboard"**
- Ini untuk mengambil API Key yang sudah disimpan

#### Action 4: URL
- Cari: **"URL"**
- Masukkan: `https://chezkeuqkzbqwzgoprdn.supabase.co/functions/v1/ios-shortcut`

#### Action 5: Get Contents of URL
- Cari: **"Get Contents of URL"**
- Method: POST
- Request Body: JSON
- JSON Structure:
```json
{
  "text": "(Extracted Text)",
  "apiKey": "(Clipboard)",
  "isOcr": true,
  "imageText": "(Extracted Text)"
}
```

**Cara isi:**
- Tap "Add new field"
- Pilih "Text"
- Field 1: `text` → Pilih magic variable "Extracted Text"
- Field 2: `apiKey` → Pilih magic variable "Clipboard"
- Field 3: `isOcr` → Isi: `true`
- Field 4: `imageText` → Pilih magic variable "Extracted Text"

#### Action 6: Get Dictionary Value
- Cari: **"Get Dictionary Value"**
- Key: `message`
- Get value for: (pilih hasil dari action sebelumnya)

#### Action 7: Show Notification
- Cari: **"Show Notification"**
- Title: "✅ Struk Tercatat"
- Body: (pilih magic variable dari "Dictionary Value")

### 4. Setup API Key di Clipboard

Sebelum menggunakan shortcut OCR:
1. Buka Settings di Finance Tracker
2. Copy API Key iOS Shortcuts
3. Paste ke Notes dulu atau simpan di Clipboard

**Atau lebih mudah:** Edit action "Get Clipboard" menjadi "Text" dan isi dengan API Key langsung.

### 5. Beri Nama Shortcut

Contoh: "Scan Struk" atau "OCR Receipt"

### 6. Tambahkan ke Home Screen (Opsional)

- Tap icon settings (…) di pojok kanan atas
- Pilih "Add to Home Screen"
- Pilih icon kamera atau receipt

## Cara Pakai

1. **Ambil foto struk** → Shortcut otomatis extract teks
2. **Tunggu proses** → AI akan baca total, tanggal, merchant
3. **Selesai!** → Transaksi tersimpan dengan detail:
   - Total belanja
   - Nama merchant (Alfamart, Indomaret, dll)
   - Tanggal dari struk
   - Kategori otomatis (Groceries untuk minimarket)
   - Metode pembayaran

## Contoh Hasil

Input: Foto struk Alfamart Rp 10.900
Output:
```
💸 Pengeluaran Tercatat! 📄

Belanja Alfamart
Rp 10.900
📁 Groceries
💳 SHOPEEPAY
```

## Tips untuk Hasil Terbaik

1. **Pencahayaan** → Pastikan struk terang, tidak gelap
2. **Posisi** → Foto lurus dari atas, jadi miring
3. **Jarak** → Dekat tapi masih bisa baca semua teks
4. **Fokus** → Tap layar untuk fokus ke struk
5. **Struk jelek** → Jika struk pudar, tulis manual saja

## Supported Receipts

✅ **Minimarket**: Alfamart, Indomaret, Circle K, dll  
✅ **Supermarket**: Superindo, Lottemart, Farmers Market  
✅ **Restoran**: Receipt makanan & minuman  
✅ **Bensin**: SPBU Pertamina, Shell, BP  
✅ **Parkir**: Tiket parkir  
✅ **Online**: Print out invoice Shopee, Tokopedia, dll  

## Troubleshooting

### OCR tidak membaca struk
- Coba foto ulang dengan pencahayaan lebih terang
- Pastikan teks struk jelas, tidak blur
- Pastikan iOS versi 15+ (untuk Live Text)

### Total tidak terdeteksi
- Kadang struk menggunakan format unik
- Jika gagal, shortcut akan minta input manual

### Merchant tidak terbaca
- AI akan deteksi otomatis dari teks
- Jika tidak terdeteksi, akan pakai "Toko"

## Catatan Penting

- **Privacy**: Gambar struk hanya diproses di device (Live Text), tidak diupload
- **Hanya teks** yang dikirim ke server, bukan gambar
- **Aman**: Data tetap privat dan terenkripsi

## Shortcut Workflow Diagram

```
📷 Take Photo
    ↓
🔍 Extract Text (OCR di device)
    ↓
📋 Get API Key
    ↓
🌐 Kirim ke Finance Tracker
    ↓
🤖 AI Parse (extract total, merchant, date)
    ↓
💾 Save to Database
    ↓
📱 Show Notification
```

## Alternative: Use Siri

Kamu juga bisa bilang:
- "Hey Siri, scan struk"
- "Hey Siri, catat belanja"

Siri akan langsung buka kamera untuk scan!

---

**Selamat!** Sekarang kamu bisa scan struk belanja tanpa ketik manual lagi 🎉
