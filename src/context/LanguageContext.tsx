import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  // Navigation & App
  appName: string;
  proBadge: string;
  suiteSubtitle: string;
  smartScan: string;
  systemJunk: string;
  developerJunk: string;
  browsersPrivacy: string;
  photosMedia: string;
  cloudLarge: string;
  duplicateFinder: string;
  appUninstaller: string;
  systemHealth: string;
  preferencesLogs: string;
  
  // Section Headers (CleanMyMac X Grouping)
  sectionCleanup: string;
  sectionProtection: string;
  sectionSpeed: string;
  sectionFiles: string;
  sectionApplications: string;
  
  // Header
  protectedTag: string;
  cleanSelected: string;
  rescan: string;
  
  // Category Titles
  smartTitle: string;
  systemTitle: string;
  developerTitle: string;
  browsersTitle: string;
  photosTitle: string;
  cloudTitle: string;
  largeFilesTitle: string;
  duplicatesTitle: string;
  uninstallerTitle: string;
  monitorTitle: string;

  // Storage Gauge (Sidebar)
  macintoshHD: string;
  storageFree: string;
  storageTotal: string;
  storageUsed: string;

  // System Health View
  healthTitle: string;
  healthDesc: string;
  freeInactiveRam: string;
  purgingRam: string;
  ramPurgeSuccess: string;
  ramPurgeFail: string;
  processorCpu: string;
  memoryUnified: string;
  storageNvme: string;
  usedLabel: string;
  availableLabel: string;
  freeCacheLabel: string;
  wiredLabel: string;
  compressedLabel: string;
  systemSpecsTitle: string;
  osVersionTitle: string;
  macosVersion: string;
  systemUptime: string;
  computerName: string;
  mountPoint: string;
  appearanceTitle: string;
  appearanceDesc: string;
  darkMode: string;
  lightMode: string;
  languageTitle: string;
  languageDesc: string;
  englishLang: string;
  arabicLang: string;
  englishSub: string;
  arabicSub: string;

  // Desktop Notifications
  notificationsTitle: string;
  notificationsDesc: string;
  enableNotifications: string;
  enableSound: string;
  notifyPurgeLabel: string;
  notifyCleanLabel: string;
  notifyCpuLabel: string;
  notifyRamLabel: string;
  cpuThresholdLabel: string;
  ramThresholdLabel: string;
  testNotificationBtn: string;
  testNotificationSent: string;
  elevatedPurgeBtn: string;


  // Smart Scan View
  smartScanTitle: string;
  smartScanDesc: string;
  startSmartScan: string;
  scanningSystem: string;
  smartScanReady: string;
  itemsFoundText: string;
  cleanAllNow: string;
  noJunkFound: string;
  systemCleanBadge: string;
  summaryCleanup: string;
  summaryProtection: string;
  summarySpeed: string;
  reviewDetails: string;

  // Uninstaller View
  uninstallerHeaderTitle: string;
  uninstallerHeaderDesc: string;
  uninstallSelectedBtn: string;
  searchAppsPlaceholder: string;
  selectedCountText: string;
  leftoversText: string;
  uninstallSingleApp: string;

  // System Junk View
  systemJunkHeaderTitle: string;
  systemJunkHeaderDesc: string;

  // Developer Junk View
  devJunkHeaderTitle: string;
  devJunkHeaderDesc: string;
  projectsCountText: string;

  // Browser Cleaner View
  browserHeaderTitle: string;
  browserHeaderDesc: string;

  // Photos Cleaner View
  photosHeaderTitle: string;
  photosHeaderDesc: string;

  // Cloud & Large Files View
  cloudHeaderTitle: string;
  cloudHeaderDesc: string;
  minSizeLabel: string;

  // Duplicate Finder View
  duplicateHeaderTitle: string;
  duplicateHeaderDesc: string;
  chooseFolderToScan: string;
  scanSelectedFolderBtn: string;
  keepOriginalAutoSelect: string;

  // Clean Modal & Actions
  confirmCleanup: string;
  confirmCleanupDesc: string;
  selectedItems: string;
  totalSizeToFree: string;
  deletePermanently: string;
  deletePermanentlyDesc: string;
  cancelBtn: string;
  cleanNowBtn: string;
  cleaningInProgress: string;
  cleaningSuccess: string;
  selectFolder: string;
  revealInFinder: string;
  uninstallApp: string;
  selectAll: string;
  unselectAll: string;
  safeBadge: string;
}

const isWin = typeof window !== 'undefined' && Boolean(
  (window as any)?.cputyAPI?.platform === 'win32' ||
  (typeof navigator !== 'undefined' && (navigator.platform?.includes('Win') || navigator.userAgent?.includes('Windows')))
);

const translations: Record<Language, Translations> = {
  en: {
    appName: 'CPUTY',
    proBadge: 'PRO',
    suiteSubtitle: isWin ? 'Windows Clean Suite' : 'macOS Clean Suite',
    smartScan: 'Smart Scan',
    systemJunk: 'System Junk',
    developerJunk: 'Developer Junk',
    browsersPrivacy: 'Browsers & Privacy',
    photosMedia: 'Photos & Media',
    cloudLarge: 'Cloud & Large Files',
    duplicateFinder: 'Duplicate Finder',
    appUninstaller: 'App Uninstaller',
    systemHealth: 'System Health',
    preferencesLogs: 'Preferences & Logs',

    sectionCleanup: 'CLEANUP',
    sectionProtection: 'PROTECTION',
    sectionSpeed: 'SPEED',
    sectionFiles: 'FILES',
    sectionApplications: 'APPLICATIONS',

    protectedTag: isWin ? 'Windows Protected' : 'macOS Protected',
    cleanSelected: 'Clean Selected',
    rescan: 'Rescan',

    smartTitle: 'Smart Scan & Cleanup',
    systemTitle: isWin ? 'Windows System Junk & Caches' : 'macOS System Junk & Caches',
    developerTitle: 'Developer & Build Caches',
    browsersTitle: 'Browsers & Privacy Cleanup',
    photosTitle: 'Photos & Media Clutter',
    cloudTitle: 'Cloud Storage Local Cache',
    largeFilesTitle: 'Large & Hidden Files',
    duplicatesTitle: 'Duplicate File Hunter',
    uninstallerTitle: 'Complete App Uninstaller',
    monitorTitle: 'Real-time System Health & Memory',

    macintoshHD: isWin ? 'Local Disk (C:)' : 'Macintosh HD',
    storageFree: 'free',
    storageTotal: 'total',
    storageUsed: 'used',

    healthTitle: isWin ? 'Windows Hardware & Performance Monitor' : 'macOS Hardware & Performance Monitor',
    healthDesc: isWin 
      ? 'Real-time diagnostics for CPU cores, memory pressure, and primary storage drive.'
      : 'Real-time diagnostics for Apple Silicon / Intel CPUs, unified memory pressure, and internal NVMe storage.',
    freeInactiveRam: 'Free Up Inactive RAM',
    purgingRam: 'Purging RAM...',
    ramPurgeSuccess: 'Inactive RAM successfully purged!',
    ramPurgeFail: 'RAM purge failed or requires elevated permissions.',
    processorCpu: 'Processor (CPU)',
    memoryUnified: 'Unified Memory (RAM)',
    storageNvme: 'Storage',
    usedLabel: 'Used:',
    availableLabel: 'Available:',
    freeCacheLabel: 'Free / Cache:',
    wiredLabel: 'Wired:',
    compressedLabel: 'Compressed:',
    systemSpecsTitle: 'System Specifications',
    osVersionTitle: 'Operating System',
    macosVersion: 'Operating System',
    systemUptime: 'System Uptime',
    computerName: 'Computer Name',
    mountPoint: 'Mount Point',
    appearanceTitle: 'Appearance Theme',
    appearanceDesc: 'Customize application visual style between Dark and Light mode',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    languageTitle: 'Language Setting',
    languageDesc: 'Select your preferred interface language and layout',
    englishLang: 'English',
    arabicLang: 'العربية',
    englishSub: 'English (United States)',
    arabicSub: 'العربية (Arabic - RTL)',

    notificationsTitle: 'Desktop Notifications Configuration',
    notificationsDesc: 'Customize alerts, RAM purge responses, sound settings, and system load thresholds.',
    enableNotifications: 'Enable Desktop Notifications',
    enableSound: 'Play Alert Sounds',
    notifyPurgeLabel: 'RAM Purge Status Alerts',
    notifyCleanLabel: 'File Cleanup Completion Alerts',
    notifyCpuLabel: 'High CPU Usage Alert',
    notifyRamLabel: 'High RAM Usage Alert',
    cpuThresholdLabel: 'CPU Load Threshold',
    ramThresholdLabel: 'RAM Usage Threshold',
    testNotificationBtn: 'Send Test Notification',
    testNotificationSent: isWin ? 'Test notification delivered to Action Center!' : 'Test notification delivered to Notification Center!',
    elevatedPurgeBtn: 'Elevated Purge (Admin Sudo)',


    smartScanTitle: isWin ? 'One-Click Smart Windows Cleaner' : 'One-Click Smart macOS Cleaner',
    smartScanDesc: 'Instantly inspect and reclaim gigabytes across system caches, developer build artifacts, browser data, and duplicate files.',
    startSmartScan: 'Run Smart Scan',
    scanningSystem: isWin ? 'Analyzing Windows System...' : 'Analyzing macOS System...',
    smartScanReady: 'Smart Scan Completed',
    itemsFoundText: 'items safe to clean',
    cleanAllNow: 'Clean Smart Scan Items',
    noJunkFound: isWin ? 'Your PC is clean and running at peak performance.' : 'Your Mac is clean and running at peak performance.',
    systemCleanBadge: 'System Optimal',
    summaryCleanup: 'Cleanup',
    summaryProtection: 'Protection',
    summarySpeed: 'Speed & Files',
    reviewDetails: 'View Details',

    uninstallerHeaderTitle: 'Complete App Uninstaller & Leftover Hunter',
    uninstallerHeaderDesc: isWin 
      ? 'Completely remove applications along with AppData caches, registry traces, and leftover application data.'
      : 'Completely remove applications along with hidden ~/Library preferences, caches, and leftover application data.',
    uninstallSelectedBtn: 'Uninstall Selected',
    searchAppsPlaceholder: 'Search applications...',
    selectedCountText: 'selected',
    leftoversText: 'leftovers',
    uninstallSingleApp: 'Uninstall App',

    systemJunkHeaderTitle: isWin ? 'Windows System Junk & Caches' : 'macOS System Junk & Caches',
    systemJunkHeaderDesc: 'Safely reclaim disk space by purging obsolete user caches, system log archives, and crash diagnostics.',

    devJunkHeaderTitle: 'Developer & Build Caches',
    devJunkHeaderDesc: 'Eliminate heavyweight build caches from Xcode DerivedData, Homebrew downloads, Node modules, and package managers.',
    projectsCountText: 'projects',

    browserHeaderTitle: 'Browsers & Web Privacy Cleaner',
    browserHeaderDesc: 'Wipe website cache clutter, cookie trackers, and cached assets across Chrome, Safari, Firefox, Edge, and Arc.',

    photosHeaderTitle: 'Photos & Media Clutter',
    photosHeaderDesc: 'Remove derivative image renders, photo analysis caches, and temporary media export files.',

    cloudHeaderTitle: 'Cloud Storage & Large Files Hunter',
    cloudHeaderDesc: 'Identify local offline files from iCloud, Dropbox, OneDrive, and locate forgotten giant files on your drive.',
    minSizeLabel: 'Min size:',

    duplicateHeaderTitle: 'Duplicate File Hunter',
    duplicateHeaderDesc: 'Scan folders with cryptographic hashing to detect and reclaim space from duplicate files.',
    chooseFolderToScan: 'Choose Folder to Scan',
    scanSelectedFolderBtn: 'Scan Folder',
    keepOriginalAutoSelect: 'Auto-Select Duplicates (Keep Originals)',

    confirmCleanup: 'Confirm File Cleanup',
    confirmCleanupDesc: isWin ? 'The selected files and caches will be safely cleaned from your PC.' : 'The selected files and caches will be safely cleaned from your Mac.',
    selectedItems: 'Selected Items',
    totalSizeToFree: 'Reclaimable Space',
    deletePermanently: 'Delete Permanently',
    deletePermanentlyDesc: isWin ? 'Bypass Recycle Bin and immediately free up disk blocks' : 'Bypass Trash and immediately free up disk blocks',
    cancelBtn: 'Cancel',
    cleanNowBtn: 'Clean Now',
    cleaningInProgress: 'Cleaning...',
    cleaningSuccess: 'Cleanup completed successfully!',
    selectFolder: 'Select Folder',
    revealInFinder: isWin ? 'Reveal in File Explorer' : 'Reveal in Finder',
    uninstallApp: 'Uninstall App',
    selectAll: 'Select All',
    unselectAll: 'Unselect All',
    safeBadge: 'Safe',
  },
  ar: {
    appName: 'CPUTY',
    proBadge: 'برو',
    suiteSubtitle: isWin ? 'حزمة تنظيف وصيانة ويندوز' : 'مجموعة تنظيف وصيانة ماك',
    smartScan: 'الفحص الذكي',
    systemJunk: 'مخلفات النظام',
    developerJunk: 'مخلفات المطورين',
    browsersPrivacy: 'المتصفحات والخصوصية',
    photosMedia: 'الصور والوسائط',
    cloudLarge: 'السحابة والملفات الكبيرة',
    duplicateFinder: 'كاشف الملفات المكررة',
    appUninstaller: 'إلغاء تثبيت التطبيقات',
    systemHealth: 'صحة وأداء النظام',
    preferencesLogs: 'التفضيلات والسجلات',

    sectionCleanup: 'التنظيف',
    sectionProtection: 'الحماية والخصوصية',
    sectionSpeed: 'السرعة والأداء',
    sectionFiles: 'الملفات والمساحة',
    sectionApplications: 'التطبيقات',

    protectedTag: isWin ? 'نظام Windows محمي' : 'نظام macOS محمي',
    cleanSelected: 'تنظيف المحدد',
    rescan: 'إعادة الفحص',

    smartTitle: 'الفحص والتنظيف الذكي',
    systemTitle: isWin ? 'مخلفات وذاكرة التخزين المؤقت لنظام ويندوز' : 'مخلفات وذاكرة التخزين المؤقت لنظام ماك',
    developerTitle: 'مخلفات حزم المطورين وبناء المشاريع',
    browsersTitle: 'تنظيف المتصفحات والخصوصية',
    photosTitle: 'مخلفات الصور ومكتبة الوسائط',
    cloudTitle: 'الملفات المؤقتة للتخزين السحابي',
    largeFilesTitle: 'الملفات الكبيرة والمخفية',
    duplicatesTitle: 'صياد الملفات المكررة',
    uninstallerTitle: 'إلغاء تثبيت التطبيقات بالكامل',
    monitorTitle: 'مراقبة صحة النظام والذاكرة لحظياً',

    macintoshHD: isWin ? 'القرص المحلي (C:)' : 'قرص Macintosh HD',
    storageFree: 'متاح',
    storageTotal: 'الإجمالي',
    storageUsed: 'مستخدم',

    healthTitle: isWin ? 'مراقب عتاد وأداء نظام Windows' : 'مراقب عتاد وأداء نظام macOS',
    healthDesc: isWin 
      ? 'تشخيص مباشر للمعالج واستهلاك الذاكرة العشوائية ومساحة التخزين الرئيسية.'
      : 'تشخيص مباشر لمعالجات Apple Silicon / Intel وضغط الذاكرة الموحدة وسعة تخزين NVMe الداخلية.',
    freeInactiveRam: 'تفريغ الذاكرة غير النشطة',
    purgingRam: 'جاري تفريغ الذاكرة...',
    ramPurgeSuccess: 'تم تفريغ الذاكرة العشوائية غير النشطة بنجاح!',
    ramPurgeFail: 'فشل تفريغ الذاكرة أو يتطلب صلاحيات إضافية.',
    processorCpu: 'المعالج (CPU)',
    memoryUnified: 'الذاكرة العشوائية (RAM)',
    storageNvme: 'مساحة التخزين',
    usedLabel: 'المستخدم:',
    availableLabel: 'المتاح:',
    freeCacheLabel: 'المتاح / الكاش:',
    wiredLabel: 'المثبت (Wired):',
    compressedLabel: 'المضغوط:',
    systemSpecsTitle: 'مواصفات وتفاصيل النظام',
    osVersionTitle: 'نظام التشغيل',
    macosVersion: 'نظام التشغيل',
    systemUptime: 'مدة تشغيل الجهاز',
    computerName: 'اسم الكمبيوتر',
    mountPoint: 'نقطة التثبيت',
    appearanceTitle: 'مظهر التطبيق',
    appearanceDesc: 'تخصيص النمط المرئي للتطبيق بين الوضع الليلي والنهاري',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    languageTitle: 'إعدادات لغة التطبيق',
    languageDesc: 'اختر لغة الواجهة المفضلة مع ضبط اتجاه العرض المناسب',
    englishLang: 'English',
    arabicLang: 'العربية',
    englishSub: 'English (United States)',
    arabicSub: 'العربية (Arabic - RTL)',

    notificationsTitle: 'إعدادات إشعارات سطح المكتب',
    notificationsDesc: 'تخصيص التنبيهات، استجابة تفريغ الذاكرة، الأصوات، وحدود تنبيه ضغط المعالج والذاكرة.',
    enableNotifications: 'تفعيل إشعارات سطح المكتب',
    enableSound: 'تشغيل أصوات التنبيهات',
    notifyPurgeLabel: 'تنبيهات حالة تفريغ الذاكرة (RAM)',
    notifyCleanLabel: 'تنبيهات اكتمال تنظيف الملفات',
    notifyCpuLabel: 'تنبيه الاستهلاك العالي للمعالج (CPU)',
    notifyRamLabel: 'تنبيه الضغط العالي للذاكرة (RAM)',
    cpuThresholdLabel: 'حد تنبيه حمل المعالج',
    ramThresholdLabel: 'حد تنبيه استهلاك الذاكرة',
    testNotificationBtn: 'إرسال إشعار تجريبي',
    testNotificationSent: isWin ? 'تم إرسال الإشعار التجريبي لمركز إشعارات ويندوز بنجاح!' : 'تم إرسال الإشعار التجريبي لمركز إشعارات ماك بنجاح!',
    elevatedPurgeBtn: 'تفريغ مع صلاحيات مسؤول (Sudo)',


    smartScanTitle: isWin ? 'التنظيف الذكي لنظام ويندوز بنقرة واحدة' : 'التنظيف الذكي لنظام ماك بنقرة واحدة',
    smartScanDesc: 'افحص واستعد غيغابايت من المساحة الضائعة عبر كاش النظام، ملفات بناء المطورين، بيانات المتصفحات، والملفات المكررة.',
    startSmartScan: 'بدء الفحص الذكي',
    scanningSystem: isWin ? 'جاري فحص نظام Windows...' : 'جاري فحص نظام macOS...',
    smartScanReady: 'اكتمل الفحص الذكي',
    itemsFoundText: 'عناصر آمنة للتنظيف',
    cleanAllNow: 'تنظيف جميع عناصر الفحص الذكي',
    noJunkFound: isWin ? 'جهاز الكمبيوتر الخاص بك نظيف ويعمل بأقصى كفاءة.' : 'نظام ماك نظيف ويعمل بأقصى كفاءة.',
    systemCleanBadge: 'نظام مثالي',
    summaryCleanup: 'التنظيف',
    summaryProtection: 'الحماية',
    summarySpeed: 'السرعة والملفات',
    reviewDetails: 'عرض التفاصيل',

    uninstallerHeaderTitle: 'إلغاء تثبيت التطبيقات وصياد المتبقيات',
    uninstallerHeaderDesc: isWin 
      ? 'حذف التطبيقات بالكامل مع ملفات AppData وسجل النظام وبقايا الملفات.'
      : 'حذف التطبيقات بالكامل مع ملفات التفضيلات المخفية في مكتبة النظام والكاش وبقايا الملفات.',
    uninstallSelectedBtn: 'إلغاء تثبيت المحدد',
    searchAppsPlaceholder: 'بحث عن التطبيقات...',
    selectedCountText: 'محدد',
    leftoversText: 'متبقيات',
    uninstallSingleApp: 'إلغاء التثبيت',

    systemJunkHeaderTitle: isWin ? 'مخلفات وذاكرة التخزين المؤقت لنظام ويندوز' : 'مخلفات وذاكرة التخزين المؤقت لنظام ماك',
    systemJunkHeaderDesc: 'استعد مساحة التخزين بحذف كاش المستخدم وسجلات النظام وتقارير التشخيص وسلة المهملات بأمان.',

    devJunkHeaderTitle: 'مخلفات حزم المطورين وبناء المشاريع',
    devJunkHeaderDesc: 'تخلص من ملفات البناء الثقيلة في Xcode DerivedData وكاش Homebrew وNode modules ومديري الحزم.',
    projectsCountText: 'مشاريع',

    browserHeaderTitle: 'تنظيف المتصفحات وخصوصية الويب',
    browserHeaderDesc: 'احذف ملفات كاش الويب المؤقتة ومتتبعات الكوكيز من Chrome وSafari وFirefox وEdge وArc.',

    photosHeaderTitle: 'مخلفات مكتبة الصور والوسائط',
    photosHeaderDesc: 'تخلص من الصور المشتقة وكاش تحليل الصور وملفات تصدير الوسائط المؤقتة.',

    cloudHeaderTitle: 'الملفات الكبيرة والتخزين السحابي',
    cloudHeaderDesc: 'اكتشف الملفات المحلية المحفوظة من iCloud وDropbox وOneDrive واعثر على الملفات الضخمة المنسية.',
    minSizeLabel: 'أقل حجم:',

    duplicateHeaderTitle: 'صياد الملفات المكررة',
    duplicateHeaderDesc: 'افحص المجلدات بالتشفير الرقمي لاكتشاف واستعادة المساحة من الملفات المكررة المتطابقة.',
    chooseFolderToScan: 'اختر مجلداً للفحص',
    scanSelectedFolderBtn: 'فحص المجلد',
    keepOriginalAutoSelect: 'تحديد المكررات تلقائياً (الإبقاء على الأصل)',

    confirmCleanup: 'تأكيد تنظيف الملفات',
    confirmCleanupDesc: isWin ? 'سيتم حذف الملفات والذاكرة المؤقتة المحددة بأمان من جهازك.' : 'سيتم تنظيف الملفات والكاش المحددة بأمان من جهاز ماك الخاص بك.',
    selectedItems: 'العناصر المحددة',
    totalSizeToFree: 'المساحة المستعادة',
    deletePermanently: 'حذف نهائي فوري',
    deletePermanentlyDesc: isWin ? 'تجاوز سلة المحذوفات وتحرير مساحة التخزين فوراً' : 'تجاوز سلة المهملات وتحرير مساحة التخزين فوراً',
    cancelBtn: 'إلغاء',
    cleanNowBtn: 'تنظيف الآن',
    cleaningInProgress: 'جاري التنظيف...',
    cleaningSuccess: 'تم التنظيف بنجاح!',
    selectFolder: 'اختيار مجلد',
    revealInFinder: isWin ? 'فتح في مستكشف الملفات' : 'إظهار في Finder',
    uninstallApp: 'إلغاء التثبيت',
    selectAll: 'تحديد الكل',
    unselectAll: 'إلغاء تحديد الكل',
    safeBadge: 'آمن',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof Translations) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('cputy_language');
    if (saved === 'en' || saved === 'ar') {
      return saved;
    }
    // Auto-detect Arabic locale if system preference starts with ar
    if (navigator.language.startsWith('ar')) {
      return 'ar';
    }
    return 'en';
  });

  useEffect(() => {
    const root = document.documentElement;
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    root.setAttribute('lang', language);
    root.setAttribute('dir', dir);
    document.body.setAttribute('dir', dir);
    if (language === 'ar') {
      root.classList.add('rtl-layout');
    } else {
      root.classList.remove('rtl-layout');
    }
    localStorage.setItem('cputy_language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: keyof Translations): string => {
    return translations[language][key] || translations.en[key] || String(key);
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

