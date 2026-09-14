# Changelog

All notable changes to the **CPUTY** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.4.0] - 2026-09-13

### Added
- **Dedicated Settings & Preferences Architecture**:
  - Decoupled all configuration settings from the System Health view into a dedicated **Preferences & Settings** view (`SettingsView.tsx`).
  - Seamlessly integrated all configuration areas: Appearance (Dark, Light, System) with interactive live preview cards, Typography (`FontSelector`), Language (`LanguageToggle` with full RTL/LTR support), Desktop Notifications, and Software Auto-Updates (`SoftwareUpdateCard`).
  - Wired Sidebar bottom quick navigation button directly to the Settings view.
- **Speed Progression Trends Timeline Chart**:
  - Interactive SVG trend chart visualizing historical speed fluctuations across session tests.
  - Smooth cubic Bézier interpolation curves with dynamic area gradients for Download, Upload, and Latency metrics.
  - Interactive metric filters (`All Metrics`, `Download`, `Upload`, `Latency`).
  - Aggregate telemetry statistics: Peak Speed, Average Download, and Average Latency.
  - Bidirectional hover linking between timeline points and session history table rows.
  - Complete left-to-right (`dir="ltr"`) number and unit isolation for `Mbps`, `ms`, and timestamps across RTL and LTR view modes.
- **Modernized Brand Identity & High-Resolution App Icons**:
  - Generated and packaged high-resolution app icons with transparent backgrounds across all required formats: `build/icon.icns`, `build/icon.ico`, `build/icon.png`, `public/app-icon.png`, `public/favicon.svg`.
  - Updated macOS Electron patcher (`scripts/patch-electron-icon.js`) with automated LaunchServices dock and notification center cache flushes.
  - Re-aligned visual brand colors (`#805D93` purple, `#169873` emerald, `#F49FBC` rose, `#FFD3BA` peach) across cards and indicators.

### Changed
- **System Health & Hardware Telemetry Refinements**:
  - Streamlined `SystemHealthView` to focus strictly on real-time performance and system specs with zero settings clutter.
  - Redesigned the 4-tier memory breakdown (Active, Wired, Compressed, Free/Cache) into a 2×2 metric grid with dedicated numeric rows and `dir="ltr"` formatting, preventing any number clipping or ellipsis truncation.
  - Synchronized memory pressure bar segment colors with the metric badge indicators.
  - Cleaned up Arabic terminology for memory allocation (`المثبت:` for Wired Memory).

### Fixed
- Fixed text truncation in system RAM breakdown where numbers were obscured on compact card layouts.
- Fixed bidirectional text mixing with parenthesized English words in Arabic localization.
- Fixed duplicate translation keys in `LanguageContext.tsx`.

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
