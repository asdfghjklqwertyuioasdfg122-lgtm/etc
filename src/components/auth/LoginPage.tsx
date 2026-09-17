import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { User } from '../../types';
import { Lock, User as UserIcon, ShieldAlert, KeyRound, Info, AlertCircle, ShieldCheck, Eye, EyeOff, Crown, Users } from 'lucide-react';
import { BluePyramidLogo } from '../common/BluePyramidLogo';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Mode: 'owner' (دخول المالك) | 'staff' (دخول الموظفين)
  const [loginMode, setLoginMode] = useState<'owner' | 'staff'>('owner');

  // STRICT RULE: Username and Password MUST ALWAYS BE BLANK!
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleModeChange = (mode: 'owner' | 'staff') => {
    setLoginMode(mode);
    setUsername('');
    setPassword('');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور.');
      return;
    }

    setIsSubmitting(true);

    const result =
      loginMode === 'owner'
        ? StorageService.loginOwner(username, password)
        : StorageService.login(username, password);

    if (result.success && result.user) {
      if (rememberMe) {
        localStorage.setItem('etc_erp_remember_user', username.trim());
      } else {
        localStorage.removeItem('etc_erp_remember_user');
      }
      onLoginSuccess(result.user);
    } else {
      setError(result.error || 'اسم المستخدم أو كلمة المرور غير صحيحة.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left / Visual Side: Blue Pyramid & Brand Presentation */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0A4DA3] via-[#1565C0] to-[#082F64] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Geometric Background Elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-[#2F80ED]/15 blur-3xl pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-100">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
              نظام مالي ومحاسبي معتمد
            </div>
            <span className="text-xs font-mono text-blue-200/80">EAS / IFRS Compliant</span>
          </div>

          {/* Central Hero: Large Blue Pyramid & Platform Title */}
          <div className="relative z-10 my-auto py-8 text-center flex flex-col items-center">
            <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl mb-6">
              <BluePyramidLogo size="xl" animate />
            </div>

            <div className="inline-block px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-blue-200 tracking-wider mb-2">
              ETC ERP PLATFORM
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              منصة ETC الذكية
            </h1>

            <p className="text-base sm:text-lg font-bold text-blue-100 mt-1 max-w-sm">
              للمحاسبة والمراجعة والضرائب
            </p>

            <p className="text-xs text-blue-200/90 mt-3 max-w-md leading-relaxed">
              المنظومة المالية والإدارية المتكاملة والمحمية بنظام أمان وتشفير متقدم
            </p>

            {/* Highlights Pillars */}
            <div className="grid grid-cols-3 gap-2 mt-6 w-full max-w-md text-center">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="text-xs font-bold text-white">معايير EAS</div>
                <div className="text-[10px] text-blue-200">المحاسبة المصرية</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="text-xs font-bold text-white">الضرائب المصرية</div>
                <div className="text-[10px] text-blue-200">فحص وقيمة مضافة</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="text-xs font-bold text-white">ETC AI</div>
                <div className="text-[10px] text-blue-200">مستشار خبير ذكي</div>
              </div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-200">
            <span>بيانات فعلية مشفرة SHA-256</span>
            <span>مالك النظام الدائم: محمد عبد الغني</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center bg-white/90 backdrop-blur-xl relative">
          <div className="max-w-md mx-auto w-full">
            {/* Mode Selector Tabs: دخول المالك vs دخول الموظفين */}
            <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl mb-8 border border-slate-200">
              <button
                type="button"
                onClick={() => handleModeChange('owner')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  loginMode === 'owner'
                    ? 'bg-[#0A4DA3] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>دخول المالك</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('staff')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  loginMode === 'staff'
                    ? 'bg-[#0A4DA3] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>دخول الموظفين</span>
              </button>
            </div>

            {/* Page Title & Subtitle */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2 lg:hidden">
                <BluePyramidLogo size="sm" />
                <span className="font-black text-[#0A4DA3]">منصة ETC الذكية</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                {loginMode === 'owner' ? (
                  <>
                    <Crown className="w-6 h-6 text-amber-500" />
                    <span>دخول المالك</span>
                  </>
                ) : (
                  <>
                    <Users className="w-6 h-6 text-[#0A4DA3]" />
                    <span>دخول الموظفين</span>
                  </>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {loginMode === 'owner'
                  ? 'بوابة الدخول الحصرية لمالك النظام الدائم (محمد عبد الغني)'
                  : 'بوابة الدخول لحسابات الموظفين المعتمدة من قِبل مالك النظام'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs font-medium animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username - STRICTLY BLANK */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                    className="w-full pl-4 pr-10 py-3 bg-slate-50/80 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A4DA3] focus:bg-white focus:border-transparent transition-all"
                    autoComplete="off"
                    required
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {/* Password - STRICTLY BLANK */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50/80 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0A4DA3] focus:bg-white focus:border-transparent transition-all"
                    autoComplete="current-password"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#0A4DA3] focus:ring-[#0A4DA3]"
                  />
                  <span>تذكرني على هذا الجهاز</span>
                </label>

                {loginMode === 'staff' && (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[#0A4DA3] hover:text-[#1565C0] font-semibold hover:underline cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-[#0A4DA3] to-[#1565C0] hover:from-[#1565C0] hover:to-[#0A4DA3] text-white font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2 text-sm"
              >
                <KeyRound className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'جارٍ التحقق من الهوية...'
                    : loginMode === 'owner'
                    ? 'دخول المالك'
                    : 'تسجيل دخول الموظف'}
                </span>
              </button>
            </form>

            {/* Security Policy Notice: Zero Public Registration */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-start gap-3 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100/80">
              <ShieldAlert className="w-5 h-5 text-[#0A4DA3] flex-shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed text-slate-600">
                <span className="font-bold text-[#0A4DA3] block mb-0.5">سياسة الأمان والرقابة:</span>
                التسجيل العام معطل تماماً. لا يمكن لأي مستخدم إنشاء حساب بنفسه. جميع الحسابات والصلاحيات تنشأ وتُدار يدوياً وحصرياً بواسطة مالك النظام (محمد عبد الغني).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal for Staff */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0A4DA3] flex items-center justify-center mb-4">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">إعادة تعيين كلمة المرور</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              وفقاً للمعايير الرقابية الصارمة لمنصة ETC، لا يمكن إعادة تعيين كلمات المرور آلياً.
              يرجى التوجه إلى <strong className="text-slate-900 font-bold">مالك النظام (محمد عبد الغني)</strong> مباشرةً لإعادة تعيين كلمة المرور الخاصة بحسابك من وحدة إدارة المستخدمين.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
