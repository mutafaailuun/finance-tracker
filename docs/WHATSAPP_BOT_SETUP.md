# 🤖 WhatsApp Bot Integration dengan Fonnte

Panduan lengkap untuk mengintegrasikan WhatsApp Bot menggunakan Fonnte API.

## 📋 Daftar Isi

1. [Cara Kerja](#cara-kerja)
2. [Setup Fonnte](#setup-fonnte)
3. [Konfigurasi Supabase](#konfigurasi-supabase)
4. [Cara Penggunaan](#cara-penggunaan)
5. [Troubleshooting](#troubleshooting)

## 🎯 Cara Kerja

```
User WhatsApp → Fonnte API → Supabase Edge Function (Webhook)
→ AI Processing (OpenAI) → Supabase Database → Realtime Sync → Web App
```

### Fitur:

- ✅ Catat transaksi via WhatsApp chat
- ✅ AI otomatis parsing pesan natural
- ✅ Support format: "25k", "1.5jt", "5000"
- ✅ Auto-match kategori
- ✅ Real-time sync dengan web app
- ✅ Perintah: /help, /saldo

## 🚀 Setup Fonnte

### 1. Daftar Akun Fonnte

1. Buka https://fonnte.com
2. Daftar akun baru
3. Verifikasi nomor WhatsApp (scan QR code)

### 2. Dapatkan Token

1. Login ke dashboard Fonnte
2. Pergi ke menu **"Device"**
3. Copy **Token** Anda

### 3. Setup Webhook

1. Di dashboard Fonnte, pergi ke menu **"Webhook"**
2. Masukkan URL webhook:
   ```
   https://[PROJECT_REF].supabase.co/functions/v1/fonnte-webhook
   ```
   
   Ganti `[PROJECT_REF]` dengan project reference Supabase Anda.
3. Pilih method: **POST**
4. Aktifkan webhook
5. Save

### 4. Format Payload

Pastikan format webhook di Fonnte menggunakan **Form Data** atau **JSON** dengan struktur:

```json
{
  "sender": "6281234567890",
  "message": "Beli nasi goreng 25k",
  "name": "Nama Kontak"
}
```

## ⚙️ Konfigurasi Supabase

### 1. Deploy Edge Function

Jalankan command di terminal:

```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login ke Supabase
supabase login

# Link project
supabase link --project-ref [PROJECT_REF]

# Deploy function
supabase functions deploy fonnte-webhook
```

### 2. Set Environment Variables

Di dashboard Supabase, pergi ke **Project Settings > Functions**:

Tambahkan secrets:

```bash
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
OPENAI_API_KEY=[OPENAI_API_KEY]
```

### 3. Apply Database Migration

Jalankan migration di SQL Editor Supabase:

```sql
-- File: supabase/migrations/20250502_whatsapp_bot.sql
-- (Sudah ada di repository)
```

Atau jalankan via CLI:

```bash
supabase db push
```

### 4. Update user_preferences Table

Tambahkan kolom untuk menyimpan AI settings:

```sql
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(20) DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS ai_api_key TEXT;
```

## 📱 Cara Penggunaan

### Untuk User:

1. **Hubungkan Nomor WhatsApp:**
   - Buka menu "WhatsApp" di web app
   - Masukkan nomor WhatsApp Anda
   - Klik "Hubungkan"

2. **Chat ke Bot:**
   - Kirim pesan ke nomor Fonnte Anda
   - Format pesan natural:
     ```
     "Makan siang 35k"
     "Beli bensin 50rb"
     "Gaji masuk 5jt"
     "Bayar listrik 350000"
     ```

3. **Perintah Tersedia:**
   - `/help` - Tampilkan bantuan
   - `/saldo` - Cek total saldo

### Contoh Interaksi:

**User:**
```
Beli kopi dan roti 45k
```

**Bot:**
```
💸 Pengeluaran Tercatat!

📝 Kopi dan roti
💰 Rp 45.000
📁 Makanan
📅 2026-05-02

✅ Transaksi berhasil disimpan dan sinkron dengan web app.
```

## 🔧 Troubleshooting

### Bot tidak merespon

1. **Cek Fonnte Status:**
   - Pastikan device di Fonnte aktif (terhubung)
   - Cek dashboard Fonnte > Device (harus hijau/online)

2. **Cek Webhook URL:**
   - Pastikan URL webhook benar
   - Cek apakah ada typo di project ref
   - Pastikan menggunakan https://

3. **Cek Edge Function Logs:**
   - Di Supabase dashboard > Edge Functions > fonnte-webhook > Logs
   - Cek apakah ada error

### AI tidak parsing dengan benar

1. **Cek OpenAI API Key:**
   - Pastikan API key valid
   - Pastikan memiliki credits/saldo

2. **Cek Format Pesan:**
   - Gunakan format yang jelas
   - Sertakan jumlah uang
   - Contoh benar: "Beli nasi goreng 25k"

### Transaksi tidak muncul di web

1. **Cek user_phone_mappings:**
   - Pastikan nomor terdaftar di tabel
   - Format nomor harus sama (62xxx atau 08xxx)

2. **Cek Database:**
   ```sql
   SELECT * FROM transactions 
   WHERE source = 'whatsapp' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

### Nomor sudah terdaftar tapi tidak bisa

1. **Format Nomor:**
   - Fonnte kirim: `6281234567890`
   - User daftar: `081234567890`
   
   Solusi: Gunakan format internasional tanpa + (628xxx)

2. **Update mapping:**
   ```sql
   UPDATE user_phone_mappings 
   SET phone_number = '6281234567890' 
   WHERE phone_number = '081234567890';
   ```

## 📊 Monitoring

### Cek Log Function

```bash
# View real-time logs
supabase functions logs fonnte-webhook --tail
```

### Query Transaksi WhatsApp

```sql
-- Total transaksi via WhatsApp
SELECT 
  COUNT(*) as total_transactions,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
FROM transactions 
WHERE source = 'whatsapp'
AND user_id = '[USER_ID]';
```

## 💡 Tips

1. **Gunakan Keywords:**
   - Tambahkan keywords di kategori untuk matching lebih akurat
   - Contoh: Kategori "Transportasi" dengan keywords: "bensin, gojek, grab, taksi"

2. **Default Wallet:**
   - Set default wallet agar transaksi otomatis masuk ke wallet yang benar

3. **Format Pesan:**
   - Lebih detail = lebih akurat
   - "Makan siang di warteg 25k" lebih baik dari "25k"

4. **Shortcuts:**
   - "k" = ribu (25k = 25000)
   - "rb" = ribu (25rb = 25000)
   - "jt" = juta (1jt = 1000000)

## 🔐 Security

- API Key disimpan di Supabase Vault (encrypted)
- Webhook menggunakan Service Role Key (hanya di server)
- Nomor WhatsApp diverifikasi sebelum bisa digunakan
- RLS policies melindungi data user

## 📞 Support

Jika ada masalah:
1. Cek logs di Supabase dashboard
2. Cek Fonnte dashboard status
3. Test webhook menggunakan curl:

```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/fonnte-webhook \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "6281234567890",
    "message": "Test 10000",
    "name": "Test User"
  }'
```

---

Selamat menggunakan! 🎉
