import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { User, AuditWorkingPaper } from '../../types';
import {
  FileCheck2,
  PlusCircle,
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  X,
} from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface AuditModuleProps {
  currentUser: User;
}

export const AuditModule: React.FC<AuditModuleProps> = ({ currentUser }) => {
  const [auditPapers, setAuditPapers] = useState<AuditWorkingPaper[]>(StorageService.getAuditPapers());
  const [auditType, setAuditType] = useState<'internal' | 'external' | 'compliance' | 'programs'>('internal');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [refNo, setRefNo] = useState('');
  const [title, setTitle] = useState('');
  const [auditArea, setAuditArea] = useState('مراجعة النقدية والبنوك');
  const [findings, setFindings] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const refreshData = () => {
    setAuditPapers(StorageService.getAuditPapers());
  };

  const handleAddPaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !findings.trim()) return;

    StorageService.addAuditPaper({
      referenceNo: refNo.trim() || 'WP-' + (auditPapers.length + 1),
      title: title.trim(),
      auditArea,
      preparedBy: currentUser.fullName,
      date: new Date().toISOString().split('T')[0],
      status: 'In_Progress',
      findings: findings.trim(),
      recommendations: recommendations.trim(),
      riskLevel,
    });

    setIsModalOpen(false);
    setRefNo('');
    setTitle('');
    setFindings('');
    setRecommendations('');
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-[#0A4DA3] font-bold text-xl">
            <FileCheck2 className="w-6 h-6" />
            <h2>المراجعة والتدقيق والرقابة الداخلية</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            برامج المراجعة المعتمدة، أوراق العمل التوثيقية، تقييم مخاطر التدقيق وتقرير مراجع الحسابات
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إنشاء ورقة عمل مراجعة جديدة</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setAuditType('internal')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            auditType === 'internal'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          أوراق العمل والفحص ({auditPapers.length})
        </button>

        <button
          onClick={() => setAuditType('programs')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            auditType === 'programs'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          برامج المراجعة المعيارية
        </button>
      </div>

      {auditType === 'internal' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          {auditPapers.length === 0 ? (
            <EmptyState
              title="لا توجد بيانات كافية - لا توجد أوراق عمل مراجعة"
              message="يتم إصدار تقارير التدقيق من واقع الأدلة والقرائن الفعلية فقط بدون أي تقارير وهمية مسبقة. ابدأ بتوثيق أول ورقة عمل رقابية."
              actionText="إنشاء ورقة عمل الآن"
              onAction={() => setIsModalOpen(true)}
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {auditPapers.map((paper) => (
                <div key={paper.id} className="p-5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs bg-blue-50 text-[#0A4DA3] px-2.5 py-1 rounded border border-blue-200">
                        {paper.referenceNo}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{paper.title}</h4>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {paper.auditArea}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          paper.riskLevel === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : paper.riskLevel === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        مستوى الخطر: {paper.riskLevel === 'High' ? 'عالي' : paper.riskLevel === 'Medium' ? 'متوسط' : 'منخفض'}
                      </span>
                      <span className="text-slate-400 font-mono">{paper.date}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-800 block mb-1">الملاحظات والنتائج (Findings):</span>
                      <p className="text-slate-600 leading-relaxed">{paper.findings}</p>
                    </div>

                    <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                      <span className="font-bold text-emerald-900 block mb-1">التوصيات الرقابية (Recommendations):</span>
                      <p className="text-emerald-800 leading-relaxed">{paper.recommendations || 'لم تُسجل توصيات بعد'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {auditType === 'programs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">برنامج مراجعة النقدية والبنوك</h4>
            <p className="text-slate-500">
              مطابقة مذكرات تسوية البنوك، التحقق من حركة الصندوق، والجرد الفعلي للخزينة في نهاية الفترة.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">برنامج مراجعة العملاء والمبيعات</h4>
            <p className="text-slate-500">
              إرسال المصادقات الإيجابية والسلبية للعملاء، فحص قيود المبيعات وربطها بالفواتير الإلكترونية المعتمدة.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">برنامج جرد وتقييم المخزون</h4>
            <p className="text-slate-500">
              حضور الجرد الفعلي للمخزون، فحص تطبيق قاعدة (التكلفة أو صافي القيمة البيعية أيهما أقل)، وفحص مخصص الركود.
            </p>
          </div>
        </div>
      )}

      {/* Modal: Add Audit Paper */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-800">إنشاء ورقة عمل مراجعة جديدة</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPaper} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم المرجع *</label>
                  <input
                    type="text"
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    placeholder="WP-101"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مستوى الخطر *</label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="Low">منخفض</option>
                    <option value="Medium">متوسط</option>
                    <option value="High">مرتفع</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان ورقة العمل *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مطابقة رصيد البنك الأهلي المصري وعمل تسوية بنكية"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مجال المراجعة</label>
                <select
                  value={auditArea}
                  onChange={(e) => setAuditArea(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="مراجعة النقدية والبنوك">مراجعة النقدية والبنوك</option>
                  <option value="مراجعة العملاء والمبيعات">مراجعة العملاء والمبيعات</option>
                  <option value="مراجعة الموردين والمشتريات">مراجعة الموردين والمشتريات</option>
                  <option value="مراجعة المخزون والتكاليف">مراجعة المخزون والتكاليف</option>
                  <option value="مراجعة الأصول الثابتة والإهلاك">مراجعة الأصول الثابتة والإهلاك</option>
                  <option value="مراجعة الضرائب والالتزامات السيادية">مراجعة الضرائب والالتزامات السيادية</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الملاحظات والنتائج (Findings) *</label>
                <textarea
                  rows={3}
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="ما تم التحقق منه والملاحظات المكتشفة من واقع الفحص الفعلي..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التوصيات المقترحة</label>
                <textarea
                  rows={2}
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="التوصيات لمعالجة الملاحظة وتحسين الرقابة الداخلية..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  حفظ ورقة العمل
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
