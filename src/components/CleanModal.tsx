import React, { useState } from 'react';
import { X, Sparkles, Package, ShieldCheck, AlertTriangle } from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface CleanModalProps {
  isOpen: boolean;
  itemCount: number;
  totalSize: number;
  title?: string;
  subtitle?: string;
  confirmText?: string;
  theme?: 'blue' | 'rose';
  onConfirm: (permanently: boolean) => void;
  onClose: () => void;
}

export const CleanModal: React.FC<CleanModalProps> = ({
  isOpen,
  itemCount,
  totalSize,
  title,
  subtitle,
  confirmText,
  theme = 'blue',
  onConfirm,
  onClose,
}) => {
  const { t, isRTL } = useLanguage();
  const [permanently, setPermanently] = useState(false);

  if (!isOpen) return null;

  const isRose = theme === 'rose';
  const modalTitle = title || t('confirmCleanup');
  const modalSubtitle = subtitle || t('confirmCleanupDesc');
  const modalConfirmText = confirmText || t('cleanNowBtn');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl cputy-glass border border-mac-border p-6 space-y-6 shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{modalTitle}</h3>
              <p className="text-xs text-mac-subtext mt-0.5">{modalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Space Stats */}
        <div className="p-5 rounded-2xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5 space-y-2 text-center">
          <span className="text-[10.5px] text-mac-subtext uppercase tracking-widest font-mono font-bold">{t('totalSizeToFree')}</span>
          <div className="text-4xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#19353C] via-[#5F9C9F] to-[#92E6E0] dark:from-[#5F9C9F] dark:via-[#92E6E0] dark:to-[#FFFFFF]">
            {formatBytes(totalSize)}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
            {isRTL ? (
              <>عبر <strong className="text-slate-900 dark:text-white font-mono">{itemCount}</strong> {isRose ? 'تطبيق ومتبقيات محددة' : 'عنصر محدد'}</>
            ) : (
              <>Across <strong className="text-slate-900 dark:text-white font-mono">{itemCount}</strong> selected {isRose ? 'application(s) and leftovers' : 'items'}</>
            )}
          </span>
        </div>

        {/* Safety Option */}
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={permanently}
              onChange={(e) => setPermanently(e.target.checked)}
              className="mt-0.5 rounded border-slate-400 dark:border-slate-600 accent-[#92E6E0] focus:ring-0 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-200 block">{t('deletePermanently')}</span>
              <span className="text-[11px] text-mac-subtext leading-relaxed">
                {(() => {
                  const isWin = typeof window !== 'undefined' && Boolean(
                    window.cputyAPI?.platform === 'win32' ||
                    (typeof navigator !== 'undefined' && (navigator.platform?.includes('Win') || navigator.userAgent?.includes('Windows')))
                  );
                  if (permanently) {
                    return isRTL
                      ? (isWin ? 'سيتم حذف الملفات والتطبيقات نهائياً ولن يمكن استعادتها من سلة المحذوفات.' : 'سيتم حذف الملفات والتطبيقات نهائياً ولن يمكن استعادتها من سلة المهملات.')
                      : (isWin ? 'Files and application binaries will be permanently deleted and cannot be restored from Recycle Bin.' : 'Files and application binaries will be permanently deleted and cannot be restored from macOS Trash.');
                  } else {
                    return isRTL
                      ? (isWin ? 'سيتم نقل الملفات إلى سلة المحذوفات حتى تتمكن من استعادتها بسهولة إذا أردت.' : 'سيتم نقل الملفات إلى سلة مهملات ماك حتى تتمكن من استعادتها بسهولة إذا أردت.')
                      : (isWin ? 'Files will be safely moved to Recycle Bin so you can easily restore them if needed.' : 'Files will be safely moved to macOS Trash bin so you can easily restore them if needed.');
                  }
                })()}
              </span>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl cputy-btn-secondary text-xs font-semibold transition-all cursor-pointer"
          >
            {t('cancelBtn')}
          </button>
          <button
            onClick={() => onConfirm(permanently)}
            className="flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer btn-solid cputy-btn-primary shadow-glow-emerald"
          >
            {modalConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
