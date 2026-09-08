# Changelog

All notable changes to the **CPUTY** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.0] - 2026-09-08

### Added
- **Internet Speed Test**:
  - Added dedicated **Internet Speed** view under the SPEED sidebar navigation section.
  - Interactive futuristic speedometer gauge with central start test button and live real-time Mbps needle.
  - Real-time telemetry sparkline tracking instant network throughput variations.
  - Comprehensive post-test results dashboard: Download & Upload speeds, Ping, Jitter, Packet Loss, and connection stability.
  - Real-world capability matrix evaluating 4K/8K streaming, competitive low-latency gaming, and HD video conferencing.
  - Network metadata and server diagnostics (public IP, city, country, ISP, and Cloudflare edge node).
  - Session test history table with comparison metrics and quick re-test controls.
- **Application Typography & Font Customization**:
  - Added in-app Font Selector in Settings to customize the primary interface typeface.
  - Support for popular Google Fonts and system typefaces: Cairo (Arabic/English), Inter, Outfit, Roboto, Tajawal, and System Default.
  - Live typography preview box displaying real-time English and Arabic sample text.
  - Dynamic root CSS variable binding (`--app-font-family`) with persistent user preferences in `localStorage`.
- **Integrated Auto-Updater System**:
  - Built-in software update system using `electron-updater` configured for GitHub Releases (`alaaels3id/cputy`).
  - Added dedicated Software Updates card in Settings displaying current version, check for updates action, and release notes.
  - Real-time download progress bar showing transferred MB, total size, and download speed.
  - One-click restart and install action.
  - Hybrid mode: native delta updates in production and fallback GitHub API release checks in development.

### Fixed
- Fixed dropdown menu overlapping and CSS stacking context issues caused by `backdrop-filter` in settings cards.

## [1.2.0] - 2026-09-06

### Added
- **Windows Native Compatibility & Optimization**:
  - Full support for Windows 10 & 11 system caches, temporary folders, crash dumps, and prefetch storage.
  - Windows installed application scanning and residual leftovers tracking via PowerShell and registry integration.
  - Windows administrator elevated RAM purging with automated privileges handling.
  - Cross-platform hardware diagnostics covering Windows CPU load, unified RAM, and local disk volume statistics.
- **Vite Native ESM Configuration**:
  - Introduced `vite.config.mts` using explicit Module TypeScript (`.mts`) to support Vite's native config loader.
  - Suppressed native loader CommonJS warnings and added `VITE_CONFIG_NATIVE_IGNORE_WARNING` configuration.
- **Platform-Aware Build Scripts**:
  - Added OS platform guards in `scripts/patch-electron-icon.js` to automatically bypass macOS-specific utilities (`osacompile`, `codesign`, `PlistBuddy`) on Windows environments.

### Changed
- **Light Mode High-Contrast Overhaul**:
  - Overhauled light theme typography across the entire application to guarantee WCAG AAA contrast compliance (> 10:1 ratio).
  - Reworked primary action buttons (`Clean Selected`, `Free Up Inactive RAM`, modal confirmations) to render crisp, deep dark slate/spruce text (`#0F172A`) against bright aqua and emerald gradients.
  - Enhanced brand header gradient (`CPUTY PRO`) and suite subtitle with vibrant, legible slate-spruce tones instead of fading into white.
  - Updated toggle switch tracks in light mode to rich teal (`#2A666A`) with distinct borders and subtle shadows for clear active-state visibility.
  - Fixed alert slider threshold values (CPU / RAM load percentages) to bold dark mono text (`text-slate-900 font-mono`) in light mode.
  - Improved App Uninstaller row details including publisher names, application paths, version badges, and associated leftovers accordions.
- **Sidebar & Surface Polish**:
  - Boosted navigation label, category header, and size badge contrast in the light sidebar.
  - Refined local disk storage gauges and hardware specification cards.

### Fixed
- Fixed `'osacompile' is not recognized as an internal or external command` error when running `npm run dev` on Windows.
- Fixed global `.btn-solid` rule that was forcing white text on bright aqua buttons, rendering button labels invisible in light mode.
- Fixed theme toggle label invalid `light:` Tailwind pseudo-variant.

---

## [1.1.0] - 2026-09-06

### Added
- **Multilingual Support (i18n)**:
  - Added complete bilingual English and Arabic localization with smooth in-app language switching.
  - Full Right-to-Left (RTL) layout support integrated with the **Cairo** typography system.
- **Automated Desktop Notifications & Alerts**:
  - Configurable desktop notification triggers for RAM purge completions and scan completions.
  - Custom user-defined threshold sliders for High CPU and High RAM alerts.
  - Built-in sound notification toggle and test notification dispatcher.

### Changed
- Refined CleanMyMac X inspired 3D Glass Orb orbital ring animations and specular reflections.
- Enhanced memory pressure calculation to display a 4-tier visual breakdown (Active, Wired, Compressed, Free).

---

## [1.0.0] - 2026-09-06

### Initial Release
- **Smart Scan Engine**: Multi-threaded scanner across System Junk, Developer Caches, Browsers, Photos, and Large Files.
- **System Junk Cleaner**: User application caches, system diagnostic logs, crash reports, and trash bin purge.
- **Developer Caches**: Xcode DerivedData, Homebrew, npm/yarn/pnpm, pip, cargo, and Gradle build artifacts cleaner.
- **Browser & Privacy Cleaner**: Comprehensive cache and tracking cookie cleaner for Chrome, Safari, Edge, Brave, and Firefox.
- **Duplicate File Finder**: 3-stage cryptographic MD5 duplicate detector with "Smart Select Clones" automation.
- **Complete App Uninstaller**: Deep scanner for applications, preferences, application support files, and containers.
- **Real-time Hardware & Performance Monitor**: Live CPU, memory pressure, NVMe storage usage, and RAM purge utility.
- **Signature UI**: Liquid-glass dark theme with CleanMyMac X inspired aesthetic, animations, and sound effects.
