import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldCheck, X, Sparkles, Package } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl mac-glass border border-white/10 p-6 space-y-6 shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isRose ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
              {isRose ? <Package className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">{modalTitle}</h3>
              <p className="text-xs text-mac-subtext">{modalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Space Stats */}
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5 space-y-2 text-center">
          <span className="text-[11px] text-mac-subtext uppercase tracking-wider font-semibold">{t('totalSizeToFree')}</span>
          <div className={`text-3xl font-extrabold text-transparent bg-clip-text ${isRose ? 'bg-gradient-to-r from-rose-500 to-pink-400 dark:from-rose-400 dark:to-pink-300' : 'bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-300'}`}>
            {formatBytes(totalSize)}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block">
            {isRTL ? (
              <>عبر <strong>{itemCount}</strong> {isRose ? 'تطبيق ومتبقيات محددة' : 'عنصر محدد'}</>
            ) : (
              <>Across <strong>{itemCount}</strong> selected {isRose ? 'application(s) and leftovers' : 'items'}</>
            )}
          </span>
        </div>

        {/* Safety Option */}
        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={permanently}
              onChange={(e) => setPermanently(e.target.checked)}
              className={`mt-0.5 rounded border-slate-400 dark:border-slate-700 ${isRose ? 'text-rose-600' : 'text-blue-600'} focus:ring-0`}
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">{t('deletePermanently')}</span>
              <span className="text-[11px] text-mac-subtext">
                {permanently 
                  ? (isRTL ? 'سيتم حذف الملفات والتطبيقات نهائياً ولن يمكن استعادتها من سلة المهملات.' : 'Files and application binaries will be permanently deleted and cannot be restored from macOS Trash.')
                  : (isRTL ? 'سيتم نقل الملفات إلى سلة مهملات ماك حتى تتمكن من استعادتها بسهولة إذا أردت.' : 'Files will be moved to macOS Trash bin so you can easily restore them if needed.')}
              </span>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-black/5 dark:border-white/5 transition-all cursor-pointer"
          >
            {t('cancelBtn')}
          </button>
          <button
            onClick={() => onConfirm(permanently)}
            className={`flex-1 py-2.5 rounded-xl text-white text-xs font-semibold transition-all cursor-pointer btn-solid ${
              isRose 
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-glow-rose' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-glow-blue'
            }`}
          >
            {modalConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
