# CPUTY 🚀
### The Modern macOS System Cleaner, Duplicate Hunter & Storage Optimizer

**CPUTY** is an ultra-fast, premium desktop application built for macOS that scans every corner of your Mac to detect and purge gigabytes of junk, unnecessary caches, duplicate files, browser tracking artifacts, and hidden cloud mirrors.

---

## 🌟 Key Features

1. **🚀 Smart Scan & One-Click Cleanup**
   - Instant multi-threaded scan across all system modules.
   - One-click safe cleanup with live disk recovery animations.

2. **🧹 macOS System Junk & Caches**
   - User application caches (`~/Library/Caches`)
   - System logs & diagnostic crash dumps (`~/Library/Logs`, `/Library/Logs`)
   - Saved Application State snapshots and QuickLook thumbnail cache.
   - macOS Trash purge with granular per-file preview.

3. **💻 Developer & Build Junk**
   - Xcode `DerivedData`, `Archives`, and iOS `DeviceSupport` symbols.
   - Homebrew download cache.
   - Node.js `npm`, `yarn`, `pnpm` global packages cache.
   - Python `pip`, Rust `cargo`, CocoaPods, and Android Gradle caches.

4. **🌐 Browsers & Privacy Protection**
   - Google Chrome, Apple Safari, Arc Browser, Brave, Microsoft Edge, Mozilla Firefox.
   - Purges disk caches, code caches, GPU shader caches, and local tracking artifacts.

5. **📸 Photos & Media Clutter**
   - Apple Photos derivative render caches and face-detection scratch files.
   - Desktop and Pictures screenshot clutter organizer.
   - Spotify offline cache and video export buffers.

6. **☁️ Cloud Storage & Large Hidden Files**
   - Local sync mirrors: iCloud Drive (`Mobile Documents`), Dropbox, Google Drive, OneDrive.
   - Disk-wide Large Files Hunter (>50MB, >100MB, >500MB, >1GB) with age filters and Finder reveal.

7. **👥 Fast Duplicate File Hunter**
   - 3-stage hashing (size match ➔ partial sample hash ➔ full cryptographic MD5).
   - "Smart Select Clones": Automatically preserves the oldest original file while selecting clones for deletion.

8. **📦 Complete App Uninstaller & Leftover Hunter**
   - Lists all installed macOS applications with exact total disk footprint.
   - Deep scans associated files across `Application Support`, `Caches`, `Preferences (.plist)`, and `Containers`.
   - 1-click clean uninstallation without residual clutter.

9. **⚡ Real-time Hardware & Performance Monitor**
   - Live Apple Silicon / Intel CPU utilization.
   - Memory breakdown: Wired, Active, Compressed, and Free RAM.
   - NVMe internal storage capacity meters.
   - One-click **"Free Up Inactive RAM"** memory purge.

---

## 🛠️ Technology Stack

- **Framework**: Electron 30+
- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Lucide Icons
- **Bundler**: Vite
- **Security**: Context Isolation, secure IPC preload bridge, macOS System File Whitelisting
- **Safety**: macOS Trash (`shell.trashItem`) integration with option for permanent removal.

---

## 🚀 Getting Started

### Development Mode
```bash
npm install
npm run dev
```

### Build Production Bundle
```bash
npm run build
npm start
```

---

## 🔒 Safety & System Protection
CPUTY includes built-in safeguards to ensure critical macOS system directories (`/System`, `/usr`, `/bin`, `/sbin`, `/private/etc`, root folders) are strictly protected and never touched.
