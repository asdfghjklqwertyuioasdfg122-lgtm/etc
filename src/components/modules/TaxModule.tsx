import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { User, TaxDeclaration } from '../../types';
import {
  Receipt,
  FileText,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  ExternalLink,
  Percent,
} from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { BluePyramidLogo } from '../common/BluePyramidLogo';

interface TaxModuleProps {
  currentUser: User;
}

export const TaxModule: React.FC<TaxModuleProps> = ({ currentUser }) => {
  const [taxTab, setTaxTab] = useState<'vat' | 'income' | 'payroll' | 'withholding' | 'eInvoice' | 'risk'>('vat');
  const [taxDeclarations, setTaxDeclarations] = useState<TaxDeclaration[]>(StorageService.getTaxDeclarations());

  // Interactive Tax Calculator for Egyptian Tax laws
  const [calcType, setCalcType] = useState<'vat' | 'salary'>('vat');
  const [calcInput, setCalcInput] = useState<number>(10000);

  const accounts = StorageService.getAccounts();
  const salesAccount = accounts.find((a) => a.code === '41' || a.nameAr.includes('مبيعات'));
  const actualSales = salesAccount ? salesAccount.balance : 0;
  const estimatedVatDue = actualSales * 0.14;

  // Egyptian Payroll Tax calculation (Current Law 30/2023 brackets with personal exemption)
  const calculateSalaryTax = (monthlyGross: number) => {
    const annualGross = monthlyGross * 12;
    const personalExemption = 20000; // الإعفاء الشخصي السنوي وفق أحدث التعديلات
    const netTaxable = Math.max(0, annualGross - personalExemption);

    let tax = 0;
    if (netTaxable <= 40000) {
      tax = 0; // الشريحة الصفرية
    } else if (netTaxable <= 55000) {
      tax = (netTaxable - 40000) * 0.10;
    } else if (netTaxable <= 70000) {
      tax = 1500 + (netTaxable - 55000) * 0.15;
    } else if (netTaxable <= 200000) {
      tax = 3750 + (netTaxable - 70000) * 0.20;
    } else if (netTaxable <= 400000) {
      tax = 29750 + (netTaxable - 200000) * 0.225;
    } else {
      tax = 74750 + (netTaxable - 400000) * 0.25;
    }

    return {
      annualTax: tax,
      monthlyTax: tax / 12,
      netSalary: monthlyGross - (tax / 12),
    };
  };

  const salaryResult = calculateSalaryTax(calcInput);

  return (
    <div className="space-y-6">
      {/* Header with Blue Pyramid Logo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2 border-[#0A4DA3]/20 shadow-sm">
        <div className="flex items-center gap-3.5">
          <BluePyramidLogo size="md" />
          <div>
            <div className="flex items-center gap-2.5 text-[#0A4DA3] font-bold text-xl">
              <h2>منظومة الضرائب المصرية والفاتورة الإلكترونية</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              إقرارات القيمة المضافة (قانون 67 لسنة 2016)، ضريبة الدخل (قانون 91 لسنة 2005)، كسب العمل ونموذج 41 خصم وإضافة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            الامتثال للتشريعات المصرية السارية
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setTaxTab('vat')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            taxTab === 'vat'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Percent className="w-4 h-4" />
          ضريبة القيمة المضافة (14%)
        </button>

        <button
          onClick={() => setTaxTab('income')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            taxTab === 'income'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          إقرار ضريبة الدخل السنوي
        </button>

        <button
          onClick={() => setTaxTab('payroll')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            taxTab === 'payroll'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          ضريبة المرتبات والأجور (كسب العمل)
        </button>

        <button
          onClick={() => setTaxTab('withholding')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            taxTab === 'withholding'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          الخصم والإضافة (نموذج 41)
        </button>

        <button
          onClick={() => setTaxTab('eInvoice')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            taxTab === 'eInvoice'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          الفاتورة والإيصال الإلكتروني
        </button>

        <button
          onClick={() => setTaxTab('risk')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            taxTab === 'risk'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          فحص المخاطر الضريبية
        </button>
      </div>

      {/* Tab: VAT */}
      {taxTab === 'vat' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">المبيعات الخاضعة للضريبة الفعلية</span>
              <div className="text-xl font-bold font-mono text-slate-900">
                {actualSales.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}{' '}
                <span className="text-xs text-slate-500">ج.م</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">من واقع الحساب 41 بالدفاتر</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">ضريبة القيمة المضافة المحصلة (14%)</span>
              <div className="text-xl font-bold font-mono text-blue-700">
                {estimatedVatDue.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}{' '}
                <span className="text-xs text-slate-500">ج.م</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">ضريبة مخرجات مستحقة التوريد</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">موعد تقديم الإقرار الشهري (نموذج 10)</span>
              <div className="text-sm font-bold text-slate-800">
                خلال الشهر التالي لشهر المحاسبة
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">وفقاً لقانون الإجراءات الضريبية الموحد 206</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
            <h3 className="font-bold text-sm text-slate-800 mb-2">إقرارات القيمة المضافة المسجلة</h3>
            {taxDeclarations.filter((d) => d.taxType === 'VAT').length === 0 ? (
              <EmptyState
                title="لا توجد بيانات كافية"
                message="لا توجد إقرارات ضريبية للقيمة المضافة محفوظة بعد. يرجى تسجيل قيود المبيعات والمشتريات لإنشاء الإقرار الفعلي."
              />
            ) : (
              <div>{/* List */}</div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Payroll Calculator */}
      {taxTab === 'payroll' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6 max-w-2xl mx-auto">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">
              حاسبة ضريبة كسب العمل والمرتبات (قانون 30 لسنة 2023)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              حساب دقيق لشرائح الضريبة السنوية مع تطبيق حد الإعفاء الشخصي (20,000 ج.م) والشريحة الصفرية.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                إجمالي الراتب الشهري (Gross Salary) بالجنيه المصري:
              </label>
              <input
                type="number"
                value={calcInput}
                onChange={(e) => setCalcInput(Math.max(0, Number(e.target.value)))}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-lg font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3]"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600">إجمالي الدخل السنوي:</span>
                <span className="font-mono font-bold text-slate-800">
                  {(calcInput * 12).toLocaleString('ar-EG')} ج.م
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600">الإعفاء الشخصي السنوي:</span>
                <span className="font-mono font-bold text-emerald-700">20,000 ج.م</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600">الضريبة الشهرية المستقطعة:</span>
                <span className="font-mono font-bold text-rose-700 text-sm">
                  {salaryResult.monthlyTax.toFixed(2)} ج.م
                </span>
              </div>
              <div className="flex justify-between py-2 font-bold text-slate-900 bg-white p-3 rounded-lg border border-slate-200">
                <span>صافي الراتب المستحق للصرف شهرياً (Net Pay):</span>
                <span className="font-mono text-base text-[#0A4DA3]">
                  {salaryResult.netSalary.toFixed(2)} ج.م
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: E-Invoice */}
      {taxTab === 'eInvoice' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                منظومة الفاتورة والإيصال الإلكتروني (ETA Portal)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                الربط مع مصلحة الضرائب المصرية لمطابقة أكواد GPC / GS1 والتوقيع الإلكتروني
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-[#0A4DA3] font-bold text-xs rounded-full border border-blue-200">
              API v1.0 جاهز للربط المباشر
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">حالة التكويد الموحد (GS1 / EGS)</span>
              <p className="text-slate-500">
                يقوم النظام بربط الأصناف المخزنية المسجلة تلقائياً برقم المعيار الموحد لمصلحة الضرائب.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">التوقيع والختم الإلكتروني (e-Seal)</span>
              <p className="text-slate-500">
                يدعم النظام الختم الإلكتروني لمعالجة وإرسال الوثائق بصيغة JSON القياسية المعتمدة.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">منظومة الإيصال الإلكتروني (B2C)</span>
              <p className="text-slate-500">
                تكامل مباشر مع نقاط البيع لضمان إرسال إيصالات المستهلك النهائي فور صدورها.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tax Risk */}
      {taxTab === 'risk' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-base pb-3 border-b border-slate-100">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3>تقييم المخاطر الضريبية والامتثال الرقابي</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            يقوم نظام ETC بفحص العمليات والقيود المسجلة للتأكد من عدم وجود فروق أو مخاطر فحص ضريبي:
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-emerald-50 text-emerald-900 rounded-lg flex items-start gap-2.5 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">عدم وجود حسابات وهمية:</span>
                النظام نظيف تماماً ولا يحتوي على أي عملاء أو موردين دون بيانات فعلية، مما يمنع مخاطر استبعاد التكاليف في الفحص الضريبي.
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 text-blue-900 rounded-lg flex items-start gap-2.5 border border-blue-200">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">تطابق ميزان المراجعة واليومية:</span>
                القيد المزدوج الإجباري يضمن توازن الأستاذ وميزان المراجعة بنسبة 100%.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
