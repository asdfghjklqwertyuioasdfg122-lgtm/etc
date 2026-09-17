import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { User } from '../../types';
import { ShieldCheck, UserCheck, KeyRound, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { BluePyramidLogo } from '../common/BluePyramidLogo';

interface OwnerSetupWizardProps {
  onOwnerCreated?: (user: User) => void;
  onComplete?: (user: User) => void;
}

export const OwnerSetupWizard: React.FC<OwnerSetupWizardProps> = ({ onOwnerCreated, onComplete }) => {
  const [fullName, setFullName] = useState('محمد عبد الغني');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('يرجى كتابة الاسم الكامل لمالك النظام.');
      return;
    }
    if (!username.trim()) {
      setError('يرجى تحديد اسم المستخدم يدوياً.');
      return;
    }
    if (username.length < 3) {
      setError('يجب ألا يقل اسم المستخدم عن 3 أحرف أو أرقام.');
      return;
    }
    if (!password) {
      setError('يرجى تحديد كلمة المرور.');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب ألا تقل عن 6 خانات.');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمة المرور وتأكيد كلمة المرور غير متطابقين.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صالح.');
      return;
    }

    setIsSubmitting(true);
    const result = StorageService.createOwnerAccount({
      fullName,
      username,
      password,
      email,
    });

    if (result.success && result.user) {
      // Auto login newly created owner
      StorageService.login(username, password);
      if (typeof onOwnerCreated === 'function') {
        onOwnerCreated(result.user);
      }
      if (typeof onComplete === 'function') {
        onComplete(result.user);
      }
    } else {
      setError(result.error || 'حدث خطأ أثناء إنشاء حساب مالك النظام.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Header / Branding */}
        <div className="bg-gradient-to-r from-[#0A4DA3] to-[#1565C0] p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12"></div>
          {/* Blue Pyramid Branding Logo */}
          <div className="relative inline-flex items-center justify-center p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 mb-4 shadow-inner">
            <BluePyramidLogo size="lg" animate />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-1 text-white">منصة ETC الذكية</h1>
          <p className="text-xs text-blue-100 font-medium max-w-md mx-auto leading-relaxed">
            للمحاسبة والمراجعة والضرائب وإدارة الأعمال
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-blue-100 rounded-full text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            التهيئة الأولى للنظام • إعداد مالك النظام
          </div>
        </div>

        {/* Content & Form */}
        <div className="p-8">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3 text-[#0A4DA3] font-bold text-lg mb-1">
              <ShieldCheck className="w-6 h-6 text-[#0A4DA3]" />
              <h2>إعداد مالك النظام</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              مالك النظام الدائم: <strong className="text-slate-800 font-bold">محمد عبد الغني</strong>. يرجى اختيار اسم المستخدم وكلمة المرور يدوياً لإنشاء حساب المالك الدائم للنظام.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* الاسم الكامل */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الاسم الكامل لمالك النظام *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="محمد عبد الغني"
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3] focus:border-transparent transition-all"
                  required
                />
                <UserCheck className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">مالك النظام المعتمد: محمد عبد الغني</span>
            </div>

            {/* اسم المستخدم */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المستخدم (Username) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="اكتب اسم المستخدم هنا يدويًا"
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3] focus:border-transparent transition-all"
                  autoComplete="off"
                  required
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                يقوم المالك باختيار اسم المستخدم وكلمة المرور يدوياً.
              </span>
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                البريد الإلكتروني *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@etc-erp.com"
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3] focus:border-transparent transition-all"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            {/* كلمة المرور وتأكيد كلمة المرور */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3] focus:border-transparent transition-all"
                    autoComplete="new-password"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  تأكيد كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3] focus:border-transparent transition-all"
                    autoComplete="new-password"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#0A4DA3] hover:bg-[#1565C0] text-white font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{isSubmitting ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب المالك'}</span>
              </button>
            </div>
          </form>

          {/* Security policy note */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              حساب مالك النظام يتمتع بصلاحيات كاملة لإدارة المستخدمين والصلاحيات والأنظمة المحاسبية، ولا يمكن حذفه أو تعطيله نهائياً.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
