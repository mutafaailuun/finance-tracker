# Panduan iOS Shortcuts — Finance Tracker

Catat transaksi hanya dengan suara, widget, atau ketukan di belakang iPhone — tanpa buka aplikasi.

---

## Cara Kerja

```
iPhone (Shortcuts)  →  Supabase Edge Function  →  Database
     teks / suara           parsing AI                simpan transaksi
```

Kamu bicara atau ketik teks bebas seperti **"beli kopi 15rb"** → AI otomatis mengenali jumlah, kategori, dan tipe transaksi.

---

## Langkah 1 — Jalankan Migration Database

Buka Supabase SQL Editor, paste dan jalankan:

```sql
-- Tambah kolom API Key untuk Shortcuts
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS shortcut_api_key TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_user_preferences_shortcut_api_key
  ON user_preferences(shortcut_api_key);

-- Izinkan sumber transaksi dari iOS Shortcuts
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_source_check;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_source_check
  CHECK (source IN ('web', 'whatsapp', 'ai', 'ios_shortcut'));
```

> File migrasi sudah tersedia di `supabase/migrations/20250502_ios_shortcut.sql`.

---

## Langkah 2 — Deploy Edge Function

```bash
supabase functions deploy ios-shortcut
```

Pastikan variabel environment sudah diset di Supabase Dashboard → Project Settings → Edge Functions:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | URL project Supabase kamu |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |
| `OPENAI_API_KEY` | API key OpenAI |

---

## Langkah 3 — Generate API Key di Web App

1. Buka web app → halaman **Settings**
2. Scroll ke bagian **iOS Shortcuts**
3. Klik **Generate API Key**
4. Copy API Key dan **Endpoint URL** yang muncul

Simpan keduanya — kamu akan pakai di Shortcuts.

---

## Langkah 4 — Buat Shortcut di iPhone

Buka aplikasi **Shortcuts** di iPhone (bawaan iOS, tidak perlu download).

### Shortcut A: Input Teks (Paling Simpel)

Ini shortcut paling dasar — cocok untuk widget di home screen.

**Langkah-langkah:**

1. Tap **+** (pojok kanan atas)
2. Tap **Add Action**
3. Cari dan tambahkan action **"Ask for Input"**
   - Input Type: `Text`
   - Prompt: `Transaksi? (contoh: makan siang 25k)`
4. Tap **+** lagi, cari **"Get Contents of URL"**
   - URL: `(paste Endpoint URL dari Settings)`
   - Method: `POST`
   - Headers:
     - `Content-Type`: `application/json`
   - Request Body: `JSON`
     - Tambahkan key `text` → value: tap **Variable** → pilih **"Provided Input"**
     - Tambahkan key `apiKey` → value: `(paste API Key dari Settings)`
5. Tap **+** lagi, cari **"Show Notification"**
   - Message: tap **Variable** → pilih **"Contents of URL"**
6. Tap nama shortcut di atas → rename: **"Catat Transaksi"**
7. Tap ikon di sebelah nama → pilih ikon dan warna sesuai selera
8. Tap **Done**

**Test:** Tap shortcut → ketik "beli bensin 50rb" → cek web app.

---

### Shortcut B: Voice / Siri

Catat transaksi cukup dengan bicara ke Siri.

1. Buat shortcut baru
2. Tambahkan action **"Dictate Text"**
   - Language: `Indonesian`
   - Prompt: `Sebutkan transaksimu`
3. Tambahkan action **"Get Contents of URL"** (sama seperti Shortcut A, tapi "Provided Input" diisi dari "Dictated Text")
4. Tambahkan action **"Speak Text"**: ketik `Transaksi tercatat`
5. Rename: **"Catat Pengeluaran"**
6. Buka **Settings iPhone → Siri & Search → All Shortcuts** → aktifkan shortcut ini

**Penggunaan:** "Hey Siri, catat pengeluaran" → bicara → selesai.

---

### Shortcut C: Scan Struk dari Foto

Foto struk belanja → otomatis tercatat.

1. Buat shortcut baru
2. Aktifkan **Show in Share Sheet** (tap nama shortcut → bagian atas)
3. Tambahkan action **"Get Images from Input"**
4. Tambahkan action **"Extract Text from Image"** (dari Images di langkah 3)
5. Tambahkan action **"Get Contents of URL"** (text dari "Extracted Text")
6. Tambahkan action **"Show Notification"**
7. Rename: **"Scan Struk"**

**Penggunaan:** Buka Foto → pilih struk → tap Share → pilih "Scan Struk".

---

## Langkah 5 — Pasang Widget di Home Screen

1. Tahan (long press) area kosong di home screen
2. Tap **+** pojok kiri atas
3. Cari **Shortcuts**
4. Pilih widget ukuran kecil (1×1) atau medium
5. Tap **Add Widget**
6. Tap widget → pilih shortcut **"Catat Transaksi"**

Sekarang ada tombol langsung di home screen.

---

## Langkah 6 (Opsional) — Back Tap Trigger

Ketuk 2x di belakang iPhone untuk langsung buka shortcut.

1. **Settings iPhone → Accessibility → Touch → Back Tap**
2. Pilih **Double Tap**
3. Scroll ke bawah → pilih shortcut **"Catat Transaksi"**

---

## Langkah 7 (Opsional) — Automation Otomatis Setelah Screenshot

Setiap kali screenshot, shortcut jalan otomatis.

1. Buka Shortcuts → tab **Automation**
2. Tap **+** → **Create Personal Automation**
3. Pilih trigger: **Screenshot**
4. Aktifkan "Run Immediately" (matikan "Ask Before Running")
5. Actions:
   - **Wait**: 1 second
   - **Get Latest Photos**: 1 foto
   - **Extract Text from Image**
   - **Get Contents of URL** (kirim extracted text)

---

## Format Teks yang Didukung

AI mampu memahami format teks bebas dalam Bahasa Indonesia:

| Input | Hasil |
|-------|-------|
| `makan siang 25rb` | Expense • Makan • Rp 25.000 |
| `beli bensin 50000` | Expense • Transportasi • Rp 50.000 |
| `gaji masuk 5 juta` | Income • Gaji • Rp 5.000.000 |
| `transfer ke ibu 200k` | Expense • Transfer • Rp 200.000 |
| `kopi 18.000` | Expense • Makanan & Minuman • Rp 18.000 |

---

## Troubleshooting

**Shortcut error / tidak respons**
- Cek koneksi internet aktif
- Pastikan API Key sudah benar (copy ulang dari Settings)
- Pastikan Endpoint URL menggunakan `https://`

**Siri tidak mengenali nama shortcut**
- Nama shortcut harus mudah diucapkan
- Latih ulang: Settings → Siri & Search → All Shortcuts

**Transaksi tidak masuk ke database**
- Buka Supabase Dashboard → Edge Functions → Logs → cek error
- Pastikan migration sudah dijalankan (kolom `shortcut_api_key` ada)
- Pastikan `OPENAI_API_KEY` sudah diset di environment variables

**"Invalid API Key"**
- Regenerate key di Settings → iOS Shortcuts → Regenerate
- Copy key baru ke shortcut

---

## Perbandingan Metode Input

| | iOS Shortcuts | WhatsApp Bot | Web App |
|--|:---:|:---:|:---:|
| Setup | Mudah | Butuh Fonnte | - |
| Voice Input | Siri | ❌ | ❌ |
| Widget | ✅ | ❌ | ❌ |
| Scan Struk | ✅ | ✅ | ✅ |
| Back Tap | ✅ | ❌ | ❌ |
| Biaya | Gratis | Rp 20-50k/bulan | Gratis |
| Android | ❌ | ✅ | ✅ |
