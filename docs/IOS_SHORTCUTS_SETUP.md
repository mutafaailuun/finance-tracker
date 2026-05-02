# 📱 iOS Shortcuts Integration

Input transaksi cepat via Shortcuts bawaan iPhone tanpa perlu install app!

## ✨ Fitur

- 🎤 **Voice Control**: "Hey Siri, catat pengeluaran"
- 📲 **Widget**: Tombol cepat di home screen
- 📤 **Share Sheet**: Share dari app lain (Screenshots, Photos, Safari)
- 👆 **Back Tap**: Ketuk 2x/3x di belakang iPhone
- ⚡ **Automation**: Auto-trigger setelah screenshot struk

## 🚀 Setup

### 1. Generate API Key

Buka halaman Settings di web app, copy API Key untuk Shortcuts.

### 2. Install Shortcut

Pilih salah satu cara:

#### A. Quick Transaction (Basic)
```
1. Buka Shortcuts app
2. Tap "+" untuk shortcut baru
3. Add Action:
   - "Ask for Input" (Text) → Prompt: "Transaksi?"
   - "Get Contents of URL":
     * URL: https://[PROJECT_REF].supabase.co/functions/v1/ios-shortcut
     * Method: POST
     * Headers: Content-Type: application/json
     * Body: {"text": "[Ask for Input]", "apiKey": "YOUR_API_KEY"}
   - "Show Notification": [Contents of URL]

4. Rename: "Catat Transaksi"
5. Add to Home Screen (optional)
```

#### B. Voice Version (Siri)
```
1. Buat shortcut baru
2. Settings → Enable "Use as Quick Action"
3. Add Action:
   - "Dictate Text" (Language: Indonesian)
   - "Get Contents of URL" (seperti di atas)
   - "Speak Text": "Transaksi tercatat"

4. Rename: "Catat Pengeluaran"
5. Sekarang bisa: "Hey Siri, catat pengeluaran"
```

#### C. Share Sheet Version (Dari app lain)
```
1. Buat shortcut baru
2. Settings → Enable "Show in Share Sheet"
3. Add Action:
   - "Get Text from Input" (kalo share text)
   - atau "Extract Text from Image" (kalo share photo)
   - "Get Contents of URL" (seperti di atas)
   - "Show Result"

4. Rename: "Catat ke FinTracker"
```

### 3. Test

1. Buka Shortcuts app
2. Tap shortcut yang dibuat
3. Ketik: "Makan siang 25k"
4. Cek web app → transaksi sudah masuk!

## 📋 Contoh Penggunaan

### Via Siri:
```
User: "Hey Siri, catat pengeluaran"
Siri: "Apa yang ingin dicatat?"
User: "Beli kopi 15 ribu"
Siri: "Transaksi tercatat"
```

### Via Widget:
```
1. Tap widget di home screen
2. Input: "Gaji masuk 5 juta"
3. Notifikasi: ✅ Income: Gaji - Rp 5.000.000
```

### Via Share Sheet:
```
1. Buka Photos → pilih foto struk
2. Tap Share → Pilih "Catat ke FinTracker"
3. AI akan scan dan catat otomatis!
```

## 🎨 Advanced: Widget Customization

### Widget dengan Input Form:
```
Actions:
1. "Choose from Menu":
   - Income
   - Expense
   
2. "Ask for Number": Amount

3. "Ask for Text": Description

4. "Get Contents of URL" dengan:
   Body: {
     "text": "[Menu Choice] [Description] [Number]",
     "apiKey": "YOUR_API_KEY"
   }
```

### Back Tap Trigger:
```
Setting iPhone:
1. Settings → Accessibility → Touch → Back Tap
2. Pilih "Double Tap"
3. Pilih shortcut "Catat Transaksi"

Sekarang: Ketuk 2x di belakang iPhone → langsung input!
```

### Automation:
```
1. Shortcuts app → Automation → Create Personal Automation
2. Trigger: Screenshot
3. Action: "Wait 2 seconds"
4. Action: "Get Latest Screenshot"
5. Action: "Extract Text from Image"
6. Action: "Get Contents of URL" (kirim extracted text)

→ Setiap screenshot struk akan auto tercatat!
```

## 🔧 Troubleshooting

### Shortcut tidak jalan:
1. Cek API Key sudah benar
2. Cek URL endpoint sudah benar
3. Test di browser dulu

### Siri tidak mengenali:
1. Pastikan nama shortcut mudah diucapkan
2. Coba rename: "Catat Transaksi"
3. Latih Siri: Settings → Siri & Search

### Network error:
1. Cek koneksi internet
2. Pastikan HTTPS (bukan HTTP)
3. Cek CORS headers

## 💡 Tips

1. **Widget Stacking**: 
   - Buat 2 widget: Income & Expense
   - Stack di home screen

2. **Voice Optimization**:
   - Gunakan kata kunci yang jelas
   - "Catat" lebih mudah dari "Rekam"

3. **Quick Templates**:
   - Buat shortcut spesifik: "Makan Siang", "Bensin", "Kopi"
   - Set amount default

4. **Confirmation**:
   - Tambah "Show Notification" untuk konfirmasi
   - Atau "Vibrate Device" untuk haptic feedback

## 📱 Sample Shortcuts

### Template 1: Expense Quick
```
Name: 💸 Expense
Icon: Wallet
Actions:
1. Ask for Number: Amount
2. Ask for Text: Description
3. Get URL: https://.../ios-shortcut
   Body: {"text": "Expense [Description] [Amount]", "apiKey": "..."}
4. Show Notification
```

### Template 2: Income Quick
```
Name: 💵 Income
Icon: Bank
Actions: (sama, text: "Income ...")
```

### Template 3: Voice Only
```
Name: 🎤 Voice Record
Actions:
1. Dictate Text
2. Get URL
3. Speak Text: "Done"
```

## 🔐 Security

- API Key disimpan di shortcut (private)
- Gunae HTTPS only
- Bisa revoke API Key kapan saja
- Rate limiting: 100 request/minute

## 🆚 vs WhatsApp

| Fitur | iOS Shortcuts | WhatsApp |
|-------|---------------|----------|
| Setup | Lebih mudah | Butuh Fonnte |
| Voice | Siri | Chat |
| Widget | ✅ | ❌ |
| Share Sheet | ✅ | ❌ |
| Offline | ❌ (butuh internet) | ❌ |
| Cost | Free | Rp 20k-50k/bulan |
| Speed | ⚡ Instant | 📱 Buka WA dulu |

## 🎯 Rekomendasi

**Gunakan iOS Shortcuts jika:**
- ✅ iPhone user (tentu saja 😄)
- ✅ Mau setup gratis
- ✅ Mau input super cepat
- ✅ Suka pakai Siri

**Gunakan WhatsApp jika:**
- ✅ Android user juga pakai
- ✅ Mau reply/feedback
- ✅ Suka chat interface
- ✅ Mau broadcast/reminder

## 🚀 Next Steps

1. Deploy Edge Function:
   ```bash
   supabase functions deploy ios-shortcut
   ```

2. Add API Key column:
   ```sql
   ALTER TABLE user_preferences 
   ADD COLUMN shortcut_api_key TEXT UNIQUE;
   ```

3. Buat halaman settings untuk generate API key

4. Test!

---

Mau saya buatkan halaman settings untuk generate API Key? 🎉
