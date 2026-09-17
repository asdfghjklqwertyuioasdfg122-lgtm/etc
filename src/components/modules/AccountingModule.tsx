import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { User, Account, JournalEntry, JournalEntryLine, AccountType } from '../../types';
import {
  BookOpen,
  PlusCircle,
  FileText,
  Layers,
  Scale,
  Search,
  CheckCircle,
  AlertCircle,
  ArrowRightLeft,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface AccountingModuleProps {
  currentUser: User;
}

export const AccountingModule: React.FC<AccountingModuleProps> = ({ currentUser }) => {
  const [subTab, setSubTab] = useState<'chart' | 'entries' | 'ledger' | 'trialBalance'>('entries');
  const [accounts, setAccounts] = useState<Account[]>(StorageService.getAccounts());
  const [entries, setEntries] = useState<JournalEntry[]>(StorageService.getJournalEntries());

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLedgerAccountId, setSelectedLedgerAccountId] = useState<string>(accounts[0]?.id || '111');

  // New Journal Entry Modal
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryDescription, setEntryDescription] = useState('');
  const [entryReference, setEntryReference] = useState('');
  const [entryLines, setEntryLines] = useState<
    Array<{
      accountId: string;
      accountCode: string;
      accountName: string;
      debit: number;
      credit: number;
      notes: string;
    }>
  >([
    { accountId: '111', accountCode: '111', accountName: 'النقدية بالصندوق والبنوك', debit: 0, credit: 0, notes: '' },
    { accountId: '41', accountCode: '41', accountName: 'إيرادات المبيعات والخدمات', debit: 0, credit: 0, notes: '' },
  ]);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Account Modal
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [accCode, setAccCode] = useState('');
  const [accNameAr, setAccNameAr] = useState('');
  const [accType, setAccType] = useState<AccountType>('Asset');

  const refreshData = () => {
    setAccounts(StorageService.getAccounts());
    setEntries(StorageService.getJournalEntries());
  };

  const totalDebit = entryLines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = entryLines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;

  const handleAddLine = () => {
    const defaultAcc = accounts[0];
    setEntryLines([
      ...entryLines,
      {
        accountId: defaultAcc?.id || '111',
        accountCode: defaultAcc?.code || '111',
        accountName: defaultAcc?.nameAr || 'النقدية بالصندوق والبنوك',
        debit: 0,
        credit: 0,
        notes: '',
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (entryLines.length <= 2) {
      alert('يجب أن يحتوي القيد المحاسبي على طرفين على الأقل.');
      return;
    }
    setEntryLines(entryLines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: string, value: any) => {
    const updated = [...entryLines];
    if (field === 'accountId') {
      const acc = accounts.find((a) => a.id === value);
      if (acc) {
        updated[idx].accountId = acc.id;
        updated[idx].accountCode = acc.code;
        updated[idx].accountName = acc.nameAr;
      }
    } else {
      (updated[idx] as any)[field] = value;
    }
    setEntryLines(updated);
  };

  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setEntryError(null);

    if (!isBalanced) {
      setEntryError('القيد غير متوازن! يجب أن يتساوى إجمالي المدين مع إجمالي الدائن.');
      return;
    }
    if (!entryDescription.trim()) {
      setEntryError('يرجى كتابة شرح أو بيان القيد.');
      return;
    }

    const nextNumber = 'JE-' + String(entries.length + 1).padStart(4, '0');
    const linesToSave: JournalEntryLine[] = entryLines.map((l, i) => ({
      id: 'jel_' + Date.now() + '_' + i,
      accountId: l.accountId,
      accountCode: l.accountCode,
      accountName: l.accountName,
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
      notes: l.notes,
    }));

    const result = StorageService.addJournalEntry({
      entryNumber: nextNumber,
      date: entryDate,
      reference: entryReference,
      description: entryDescription,
      lines: linesToSave,
      totalDebit,
      totalCredit,
      isPosted: true,
      createdBy: currentUser.fullName,
    });

    if (result.success) {
      setIsNewEntryOpen(false);
      setEntryDescription('');
      setEntryReference('');
      setEntryLines([
        { accountId: '111', accountCode: '111', accountName: 'النقدية بالصندوق والبنوك', debit: 0, credit: 0, notes: '' },
        { accountId: '41', accountCode: '41', accountName: 'إيرادات المبيعات والخدمات', debit: 0, credit: 0, notes: '' },
      ]);
      setSuccessMsg(`تم ترحيل القيد المحاسبي (${nextNumber}) بنجاح وتحديث الأرصدة`);
      setTimeout(() => setSuccessMsg(null), 4000);
      refreshData();
    } else {
      setEntryError(result.error || 'فشل حفظ القيد');
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accCode.trim() || !accNameAr.trim()) return;

    StorageService.addAccount({
      code: accCode.trim(),
      nameAr: accNameAr.trim(),
      nameEn: accNameAr.trim(),
      type: accType,
      level: 3,
      isActive: true,
    });

    setIsNewAccountOpen(false);
    setAccCode('');
    setAccNameAr('');
    refreshData();
  };

  // General Ledger calculations
  const selectedLedgerAccount = accounts.find((a) => a.id === selectedLedgerAccountId);
  const ledgerMovements: Array<{
    date: string;
    entryNumber: string;
    description: string;
    debit: number;
    credit: number;
    balanceAfter: number;
  }> = [];

  let currentRunBalance = 0;
  entries
    .slice()
    .reverse()
    .forEach((entry) => {
      entry.lines.forEach((line) => {
        if (line.accountId === selectedLedgerAccountId || line.accountCode === selectedLedgerAccount?.code) {
          if (selectedLedgerAccount?.type === 'Asset' || selectedLedgerAccount?.type === 'Expense') {
            currentRunBalance += line.debit - line.credit;
          } else {
            currentRunBalance += line.credit - line.debit;
          }
          ledgerMovements.push({
            date: entry.date,
            entryNumber: entry.entryNumber,
            description: entry.description + (line.notes ? ` (${line.notes})` : ''),
            debit: line.debit,
            credit: line.credit,
            balanceAfter: currentRunBalance,
          });
        }
      });
    });

  // Trial Balance totals
  const trialDebitTotal = accounts.reduce((sum, a) => sum + (a.balance > 0 && (a.type === 'Asset' || a.type === 'Expense') ? a.balance : 0), 0);
  const trialCreditTotal = accounts.reduce((sum, a) => sum + (a.balance > 0 && (a.type === 'Liability' || a.type === 'Equity' || a.type === 'Revenue') ? a.balance : 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-[#0A4DA3] font-bold text-xl">
            <BookOpen className="w-6 h-6" />
            <h2>النظام المحاسبي والقيود العامة</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            دليل الحسابات المصري، اليومية العامة المزدوجة، الأستاذ العام، وميزان المراجعة بالمجاميع والأرصدة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewEntryOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل قيد يومية جديد</span>
          </button>
          <button
            onClick={() => setIsNewAccountOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حساب</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-sm font-semibold">
        <button
          onClick={() => setSubTab('entries')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            subTab === 'entries'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          دفتر اليومية العامة ({entries.length})
        </button>

        <button
          onClick={() => setSubTab('chart')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            subTab === 'chart'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          دليل الحسابات (شجرة الحسابات) ({accounts.length})
        </button>

        <button
          onClick={() => setSubTab('ledger')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            subTab === 'ledger'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          دفتر الأستاذ العام
        </button>

        <button
          onClick={() => setSubTab('trialBalance')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            subTab === 'trialBalance'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          ميزان المراجعة
        </button>
      </div>

      {/* Tab: Journal Entries */}
      {subTab === 'entries' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          {entries.length === 0 ? (
            <EmptyState
              title="لا توجد بيانات كافية - دفتر اليومية فارغ"
              message="لا توجد قيود يومية مسجلة بعد. النظام يبدأ من الصفر تماماً ولا يدرج أي قيود افتراضية أو وهمية. يمكنك الضغط على الزر أدناه لتسجيل أول قيد محاسبي معتمد."
              actionText="تسجيل قيد يومية الآن"
              onAction={() => setIsNewEntryOpen(true)}
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm bg-blue-50 text-[#0A4DA3] px-2.5 py-1 rounded-md border border-blue-200">
                        {entry.entryNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{entry.date}</span>
                      {entry.reference && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          مرجع: {entry.reference}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      المسجل: <strong className="text-slate-800">{entry.createdBy}</strong> • الإجمالي:{' '}
                      <strong className="text-slate-900 font-mono">
                        {entry.totalDebit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 mb-3 bg-slate-50 p-2 rounded">
                    البيان: {entry.description}
                  </p>

                  <div className="overflow-x-auto rounded border border-slate-200/70">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2">رقم الحساب</th>
                          <th className="p-2">اسم الحساب</th>
                          <th className="p-2 text-left font-mono">مدين (ج.م)</th>
                          <th className="p-2 text-left font-mono">دائن (ج.م)</th>
                          <th className="p-2">ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {entry.lines.map((line) => (
                          <tr key={line.id}>
                            <td className="p-2 font-mono text-slate-600">{line.accountCode}</td>
                            <td className="p-2 font-bold text-slate-800">{line.accountName}</td>
                            <td className="p-2 text-left font-mono font-semibold text-blue-900">
                              {line.debit > 0 ? line.debit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '—'}
                            </td>
                            <td className="p-2 text-left font-mono font-semibold text-emerald-900">
                              {line.credit > 0 ? line.credit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '—'}
                            </td>
                            <td className="p-2 text-slate-400">{line.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Chart of Accounts */}
      {subTab === 'chart' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="بحث في شجرة الحسابات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4DA3]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
            <span className="text-xs text-slate-500">
              الدليل المحاسبي المعتمد وفق معايير المحاسبة المصرية
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">كود الحساب</th>
                  <th className="p-3">اسم الحساب بالعربية</th>
                  <th className="p-3">اسم الحساب بالإنجليزية</th>
                  <th className="p-3">النوع</th>
                  <th className="p-3 text-left font-mono">الرصيد الفعلي الحالي (ج.م)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts
                  .filter(
                    (a) =>
                      a.code.includes(searchTerm) ||
                      a.nameAr.includes(searchTerm) ||
                      a.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-slate-800">{acc.code}</td>
                      <td className="p-3 font-bold text-slate-900">{acc.nameAr}</td>
                      <td className="p-3 text-slate-500 font-sans">{acc.nameEn}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {acc.type === 'Asset'
                            ? 'أصول'
                            : acc.type === 'Liability'
                            ? 'التزامات'
                            : acc.type === 'Equity'
                            ? 'حقوق ملكية'
                            : acc.type === 'Revenue'
                            ? 'إيرادات'
                            : 'مصروفات'}
                        </span>
                      </td>
                      <td className="p-3 text-left font-mono font-bold text-slate-900">
                        {acc.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: General Ledger */}
      {subTab === 'ledger' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-800">دفتر الأستاذ العام التفاعلي</h3>
              <p className="text-xs text-slate-400">اختر الحساب لعرض كشف الحركة الفعلي والرصيد التراكمي</p>
            </div>
            <div className="w-full sm:w-72">
              <select
                value={selectedLedgerAccountId}
                onChange={(e) => setSelectedLedgerAccountId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0A4DA3]"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} - {a.nameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {ledgerMovements.length === 0 ? (
            <EmptyState
              title="لا توجد بيانات كافية"
              message={`لا توجد أي حركات مرحلة على الحساب (${selectedLedgerAccount?.nameAr}) حتى الآن. الحركات ستظهر فور تسجيل قيود اليومية المتضمنة هذا الحساب.`}
            />
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">التاريخ</th>
                    <th className="p-2.5">رقم القيد</th>
                    <th className="p-2.5">البيان</th>
                    <th className="p-2.5 text-left font-mono">مدين</th>
                    <th className="p-2.5 text-left font-mono">دائن</th>
                    <th className="p-2.5 text-left font-mono">الرصيد التراكمي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerMovements.map((mov, i) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="p-2.5 text-slate-500 font-mono">{mov.date}</td>
                      <td className="p-2.5 font-mono font-bold text-blue-700">{mov.entryNumber}</td>
                      <td className="p-2.5 text-slate-800">{mov.description}</td>
                      <td className="p-2.5 text-left font-mono text-slate-700">
                        {mov.debit > 0 ? mov.debit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '—'}
                      </td>
                      <td className="p-2.5 text-left font-mono text-slate-700">
                        {mov.credit > 0 ? mov.credit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '—'}
                      </td>
                      <td className="p-2.5 text-left font-mono font-bold text-slate-900 bg-slate-50/60">
                        {mov.balanceAfter.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Trial Balance */}
      {subTab === 'trialBalance' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-800">ميزان المراجعة بالأرصدة الفعلية</h3>
              <p className="text-xs text-slate-400">
                ميزان التحقق المحاسبي الشامل لجميع حسابات الأستاذ
              </p>
            </div>
            <div className="flex items-center gap-2">
              {Math.abs(trialDebitTotal - trialCreditTotal) < 0.01 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  الميزان متوازن محاسبياً
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  يوجد فرق في التوازن
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">كود الحساب</th>
                  <th className="p-3">اسم الحساب</th>
                  <th className="p-3">طبيعة الحساب</th>
                  <th className="p-3 text-left font-mono">رصيد مدين (ج.م)</th>
                  <th className="p-3 text-left font-mono">رصيد دائن (ج.م)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => {
                  const isDebitNature = acc.type === 'Asset' || acc.type === 'Expense';
                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-slate-700">{acc.code}</td>
                      <td className="p-3 font-bold text-slate-900">{acc.nameAr}</td>
                      <td className="p-3 text-slate-500 text-[11px]">{isDebitNature ? 'مدين بطبيعته' : 'دائن بطبيعته'}</td>
                      <td className="p-3 text-left font-mono">
                        {isDebitNature && acc.balance > 0
                          ? acc.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })
                          : '0.00'}
                      </td>
                      <td className="p-3 text-left font-mono">
                        {!isDebitNature && acc.balance > 0
                          ? acc.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })
                          : '0.00'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={3} className="p-3 text-slate-900 font-black">
                    الإجمالي العام لميزان المراجعة
                  </td>
                  <td className="p-3 text-left font-mono text-[#0A4DA3]">
                    {trialDebitTotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                  </td>
                  <td className="p-3 text-left font-mono text-[#0A4DA3]">
                    {trialCreditTotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Journal Entry */}
      {isNewEntryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-[#0A4DA3] font-bold text-base">
                <PlusCircle className="w-5 h-5" />
                <h3>تسجيل قيد يومية عامة جديد</h3>
              </div>
              <button
                onClick={() => setIsNewEntryOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {entryError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{entryError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ القيد *</label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم المرجع / الفاتورة</label>
                  <input
                    type="text"
                    value={entryReference}
                    onChange={(e) => setEntryReference(e.target.value)}
                    placeholder="مثال: فاتورة رقم 104"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">البيان / الشرح *</label>
                <input
                  type="text"
                  value={entryDescription}
                  onChange={(e) => setEntryDescription(e.target.value)}
                  placeholder="وصف القيد المحاسبي والغرض منه"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              {/* Entry Lines */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">أطراف القيد (مدين / دائن) *</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs font-bold text-[#0A4DA3] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة طرف
                  </button>
                </div>

                <div className="space-y-2">
                  {entryLines.map((line, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col md:flex-row items-center gap-2"
                    >
                      <div className="w-full md:w-1/3">
                        <select
                          value={line.accountId}
                          onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-semibold focus:outline-none"
                        >
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.code} - {a.nameAr}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full md:w-1/4">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="مدين"
                          value={line.debit || ''}
                          onChange={(e) => handleLineChange(idx, 'debit', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-mono text-left"
                        />
                      </div>

                      <div className="w-full md:w-1/4">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="دائن"
                          value={line.credit || ''}
                          onChange={(e) => handleLineChange(idx, 'credit', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs font-mono text-left"
                        />
                      </div>

                      <div className="w-full md:w-1/4">
                        <input
                          type="text"
                          placeholder="ملاحظات"
                          value={line.notes}
                          onChange={(e) => handleLineChange(idx, 'notes', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-md text-xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                        title="حذف الطرف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Balance verification */}
              <div className="p-3 bg-slate-100 rounded-lg flex items-center justify-between text-xs font-bold">
                <div>
                  إجمالي المدين:{' '}
                  <span className="font-mono text-blue-800">
                    {totalDebit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                  </span>
                </div>
                <div>
                  إجمالي الدائن:{' '}
                  <span className="font-mono text-emerald-800">
                    {totalCredit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                  </span>
                </div>
                <div>
                  {isBalanced ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> متوازن
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> غير متوازن (فرق: {Math.abs(totalDebit - totalCredit).toFixed(2)})
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className="flex-1 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  ترحيل وحفظ القيد
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewEntryOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Account */}
      {isNewAccountOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-800">إضافة حساب جديد إلى شجرة الحسابات</h3>
              <button
                onClick={() => setIsNewAccountOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كود الحساب *</label>
                <input
                  type="text"
                  value={accCode}
                  onChange={(e) => setAccCode(e.target.value)}
                  placeholder="مثال: 1114"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الحساب (بالعربية) *</label>
                <input
                  type="text"
                  value={accNameAr}
                  onChange={(e) => setAccNameAr(e.target.value)}
                  placeholder="مثال: البنك الأهلي المصري - حساب جاري"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تصنيف الحساب *</label>
                <select
                  value={accType}
                  onChange={(e) => setAccType(e.target.value as AccountType)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="Asset">أصول (Assets)</option>
                  <option value="Liability">التزامات (Liabilities)</option>
                  <option value="Equity">حقوق ملكية (Equity)</option>
                  <option value="Revenue">إيرادات (Revenues)</option>
                  <option value="Expense">مصروفات (Expenses)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  إضافة الحساب
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewAccountOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
