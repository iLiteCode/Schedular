# 📱 Interview Scheduler - Mobile App Installation Guide

Your Interview Scheduler is now a **Progressive Web App (PWA)** that can be installed on any device!

## ✨ What is a PWA?

A Progressive Web App works just like a native mobile app but doesn't require downloading from an app store. You can:
- 📲 Install it directly from your browser
- 🚀 Launch it from your home screen
- 💾 Use it offline (with cached data)
- 📱 Get a native app-like experience

---

## 📱 How to Install on Mobile

### iPhone / iPad (iOS - Safari)

1. Open Safari and navigate to your app URL
2. Tap the **Share** button (box with arrow pointing up) at the bottom
3. Scroll down and tap **"Add to Home Screen"**
4. Customize the name if desired
5. Tap **"Add"** in the top right
6. The app icon will appear on your home screen!

**Alternative Method:**
- When visiting the site, look for the install banner at the top
- Tap the **"Install"** button

### Android (Chrome)

1. Open Chrome and navigate to your app URL
2. Tap the **Menu** (three dots) in the top right
3. Select **"Add to Home Screen"** or **"Install App"**
4. Tap **"Install"** in the popup
5. The app icon will appear on your home screen!

**Alternative Method:**
- Look for the install banner at the top of the page
- Tap the **"Install"** button
- Or look for the install icon (⊕) in the address bar

---

## 💻 How to Install on Desktop

### Chrome / Edge / Brave

1. Navigate to your app URL
2. Look for the **install icon** (⊕ or computer icon) in the address bar
3. Click it and select **"Install"**
4. The app will open in its own window
5. Access it from your desktop or taskbar!

**Alternative Method:**
- Click the **Menu** (three dots)
- Select **"Install [App Name]..."**

### Safari (macOS)

1. Navigate to your app URL
2. Click **File** → **"Add to Dock"**
3. The app will be added to your Dock

---

## 🎯 Features After Installation

Once installed, you get:

✅ **Home Screen Icon** - Quick access like any app  
✅ **Standalone Mode** - Opens without browser UI  
✅ **Offline Support** - Basic functionality works offline  
✅ **Push Notifications** (if enabled)  
✅ **Faster Performance** - Cached resources load instantly  
✅ **Native Feel** - Full-screen experience  

---

## 🔧 Technical Details

### PWA Configuration

- **Manifest**: `/public/manifest.json`
- **Service Worker**: `/public/service-worker.js`
- **Icons**: 192x192 and 512x512 PNG icons
- **Theme Color**: Indigo (#4F46E5)
- **Display Mode**: Standalone
- **Offline Support**: Yes (via service worker caching)

### Browser Support

| Platform | Browser | Support |
|----------|---------|---------|
| iOS | Safari 11.3+ | ✅ Full |
| Android | Chrome 40+ | ✅ Full |
| Desktop | Chrome 73+ | ✅ Full |
| Desktop | Edge 79+ | ✅ Full |
| Desktop | Firefox | ⚠️ Partial |
| Desktop | Safari 14+ | ✅ Full |

---

## 🐛 Troubleshooting

### "Add to Home Screen" option not showing?

**iOS:**
- Make sure you're using Safari (not Chrome or other browsers)
- Ensure you're not in Private Browsing mode

**Android:**
- Clear browser cache and reload
- Ensure you're using Chrome or supported browser
- Check that you're not in Incognito mode

### App not updating?

1. Uninstall the app (long-press icon → Remove)
2. Clear browser cache
3. Reinstall the app

### Service Worker issues?

Check browser console (F12) for errors. The service worker should register automatically.

---

## 📚 For Developers

### Files Modified for PWA:

1. `/frontend/public/manifest.json` - App metadata
2. `/frontend/public/service-worker.js` - Offline caching
3. `/frontend/public/index.html` - PWA meta tags
4. `/frontend/src/pages/BookingPage.jsx` - Install prompt
5. `/frontend/public/icon-192.png` - App icon (192x192)
6. `/frontend/public/icon-512.png` - App icon (512x512)

### Testing PWA Locally:

```bash
# Check PWA readiness
npx lighthouse http://localhost:3000 --view

# Or use Chrome DevTools
# 1. Open DevTools (F12)
# 2. Go to Application tab
# 3. Check Manifest, Service Workers, and Storage
```

### Updating the PWA:

When you push updates:
1. Service worker automatically updates
2. Users get new version on next app reload
3. Update `CACHE_NAME` in service-worker.js for cache busting

---

## 🎉 Success!

Your Interview Scheduler is now installable on any device. Users can:
- Book interviews from their home screen
- Access the app offline
- Enjoy a native app experience
- No app store required!

**Need the native mobile app?** Consider upgrading to Emergent's Mobile Agent for full React Native apps distributed through iOS App Store and Google Play Store.

---

## 📞 Support

For issues or questions about the PWA implementation, check:
- Browser console for errors (F12)
- Application tab in DevTools
- Network tab to verify service worker is active

**Admin Credentials:**
- Username: `admin`
- Password: `admin123`
