const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// macOS-specific icon patching and AppleScript notification compiling is only supported on macOS
if (process.platform !== 'darwin') {
  process.exit(0);
}

try {
  const srcIcon = path.join(__dirname, '../build/icon.icns');
  const targetIcon = path.join(__dirname, '../node_modules/electron/dist/Electron.app/Contents/Resources/electron.icns');
  const infoPlist = path.join(__dirname, '../node_modules/electron/dist/Electron.app/Contents/Info.plist');
  const electronApp = path.join(__dirname, '../node_modules/electron/dist/Electron.app');

  let modified = false;

  if (fs.existsSync(srcIcon) && fs.existsSync(targetIcon)) {
    fs.copyFileSync(srcIcon, targetIcon);
    modified = true;
    console.log('[patch-electron-icon] Replaced Electron.app icon with CPUTY icon.icns');
  }

  if (fs.existsSync(infoPlist)) {
    try {
      execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleName CPUTY" "${infoPlist}" 2>/dev/null || true`);
      execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName CPUTY" "${infoPlist}" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string CPUTY" "${infoPlist}" 2>/dev/null || true`);
      execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.cputy.app" "${infoPlist}" 2>/dev/null || true`);
      modified = true;
      console.log('[patch-electron-icon] Updated Electron.app Info.plist CFBundleName & CFBundleDisplayName & CFBundleIdentifier to CPUTY');
    } catch {
      // ignore
    }
  }

  if (modified && fs.existsSync(electronApp)) {
    try {
      // macOS Notification Center strictly requires a valid code signature to deliver notifications
      execSync(`codesign --force --deep -s - "${electronApp}" 2>/dev/null || true`);
      console.log('[patch-electron-icon] Re-signed Electron.app with ad-hoc signature');
      // Flush macOS Launch Services icon cache so notifications use the new CPUTY icon
      execSync(`/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "${electronApp}" 2>/dev/null || true`);
      // Restart Notification Center to clear any cached notification icons
      execSync(`killall NotificationCenter 2>/dev/null || true`);
    } catch {
      // ignore
    }
  }

  // Compile CPUTYNotifier.app helper with CPUTY icon so any system notifications on macOS use the CPUTY icon
  const notifierApp = path.join(__dirname, '../build/CPUTYNotifier.app');
  if (fs.existsSync(srcIcon)) {
    try {
      execSync(`rm -rf "${notifierApp}" 2>/dev/null || true`);
      execSync(`osacompile -o "${notifierApp}" -e 'on run argv
  set notifBody to ""
  set notifTitle to "CPUTY"
  if (count of argv) >= 1 then set notifBody to item 1 of argv
  if (count of argv) >= 2 then set notifTitle to item 2 of argv
  display notification notifBody with title notifTitle sound name "default"
end run'`);
      const notifierIcon = path.join(notifierApp, 'Contents/Resources/applet.icns');
      const notifierPlist = path.join(notifierApp, 'Contents/Info.plist');
      fs.copyFileSync(srcIcon, notifierIcon);
      execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleName CPUTY" "${notifierPlist}" 2>/dev/null || true`);
      execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName CPUTY" "${notifierPlist}" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string CPUTY" "${notifierPlist}" 2>/dev/null || true`);
      execSync(`/usr/libexec/PlistBuddy -c "Add :CFBundleIdentifier string com.cputy.notifier" "${notifierPlist}" 2>/dev/null || /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.cputy.notifier" "${notifierPlist}" 2>/dev/null || true`);
      execSync(`/usr/libexec/PlistBuddy -c "Set :LSUIElement true" "${notifierPlist}" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :LSUIElement bool true" "${notifierPlist}" 2>/dev/null || true`);
      execSync(`codesign --force --deep -s - "${notifierApp}" 2>/dev/null || true`);
      // Flush macOS Launch Services icon cache so the new icon is shown immediately
      execSync(`/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "${notifierApp}" 2>/dev/null || true`);
      console.log('[patch-electron-icon] Built and signed CPUTYNotifier.app with CPUTY icon');
    } catch (e) {
      console.warn('[patch-electron-icon] Could not build CPUTYNotifier.app:', e.message);
    }
  }
} catch (err) {
  // ignore
}

