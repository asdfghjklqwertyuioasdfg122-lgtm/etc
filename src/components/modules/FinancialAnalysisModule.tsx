import React from 'react';
import { StorageService } from '../../services/storage';
import { User } from '../../types';
import {
  TrendingUp,
  Percent,
  Scale,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface FinancialAnalysisModuleProps {
  currentUser: User;
  onNavigateToEntries?: () => void;
}

export const FinancialAnalysisModule: React.FC<FinancialAnalysisModuleProps> = ({
  currentUser,
  onNavigateToEntries,
}) => {
  const accounts = StorageService.getAccounts();
  const entries = StorageService.getJournalEntries();

  // Compute metrics from actual accounts
  const totalAssets = accounts.filter((a) => a.type === 'Asset').reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts.filter((a) => a.type === 'Liability').reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = accounts.filter((a) => a.type === 'Equity').reduce((sum, a) => sum + a.balance, 0);
  const totalRevenues = accounts.filter((a) => a.type === 'Revenue').reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = accounts.filter((a) => a.type === 'Expense').reduce((sum, a) => sum + a.balance, 0);
  const netIncome = totalRevenues - totalExpenses;

  // Cash & Bank
  const cashAccounts = accounts.filter((a) => a.code.startsWith('111') || a.nameAr.includes('نقدية'));
  const cashBalance = cashAccounts.reduce((sum, a) => sum + a.balance, 0);

  const hasData = entries.length > 0 && totalAssets > 0;

  // Financial Ratios
  const currentRatio = totalLiabilities > 0 ? (totalAssets / totalLiabilities).toFixed(2) : 'غير متاح (لا توجد التزامات)';
  const netProfitMargin = totalRevenues > 0 ? ((netIncome / totalRevenues) * 100).toFixed(2) + '%' : 'غير متاح (لا توجد إيرادات)';
  const returnOnAssets = totalAssets > 0 ? ((netIncome / totalAssets) * 100).toFixed(2) + '%' : 'غير متاح';
  const debtToEquity = totalEquity > 0 ? ((totalLiabilities / totalEquity) * 100).toFixed(2) + '%' : 'غير متاح';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-[#0A4DA3] font-bold text-xl">
            <TrendingUp className="w-6 h-6" />
            <h2>التحليل المالي والمؤشرات التشغيلية الفعلية</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            نسب السيولة، الربحية، الملاءة المالية وكفاءة استخدام الأصول من واقع القوائم المالية المعتمدة
          </p>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          title="لا توجد بيانات كافية لاحتساب المؤشرات المالية"
          message="التحليل المالي في ETC يعتمد بدقة 100% على قيود اليومية وقوائم المركز المالي والدخل الفعلية. لا نستخدم أي أرقام افتراضية أو عشوائية."
          actionText="تسجيل قيود يومية لإنشاء التحليل"
          onAction={onNavigateToEntries}
        />
      ) : (
        <div className="space-y-6">
          {/* Ratio Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">نسبة التداول (السيولة العامة)</span>
              <div className="text-xl font-bold font-mono text-[#0A4DA3]">{currentRatio}</div>
              <p className="text-[11px] text-slate-400 mt-2">الأصول المتداولة ÷ الالتزامات المتداولة</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">هامش صافي الربح الفعلي</span>
              <div className="text-xl font-bold font-mono text-emerald-600">{netProfitMargin}</div>
              <p className="text-[11px] text-slate-400 mt-2">صافي الربح ÷ إجمالي الإيرادات</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">العائد على الأصول (ROA)</span>
              <div className="text-xl font-bold font-mono text-blue-700">{returnOnAssets}</div>
              <p className="text-[11px] text-slate-400 mt-2">صافي الربح ÷ إجمالي الأصول</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">نسبة المديونية لحقوق الملكية</span>
              <div className="text-xl font-bold font-mono text-amber-600">{debtToEquity}</div>
              <p className="text-[11px] text-slate-400 mt-2">إجمالي الالتزامات ÷ حقوق الملكية</p>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800">بيان الأرصدة المعتمدة في التحليل:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block font-sans">الأصول:</span>
                <strong className="text-slate-900">{totalAssets.toLocaleString('ar-EG')} ج.م</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block font-sans">الالتزامات:</span>
                <strong className="text-slate-900">{totalLiabilities.toLocaleString('ar-EG')} ج.م</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block font-sans">حقوق الملكية:</span>
                <strong className="text-slate-900">{totalEquity.toLocaleString('ar-EG')} ج.م</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block font-sans">النقدية وما في حكمها:</span>
                <strong className="text-slate-900">{cashBalance.toLocaleString('ar-EG')} ج.م</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
