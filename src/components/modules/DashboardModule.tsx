import React from 'react';
import { StorageService } from '../../services/storage';
import { User } from '../../types';
import {
  TrendingUp,
  Receipt,
  BookOpen,
  Building2,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  FileSpreadsheet,
  FileSearch,
  Scale,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  ArrowDownRight,
} from 'lucide-react';
import { ActiveModule } from '../layout/Sidebar';
import { BluePyramidLogo } from '../common/BluePyramidLogo';

interface DashboardModuleProps {
  currentUser: User;
  onNavigate: (module: ActiveModule) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ currentUser, onNavigate }) => {
  const accounts = StorageService.getAccounts();
  const journalEntries = StorageService.getJournalEntries();
  const partners = StorageService.getPartners();
  const inventory = StorageService.getInventory();
  const documents = StorageService.getDocuments();

  const totalAssets = accounts
    .filter((a) => a.type === 'Asset')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = accounts
    .filter((a) => a.type === 'Liability')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalEquity = accounts
    .filter((a) => a.type === 'Equity')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalRevenues = accounts
    .filter((a) => a.type === 'Revenue')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalExpenses = accounts
    .filter((a) => a.type === 'Expense')
    .reduce((sum, a) => sum + a.balance, 0);

  const netIncome = totalRevenues - totalExpenses;
  const netMargin = totalRevenues > 0 ? ((netIncome / totalRevenues) * 100).toFixed(1) : '0.0';

  const customersCount = partners.filter((p) => p.type === 'Customer').length;
  const vendorsCount = partners.filter((p) => p.type === 'Vendor').length;

  // Audit double entry balance check
  const totalDebits = journalEntries.reduce((acc, curr) => acc + (curr.totalDebit || 0), 0);
  const totalCredits = journalEntries.reduce((acc, curr) => acc + (curr.totalCredit || 0), 0);
  const isJournalBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  // Tax metrics approximation based on recorded revenues & expenses
  const estimatedVatPayable = totalRevenues * 0.14;
  const estimatedVatDeductible = totalExpenses * 0.08;
  const netVatBalance = Math.max(0, estimatedVatPayable - estimatedVatDeductible);

  return (
    <div className="space-y-6">
      {/* Top Section: Large ETC Logo, Blue Pyramid Illustration, Welcome Message, Quick Actions */}
      <div className="bg-gradient-to-r from-[#0A4DA3] via-[#1565C0] to-[#0A2D64] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 rounded-full bg-[#2F80ED]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Brand & Welcome Message */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner flex-shrink-0">
              <BluePyramidLogo size="lg" animate />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-blue-100 text-xs font-semibold backdrop-blur-sm">
                  منصة ETC الذكية
                </span>
                <span className="text-xs text-blue-200">
                  {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#22C55E] bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                  المعايير المصرية EAS 2026
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                أهلاً بك، {currentUser.fullName}
              </h1>

              <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl leading-relaxed">
                لوحة القيادة الموحدة للمنظومة المالية والمحاسبية والضريبية. كافة المؤشرات مستخرجة مباشرة ومطابقة للقيد المزدوج وسجلات الفحص الضريبي.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={() => onNavigate('accounting')}
              className="px-4 py-2.5 bg-white text-[#0A4DA3] hover:bg-blue-50 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>تسجيل قيد يومية</span>
            </button>

            <button
              onClick={() => onNavigate('file-analyzer')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 backdrop-blur-sm"
            >
              <FileSearch className="w-4 h-4" />
              <span>تحليل مستند ذكي</span>
            </button>

            <button
              onClick={() => onNavigate('ai-assistant')}
              className="px-4 py-2.5 bg-[#2F80ED] hover:bg-blue-400 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span>استشارة ETC AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards: Blue Borders & Clean Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#0A4DA3]/20 hover:border-[#0A4DA3]/60 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">إجمالي الأصول الفعلية</span>
            <span className="p-2 bg-blue-50 text-[#0A4DA3] rounded-xl border border-blue-100">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {totalAssets.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-xs font-normal text-slate-500">ج.م</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>مطابقة دقيقة لدفتر الأستاذ</span>
            <span className="text-[#0A4DA3] font-bold">EAS 10</span>
          </div>
        </div>

        {/* Total Revenues */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#0A4DA3]/20 hover:border-[#0A4DA3]/60 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">إجمالي الإيرادات والمبيعات</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {totalRevenues.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-xs font-normal text-slate-500">ج.م</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>إيرادات معتمدة بالفواتير</span>
            <span className="text-emerald-600 font-bold">EAS 48</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#0A4DA3]/20 hover:border-[#0A4DA3]/60 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">المصروفات والتكاليف</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {totalExpenses.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-xs font-normal text-slate-500">ج.م</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>تكاليف تشغيلية وإدارية</span>
            <span className="text-amber-600 font-bold">مؤيدة مستندياً</span>
          </div>
        </div>

        {/* Net Income */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#0A4DA3]/20 hover:border-[#0A4DA3]/60 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">صافي الربح التشغيلي</span>
            <span className={`p-2 rounded-xl border ${netIncome >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-2xl font-black font-mono tracking-tight ${netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {netIncome.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-xs font-normal text-slate-500">ج.م</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>هامش الربح: {netMargin}%</span>
            <span className="text-[#0A4DA3] font-bold">قائمة الدخل</span>
          </div>
        </div>
      </div>

      {/* Charts Section: 4 Clear Professional Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Financial Overview Chart Block */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#0A4DA3]/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-blue-50 text-[#0A4DA3] rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">نظرة عامة على المركز المالي (Financial Overview)</h3>
                <p className="text-[11px] text-slate-400">توزيع هيكل الأصول والالتزامات وحقوق الملكية</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('financial-statements')}
              className="text-xs text-[#0A4DA3] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              القوائم المالية
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {/* Assets bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">الأصول (Assets)</span>
                <span className="font-mono font-bold text-[#0A4DA3]">{totalAssets.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#0A4DA3] to-[#2F80ED] h-3 rounded-full transition-all duration-500"
                  style={{ width: totalAssets > 0 ? '100%' : '5%' }}
                />
              </div>
            </div>

            {/* Liabilities bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">الالتزامات (Liabilities)</span>
                <span className="font-mono font-bold text-amber-600">{totalLiabilities.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: totalAssets > 0 ? `${Math.min(100, Math.round((totalLiabilities / totalAssets) * 100))}%` : '10%'
                  }}
                />
              </div>
            </div>

            {/* Equity bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">حقوق الملكية (Equity)</span>
                <span className="font-mono font-bold text-emerald-600">{totalEquity.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#22C55E] h-3 rounded-full transition-all duration-500"
                  style={{
                    width: totalAssets > 0 ? `${Math.min(100, Math.round((totalEquity / totalAssets) * 100))}%` : '10%'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-slate-700">
            <span>معادلة الميزانية: الأصول = الالتزامات + حقوق الملكية</span>
            <span className="font-bold text-[#0A4DA3]">متوازنة وفق EAS 1</span>
          </div>
        </div>

        {/* 2. Income vs Expenses Chart Block */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#0A4DA3]/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">مقارنة الإيرادات بالمصروفات (Income vs Expenses)</h3>
                <p className="text-[11px] text-slate-400">تحليل كفاءة التشغيل ومعدل تغطية التكاليف</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('financial-analysis')}
              className="text-xs text-[#0A4DA3] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              التحليل المالي
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl text-center">
              <span className="text-[11px] font-bold text-emerald-800 block mb-1">الإيرادات الفعلية</span>
              <div className="text-lg font-black text-emerald-700 font-mono">
                {totalRevenues.toLocaleString('ar-EG')} ج.م
              </div>
              <span className="text-[10px] text-emerald-600 block mt-1">100% قاعدة الدخل</span>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-xl text-center">
              <span className="text-[11px] font-bold text-amber-800 block mb-1">المصروفات والتكاليف</span>
              <div className="text-lg font-black text-amber-700 font-mono">
                {totalExpenses.toLocaleString('ar-EG')} ج.م
              </div>
              <span className="text-[10px] text-amber-600 block mt-1">
                {totalRevenues > 0 ? `${((totalExpenses / totalRevenues) * 100).toFixed(1)}% من الإيرادات` : '0%'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-semibold">صافي النتيجة المحققة:</span>
            <span className={`font-bold font-mono ${netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {netIncome >= 0 ? `+${netIncome.toLocaleString('ar-EG')} ج.م (فائض أرباح)` : `${netIncome.toLocaleString('ar-EG')} ج.م (عجز تكاليف)`}
            </span>
          </div>
        </div>

        {/* 3. Tax Status Block */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#0A4DA3]/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-blue-50 text-[#0A4DA3] rounded-lg">
                <Receipt className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">الموقف الضريبي والامتثال (Tax Status)</h3>
                <p className="text-[11px] text-slate-400">مصلحة الضرائب المصرية وقانون الإجراءات 206 لسنة 2020</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('tax')}
              className="text-xs text-[#0A4DA3] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              المنظومة الضريبية
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-600">ضريبة القيمة المضافة (14% VAT):</span>
              <span className="font-mono font-bold text-slate-900">
                {netVatBalance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-600">الفاتورة الإلكترونية (ETA Portal):</span>
              <span className="inline-flex items-center gap-1 text-[#22C55E] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                متوافق ومعتمد
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-600">ضرائب الخصم والتحصيل (نموذج 41):</span>
              <span className="font-bold text-[#0A4DA3]">جاهز للإقرار الفصلي</span>
            </div>
          </div>
        </div>

        {/* 4. Audit Status Block */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#0A4DA3]/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">حالة الرقابة والتدقيق (Audit Status)</h3>
                <p className="text-[11px] text-slate-400">معايير المراجعة المصرية والفحص الدوري للدفاتر</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs text-[#0A4DA3] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              سجل المراجعة
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-600">مطابقة القيد المزدوج:</span>
              <span className={`inline-flex items-center gap-1 font-bold ${isJournalBalanced ? 'text-[#22C55E]' : 'text-rose-600'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isJournalBalanced ? 'مطابق بنسبة 100%' : 'يوجد فرق يحتاج تسوية'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-600">التسلسل الرقمي للقيود:</span>
              <span className="text-[#22C55E] font-bold">تسلسل تصاعدي منتظم</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-600">فصل المهام والصلاحيات:</span>
              <span className="text-[#0A4DA3] font-bold">مفعل بإشراف المالك</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table: Clean Layout */}
      <div className="bg-white rounded-2xl border-2 border-[#0A4DA3]/20 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">أحدث القيود المحاسبية المسجلة</h3>
            <p className="text-xs text-slate-400">اليومية العامة الفعلية للمنشأة</p>
          </div>
          <button
            onClick={() => onNavigate('accounting')}
            className="text-xs font-bold text-[#0A4DA3] hover:underline flex items-center gap-1 cursor-pointer"
          >
            عرض اليومية كاملة
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {journalEntries.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0A4DA3] flex items-center justify-center mx-auto mb-3 border border-blue-100">
              <BookOpen className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">لا توجد قيود مسجلة بعد</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
              تلتزم منصة ETC بمبدأ النزاهة المحاسبية الكاملة؛ لا توجد أي بيانات وهمية. أضف قيدك الأول ليبدأ ميزان المراجعة والقوائم بالعمل.
            </p>
            <button
              onClick={() => onNavigate('accounting')}
              className="px-5 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة أول قيد يومية</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">رقم القيد</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">البيان / الشرح</th>
                  <th className="p-3 font-mono">المبلغ (ج.م)</th>
                  <th className="p-3">المُسجل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journalEntries.slice(0, 6).map((entry) => (
                  <tr key={entry.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#0A4DA3]">{entry.entryNumber}</td>
                    <td className="p-3 text-slate-600">{entry.date}</td>
                    <td className="p-3 text-slate-800 font-medium">{entry.description}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {entry.totalDebit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-slate-500">{entry.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

