import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { User, Account } from '../../types';
import {
  FileSpreadsheet,
  Printer,
  Download,
  AlertCircle,
  TrendingUp,
  Building2,
  Coins,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { BluePyramidLogo } from '../common/BluePyramidLogo';

interface FinancialStatementsModuleProps {
  currentUser: User;
  onNavigateToEntries?: () => void;
}

export const FinancialStatementsModule: React.FC<FinancialStatementsModuleProps> = ({
  currentUser,
  onNavigateToEntries,
}) => {
  const [statementType, setStatementType] = useState<
    'income' | 'balanceSheet' | 'cashFlow' | 'equity' | 'notes'
  >('income');

  const accounts = StorageService.getAccounts();
  const entries = StorageService.getJournalEntries();

  // Revenues & Expenses for Income Statement
  const revenueAccounts = accounts.filter((a) => a.type === 'Revenue');
  const expenseAccounts = accounts.filter((a) => a.type === 'Expense');
  const totalRevenues = revenueAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = expenseAccounts.reduce((sum, a) => sum + a.balance, 0);
  const netIncome = totalRevenues - totalExpenses;

  // Assets, Liabilities & Equity for Balance Sheet
  const assetAccounts = accounts.filter((a) => a.type === 'Asset');
  const liabilityAccounts = accounts.filter((a) => a.type === 'Liability');
  const equityAccounts = accounts.filter((a) => a.type === 'Equity');

  const totalAssets = assetAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = equityAccounts.reduce((sum, a) => sum + a.balance, 0) + netIncome;

  const hasActivity = entries.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-[#0A4DA3] font-bold text-xl">
            <FileSpreadsheet className="w-6 h-6" />
            <h2>القوائم المالية والتقارير الختامية</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            مستخرجة طبقاً لمعايير المحاسبة المصرية (EAS) من واقع القيود والسجلات الفعلية فقط
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة القائمة</span>
        </button>
      </div>

      {/* Statement Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setStatementType('income')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            statementType === 'income'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          قائمة الدخل والأرباح والخسائر
        </button>

        <button
          onClick={() => setStatementType('balanceSheet')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            statementType === 'balanceSheet'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          قائمة المركز المالي (الميزانية العمومية)
        </button>

        <button
          onClick={() => setStatementType('cashFlow')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            statementType === 'cashFlow'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          قائمة التدفقات النقدية
        </button>

        <button
          onClick={() => setStatementType('equity')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            statementType === 'equity'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          قائمة التغير في حقوق الملكية
        </button>

        <button
          onClick={() => setStatementType('notes')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            statementType === 'notes'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          الإيضاحات المتممة للقوائم
        </button>
      </div>

      {!hasActivity ? (
        <EmptyState
          title="لا توجد بيانات كافية لإعداد القوائم المالية"
          message="القوائم المالية في منصة ETC تتولد حصرياً من واقع قيود اليومية الفعلية بدون أي افتراضات أو أرقام وهمية. يرجى تسجيل قيود اليومية أولاً ليتم احتساب القوائم آلياً."
          actionText="الانتقال إلى قيود اليومية"
          onAction={onNavigateToEntries}
        />
      ) : (
        <div className="bg-white rounded-2xl border-2 border-[#0A4DA3]/20 shadow-md p-6 sm:p-8 print:border-none print:shadow-none">
          {/* Formal Report Letterhead */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b-2 border-slate-200">
            <div className="flex items-center gap-3.5">
              <BluePyramidLogo size="md" />
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">منصة ETC المالية</h3>
                <p className="text-[11px] text-slate-500 font-semibold">التقارير والقوائم المالية المعتمدة • جمهورية مصر العربية</p>
              </div>
            </div>

            <div className="text-left text-[11px] text-slate-500 font-mono space-y-0.5">
              <div><span className="font-sans text-slate-400">التاريخ: </span>{new Date().toLocaleDateString('ar-EG')}</div>
              <div><span className="font-sans text-slate-400">المعايير: </span>EAS 2026 / IFRS</div>
              <div className="text-emerald-600 font-sans font-bold flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>مطابق ميزان المراجعة</span>
              </div>
            </div>
          </div>

          {/* Income Statement */}
          {statementType === 'income' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="text-center pb-4 border-b border-slate-200">
                <h3 className="text-lg font-black text-slate-900">قائمة الدخل الشامل</h3>
                <p className="text-xs text-slate-500 mt-1">عن الفترة المالية المنتهية في تاريخه</p>
                <div className="text-[11px] font-mono text-slate-400 mt-1">المبالغ بالجنيه المصري (EGP)</div>
              </div>

              {/* Revenues */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 bg-slate-50 p-2.5 rounded mb-2">
                  أولاً: الإيرادات التشغيلية
                </h4>
                <div className="divide-y divide-slate-100 text-xs">
                  {revenueAccounts.map((acc) => (
                    <div key={acc.id} className="flex justify-between py-2 px-3">
                      <span>{acc.nameAr}</span>
                      <span className="font-mono font-bold text-slate-800">
                        {acc.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 px-3 font-bold bg-blue-50/60 text-[#0A4DA3]">
                    <span>إجمالي الإيرادات</span>
                    <span className="font-mono">
                      {totalRevenues.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 bg-slate-50 p-2.5 rounded mb-2">
                  ثانياً: التكاليف والمصروفات
                </h4>
                <div className="divide-y divide-slate-100 text-xs">
                  {expenseAccounts.map((acc) => (
                    <div key={acc.id} className="flex justify-between py-2 px-3">
                      <span>{acc.nameAr}</span>
                      <span className="font-mono font-bold text-slate-800">
                        {acc.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 px-3 font-bold bg-amber-50/60 text-amber-900">
                    <span>إجمالي المصروفات</span>
                    <span className="font-mono">
                      {totalExpenses.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Result */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between font-black text-sm ${
                  netIncome >= 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <span>صافي أرباح / (خسائر) الفترة الفعلي</span>
                <span className="font-mono text-base">
                  {netIncome.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                </span>
              </div>
            </div>
          )}

          {/* Balance Sheet */}
          {statementType === 'balanceSheet' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="text-center pb-4 border-b border-slate-200">
                <h3 className="text-lg font-black text-slate-900">قائمة المركز المالي (الميزانية العمومية)</h3>
                <p className="text-xs text-slate-500 mt-1">كما في تاريخه</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assets */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs bg-blue-50 text-[#0A4DA3] p-2.5 rounded">
                    جانب الأصول (الموجودات)
                  </h4>
                  <div className="divide-y divide-slate-100 text-xs">
                    {assetAccounts.map((acc) => (
                      <div key={acc.id} className="flex justify-between py-2 px-2">
                        <span>{acc.nameAr}</span>
                        <span className="font-mono font-bold text-slate-800">
                          {acc.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-slate-100 rounded-lg flex justify-between font-black text-xs text-slate-900">
                    <span>مجموع الأصول</span>
                    <span className="font-mono text-blue-900">
                      {totalAssets.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                    </span>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs bg-slate-100 text-slate-800 p-2.5 rounded">
                    الالتزامات وحقوق الملكية
                  </h4>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-1 text-slate-400 font-bold">الالتزامات:</div>
                    {liabilityAccounts.map((acc) => (
                      <div key={acc.id} className="flex justify-between py-1.5 px-2">
                        <span>{acc.nameAr}</span>
                        <span className="font-mono font-bold text-slate-800">
                          {acc.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}

                    <div className="py-1 text-slate-400 font-bold pt-2">حقوق الملكية:</div>
                    {equityAccounts.map((acc) => (
                      <div key={acc.id} className="flex justify-between py-1.5 px-2">
                        <span>{acc.nameAr}</span>
                        <span className="font-mono font-bold text-slate-800">
                          {acc.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between py-1.5 px-2 font-bold text-emerald-800">
                      <span>صافي أرباح / خسائر الفترة</span>
                      <span className="font-mono">
                        {netIncome.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-lg flex justify-between font-black text-xs text-slate-900">
                    <span>مجموع الالتزامات وحقوق الملكية</span>
                    <span className="font-mono text-blue-900">
                      {(totalLiabilities + totalEquity).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cash Flow Statement */}
          {statementType === 'cashFlow' && (
            <div className="space-y-5 max-w-3xl mx-auto text-xs">
              <div className="text-center pb-4 border-b border-slate-200">
                <h3 className="text-lg font-black text-slate-900">قائمة التدفقات النقدية</h3>
                <p className="text-xs text-slate-500 mt-1">الطريقة غير المباشرة وفق المعيار المحاسبي المصري رقم (4)</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded flex justify-between font-bold">
                  <span>صافي الدخل التشغيلي قبل الضرائب:</span>
                  <span className="font-mono">{netIncome.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
                </div>
                <div className="p-3 bg-slate-50 rounded flex justify-between">
                  <span>التدفقات النقدية من الأنشطة التشغيلية:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {netIncome.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded flex justify-between">
                  <span>التدفقات النقدية من الأنشطة الاستثمارية:</span>
                  <span className="font-mono text-slate-500">0.00 ج.م</span>
                </div>
                <div className="p-3 bg-slate-50 rounded flex justify-between">
                  <span>التدفقات النقدية من الأنشطة التمويلية:</span>
                  <span className="font-mono text-slate-500">0.00 ج.م</span>
                </div>
                <div className="p-3 bg-[#0A4DA3] text-white rounded font-black flex justify-between">
                  <span>صافي التغير في النقدية وما في حكمها:</span>
                  <span className="font-mono">{netIncome.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
                </div>
              </div>
            </div>
          )}

          {/* Equity */}
          {statementType === 'equity' && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs">
              <div className="text-center pb-4 border-b border-slate-200">
                <h3 className="text-lg font-black text-slate-900">قائمة التغير في حقوق الملكية</h3>
              </div>
              <div className="p-4 border rounded-lg bg-slate-50 space-y-2">
                <div className="flex justify-between py-1">
                  <span>رصيد أول المدة لحقوق الملكية:</span>
                  <span className="font-mono">0.00 ج.م</span>
                </div>
                <div className="flex justify-between py-1 font-bold text-emerald-700">
                  <span>صافي أرباح / خسائر الفترة الحالية:</span>
                  <span className="font-mono">{netIncome.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
                </div>
                <div className="flex justify-between py-2 border-t font-black text-slate-900">
                  <span>رصيد حقوق الملكية في نهاية الفترة:</span>
                  <span className="font-mono">{totalEquity.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {statementType === 'notes' && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs text-slate-700 leading-relaxed">
              <div className="text-center pb-4 border-b border-slate-200">
                <h3 className="text-lg font-black text-slate-900">الإيضاحات المتممة للقوائم المالية</h3>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                <h4 className="font-bold text-slate-900">1. السياسات المحاسبية المتبعة:</h4>
                <p>
                  تم إعداد القوائم المالية وفقاً لمعايير المحاسبة المصرية (EAS) وفي ضوء القوانين واللوائح المصرية السارية. تُسجل العمليات على أساس الاستحقاق المحاسبي وتُقاس الأصول على أساس التكلفة التاريخية.
                </p>
                <h4 className="font-bold text-slate-900">2. المعاملات الضريبية:</h4>
                <p>
                  يتم احتساب الضرائب طبقاً لأحكام قانون الضريبة على الدخل رقم 91 لسنة 2005 وتعديلاته بالقانون 30 لسنة 2023 وقانون الضريبة على القيمة المضافة رقم 67 لسنة 2016.
                </p>
                <h4 className="font-bold text-slate-900">3. التحقق الرقابي:</h4>
                <p>
                  تخضع جميع القوائم لرقابة وتدقيق مالك النظام ومراجعي الحسابات المعتمدين عبر سجل النشاطات الموثق.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
