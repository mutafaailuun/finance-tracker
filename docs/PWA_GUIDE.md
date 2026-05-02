# 📱 Progressive Web App (PWA) - Finance Tracker

Finance Tracker sekarang adalah PWA! Artinya bisa di-install di iPhone/Android seperti app native.

## ✨ Fitur PWA

- 📲 **Installable** - Tambah ke home screen
- 🚀 **Offline Support** - Bisa akses tanpa internet
- ⚡ **Fast Loading** - Cache assets untuk load cepat
- 🔄 **Auto Update** - Update otomatis saat ada versi baru
- 📊 **Native-like** - Full screen, tanpa address bar

## 🚀 Cara Install

### **iPhone (Safari)**

1. Buka Safari → kunjungi website Finance Tracker
2. Tap **Share** button (icon kotak dengan panah ke atas)
3. Scroll dan pilih **"Add to Home Screen"**
4. Tap **Add**
5. App muncul di home screen! 🎉

### **Android (Chrome)**

1. Buka Chrome → kunjungi website Finance Tracker
2. Tap **Menu** (titik tiga)
3. Pilih **"Add to Home screen"** atau **"Install app"**
4. Tap **Install**
5. App muncul di home screen! 🎉

### **Desktop (Chrome/Edge)**

1. Buka browser → kunjungi website
2. Look untuk **install icon** di address bar
3. Atau: Chrome Menu → Install Finance Tracker
4. App muncul di desktop/start menu!

## 🔄 Cara Update

PWA akan **auto-update** saat:
- User membuka app setelah update deploy
- Service worker detect perubahan

Untuk force update:
1. Close app completely
2. Buka lagi → versi baru akan load

## 📴 Mode Offline

Fitur yang work offline:
- ✅ View dashboard (data terakhir)
- ✅ View transactions (cached)
- ✅ View wallets
- ✅ View categories

Fitur yang butuh internet:
- ❌ Add/edit transactions
- ❌ AI chat
- ❌ WhatsApp webhook
- ❌ Login/logout

## 🛠️ Tech Stack

### **Module:**
- `@vite-pwa/nuxt` - Nuxt 3 PWA integration

### **Service Worker:**
- Workbox - Google's service worker library
- Auto-generated during build

### **Manifest:**
- `manifest.webmanifest` - App metadata
- Icon: SVG format (scalable)

### **Caching Strategy:**

| Resource | Strategy | Cache Duration |
|----------|----------|----------------|
| Start URL | Network First | 24 hours |
| Images | Cache First | 30 days |
| Google Fonts | Cache First | 365 days |
| Static Assets | Precache | - |

## 📂 File Structure

```
.output/public/
├── manifest.webmanifest     # PWA manifest
├── sw.js                    # Service Worker
├── workbox-xxx.js          # Workbox library
└── icon.svg                # App icon
```

## ⚙️ Konfigurasi (nuxt.config.ts)

```typescript
pwa: {
  registerType: 'autoUpdate',
  manifest: {
    name: 'Finance Tracker',
    short_name: 'FinTracker',
    description: 'Track your finances with AI assistance',
    theme_color: '#3b82f6',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait'
  },
  workbox: {
    navigateFallback: '/',
    runtimeCaching: [
      // Cache images
      {
        urlPattern: /^https:\/\/.+\.(?:png|gif|jpg|jpeg|svg|ico)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
          }
        }
      }
    ]
  }
}
```

## 🧪 Testing PWA

### **Chrome DevTools:**
1. Open DevTools (F12)
2. Go to **Application** tab
3. Check:
   - **Manifest** - Should show app details
   - **Service Workers** - Should show active SW
   - **Cache Storage** - Should show cached files

### **Lighthouse Audit:**
1. Open DevTools → Lighthouse tab
2. Select **PWA** category
3. Click **Generate report**
4. Aim for 100 score! 🎯

### **Offline Test:**
1. Open DevTools → Network tab
2. Select **Offline** from dropdown
3. Refresh page
4. App should still load (dari cache)

## 🎨 Kustomisasi Icon

Untuk ganti icon app:

1. Buat icon SVG baru
2. Replace `public/icon.svg`
3. Rebuild: `npm run build`
4. Deploy

### **Rekomendasi Icon:**
- Format: SVG (scalable)
- Size: 512x512px
- Background: Solid color (gradient OK)
- Safe zone: Keep content in center 384x384px

## 📊 Performa

### **Build Output:**
```
PWA v1.2.0
mode      generateSW
precache  31 entries (741.71 KiB)
files generated
  .output/public/sw.js
  .output/public/workbox-xxx.js
```

### **Loading Speed:**
- First visit: ~2-3 detik
- Repeat visit: <1 detik (dari cache)
- Offline: Instant (dari cache)

## 🐛 Troubleshooting

### **"Add to Home Screen" tidak muncul**
- Pastikan HTTPS (localhost OK untuk dev)
- Cek manifest valid (DevTools → Application)
- Refresh halaman

### **Icon tidak muncul di home screen**
- Icon harus format PNG/SVG
- Size minimum: 192x192px
- Cek icon path di manifest

### **Service Worker tidak aktif**
- DevTools → Application → Service Workers
- Check "Update on reload" (untuk dev)
- Check console errors

### **Cache tidak update**
- Clear site data (DevTools → Application → Clear storage)
- Atau: Tunggu service worker update
- Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### **iOS: Icon jadi screenshot**
iOS kadang generate icon dari screenshot halaman.
Solusi: Gunakan icon PNG dengan multiple sizes (192x192, 512x512).

## 🚀 Deploy ke Production

Setelah deploy, PWA otomatis aktif:

1. Build: `npm run build`
2. Deploy `.output/public` ke hosting
3. Akses via HTTPS
4. Done! 🎉

## 📱 Perbandingan: PWA vs Native App

| Fitur | PWA | Native App |
|-------|-----|------------|
| Install | Via browser | App Store |
| Update | Otomatis | Manual update |
| Biaya | Gratis | $99/tahun (Apple) |
| Offline | ✅ (terbatas) | ✅ (penuh) |
| Push Notif | ✅ | ✅ |
| Camera | ✅ | ✅ |
| Bluetooth | ❌ | ✅ |
| Size | ~5MB | 50-200MB |
| Performance | ⚡ Cepat | ⚡⚡ Lebih cepat |

## 💡 Tips

1. **Gunakan HTTPS** - PWA wajib HTTPS (kecuali localhost)
2. **Test di real device** - Simulator beda dengan device asli
3. **Monitor performa** - Gunakan Lighthouse untuk audit
4. **Keep it simple** - Jangan cache terlalu banyak data
5. **Update regularly** - User akan dapat versi terbaru otomatis

## 🔗 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [Nuxt PWA Module](https://vite-pwa-org.netlify.app/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

---

Selamat menggunakan Finance Tracker PWA! 📱✨
