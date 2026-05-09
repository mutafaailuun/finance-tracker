# iOS Shortcuts OCR - Quick Setup Guide

## Langkah 1: Buka Shortcuts App

## Langkah 2: Buat Personal Automation

Pilih **"Automation"** tab → **"Create Personal Automation"**

## Langkah 3: Pilih Trigger (Opsional)

Untuk shortcut manual, skip ini.  
Untuk automation:
- **Back Tap** → Double/Triple tap belakang iPhone
- **Time of Day** → Jadwal harian
- **Arrive/Leave** → Location based

## Langkah 4: Buat Shortcut dengan Actions

### Action List:

```
[1] 📷 Take Photo
    └ Camera: Back
    └ Show Preview: ON

[2] 🔍 Extract Text from Image
    └ Otomatis extract teks dari foto

[3] 📋 Copy to Clipboard (API Key) 
    └ Atau gunakan Text action dengan API Key mu

[4] 🌐 URL
    └ https://chezkeuqkzbqwzgoprdn.supabase.co/functions/v1/ios-shortcut

[5] 📤 Get Contents of URL
    └ Method: POST
    └ Request Body: JSON
    └ JSON:
       {
         "text": [Extracted Text],
         "apiKey": [Your API Key],
         "isOcr": true,
         "imageText": [Extracted Text]
       }

[6] 📖 Get Dictionary from Input

[7] 📱 Show Notification
    └ Title: "✅ Struk Tersimpan"
    └ Body: [Dictionary → message]
```

## Magic Variables Setup

Saat isi JSON di action 5, tap magic variable:
- `text` → pilih **"Extracted Text"** dari action 2
- `apiKey` → pilih **"Clipboard"** atau isi manual API Key
- `isOcr` → ketik `true`
- `imageText` → pilih **"Extracted Text"** dari action 2

## API Key

API Key kamu ada di:  
**Settings → iOS Shortcuts → Your API Key**

Copy dan simpan di:
- Clipboard sebelum pakai shortcut, ATAU
- Text action langsung di shortcut

## Test Shortcut

1. Tap "Play" button (▶️) di bottom
2. Ambil foto struk
3. Tunggu notifikasi sukses

## Siri Voice Command

Tambahkan di Settings shortcut:
- **Name**: "Scan Struk" 
- **Siri Phrase**: "Scan struk belanja"

Sekarang bisa bilang: **"Hey Siri, scan struk belanja"**

## Contoh Response Sukses

```
💸 Pengeluaran Tercatat! 📄

Belanja Alfamart
Rp 10.900
📁 Groceries
💳 SHOPEEPAY
```

## Format Struk yang Didukung

✅ Alfamart  
✅ Indomaret  
✅ Circle K  
✅ Supermarket (Superindo, dll)  
✅ Restaurant  
✅ SPBU  
✅ Parkir  
✅ Online shops (print out)  

## Tips

1. **Pencahayaan terang** = OCR lebih akurat
2. **Foto lurus** = Teks lebih mudah terbaca
3. **Struk tidak kusut** = Hasil lebih baik
4. **iOS 15+** = Dibutuhkan untuk Live Text OCR

## Troubleshooting

**❌ "Invalid API Key"**
→ Pastikan API Key benar dan aktif

**❌ "Gagal membaca struk"**  
→ Coba foto ulang dengan lebih terang

**❌ Total tidak sesuai
→ Kadang format struk aneh, edit manual di app

**❌ Tidak ada Extract Text action**
→ Update iOS ke versi 15 atau lebih tinggi

## Download Shortcut (Coming Soon)

Link shortcut siap pakai akan tersedia setelah testing selesai.

---

**Butuh bantuan?** Buka Settings → iOS Shortcuts di Finance Tracker app.
