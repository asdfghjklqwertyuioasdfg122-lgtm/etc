import React, { useState } from 'react';
import { User } from '../../types';
import {
  GraduationCap,
  BookOpen,
  Search,
  Scale,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AcademyModuleProps {
  currentUser: User;
}

interface StandardItem {
  id: string;
  code: string;
  title: string;
  category: 'Accounting' | 'Tax';
  summary: string;
  keyArticles: string[];
}

export const AcademyModule: React.FC<AcademyModuleProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'standards' | 'taxes' | 'academy'>('standards');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('eas_1');

  const standards: StandardItem[] = [
    {
      id: 'eas_1',
      code: 'معيار رقم (1)',
      title: 'عرض القوائم المالية',
      category: 'Accounting',
      summary: 'يحدد أساسيات عرض القوائم المالية ذات الغرض العام لضمان قابلية المقارنة مع الفترات السابقة وقوائم المنشآت الأخرى.',
      keyArticles: [
        'الفرض المحاسبي لاستمرارية المنشأة كأساس لإعداد القوائم.',
        'أساس الاستحقاق المحاسبي لجميع العمليات باستثناء قائمة التدفقات النقدية.',
        'حظر إجراء مقاصة بين الأصول والالتزامات أو بين الإيرادات والمصروفات إلا بنص صريح.',
      ],
    },
    {
      id: 'eas_2',
      code: 'معيار رقم (2)',
      title: 'المخزون',
      category: 'Accounting',
      summary: 'يحدد المعاملة المحاسبية للمخزون وطرق قياس تكلفته بما في ذلك صافي القيمة البيعية.',
      keyArticles: [
        'يقاس المخزون بالتكلفة أو صافي القيمة البيعية أيهما أقل.',
        'طرق تسعير المخزون المعتمدة: الوارد أولاً يصرف أولاً (FIFO) أو المتوسط المرجح للتكلفة.',
        'حظر طريقة الوارد أخيراً يصرف أولاً (LIFO).',
      ],
    },
    {
      id: 'eas_4',
      code: 'معيار رقم (4)',
      title: 'قائمة التدفقات النقدية',
      category: 'Accounting',
      summary: 'بيان كيفية تصنيف التدفقات النقدية إلى أنشطة تشغيلية، استثمارية وتمويلية.',
      keyArticles: [
        'تصنيف النقدية إلى: أنشطة تشغيلية، استثمارية، وتمويلية.',
        'جواز استخدام الطريقة المباشرة أو غير المباشرة لعرض التدفقات التشغيلية.',
      ],
    },
    {
      id: 'eas_10',
      code: 'معيار رقم (10)',
      title: 'الأصول الثابتة وإهلاكها',
      category: 'Accounting',
      summary: 'تحديد المعالجة المحاسبية للأصول الثابتة وإهلاكها والتكاليف اللاحقة لاقتنائها.',
      keyArticles: [
        'الاعتراف بالأصل بالتكلفة التاريخية شاملاً كافة المصاريف حتى يصبح صالحاً للاستخدام.',
        'توزيع القيمة القابلة للإهلاك بانتظام على مدار العمر الإنتاجي المقدر.',
        'إعادة تقييم الأصول وتطبيق نموذج إعادة التقييم وفق التعديلات الوزارية الأخيرة.',
      ],
    },
    {
      id: 'tax_91',
      code: 'قانون 91 لسنة 2005',
      title: 'قانون الضريبة على الدخل وتعديلاته بالقانون 30 لسنة 2023',
      category: 'Tax',
      summary: 'ينظم الضريبة على أرباح الأشخاص الاعتبارية (الشركات) والأشخاص الطبيعيين والمرتبات وما في حكمها.',
      keyArticles: [
        'المادة (49): سريان الضريبة بنسبة 22.5% على صافي الأرباح السنوية للشركات.',
        'المادة (56): الضريبة المستقطعة من المنبع على الإتاوات وعوائد القروض والخدمات لغير المقيمين.',
        'قانون 30 لسنة 2023: رفع حد الإعفاء الشخصي وضبط الشرائح الضريبية لكسب العمل.',
      ],
    },
    {
      id: 'tax_67',
      code: 'قانون 67 لسنة 2016',
      title: 'قانون الضريبة على القيمة المضافة ولائحته التنفيذية',
      category: 'Tax',
      summary: 'فرض ضريبة عامة على مبيعات السلع والخدمات المحلية والمستوردة بمعدل عام 14%.',
      keyArticles: [
        'السعر العام للضريبة 14% على كافة السلع والخدمات إلا ما استثني بنص صريح.',
        'إلزامية تقديم الإقرار الضريبي الإلكتروني الشهري (نموذج 10) خلال الشهر التالي.',
        'ضوابط الخصم الضريبي لضريبة المدخلات الصناعية والتجارية وإثباتها بالفاتورة الإلكترونية.',
      ],
    },
    {
      id: 'tax_206',
      code: 'قانون 206 لسنة 2020',
      title: 'قانون الإجراءات الضريبية الموحد',
      category: 'Tax',
      summary: 'توحيد إجراءات ربط وتحصيل الضرائب والتحول الرقمي الكامل لمنظومة الفاتورة والإيصال الإلكتروني.',
      keyArticles: [
        'المادة (35): إلزام الممولين بإصدار فواتير إلكترونية وإيصالات إلكترونية من خلال المنظومة الرقمية.',
        'غرامات عدم الالتزام بتقديم الإقرارات في المواعيد القانونية أو تقديم بيانات غير صحيحة.',
      ],
    },
  ];

  const filtered = standards.filter((s) => {
    const matchesCategory =
      activeTab === 'standards' ? s.category === 'Accounting' : activeTab === 'taxes' ? s.category === 'Tax' : true;
    const matchesSearch =
      s.title.includes(searchTerm) || s.code.includes(searchTerm) || s.summary.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-[#0A4DA3] font-bold text-xl">
            <GraduationCap className="w-6 h-6" />
            <h2>أكاديمية ETC والموسوعة التشريعية والمعايير</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            المكتبة القانونية الكاملة لمعايير المحاسبة المصرية (EAS) وقوانين الضرائب السارية والقرارات الوزارية
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="بحث في القوانين والمعايير..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4DA3]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('standards')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'standards'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          معايير المحاسبة المصرية (EAS)
        </button>

        <button
          onClick={() => setActiveTab('taxes')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'taxes'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          موسوعة القوانين والتشريعات الضريبية
        </button>

        <button
          onClick={() => setActiveTab('academy')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'academy'
              ? 'border-[#0A4DA3] text-[#0A4DA3]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          الدروس التوجيهية المهنية
        </button>
      </div>

      {/* List of Standards or Laws */}
      {activeTab !== 'academy' && (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-blue-50 text-[#0A4DA3] rounded font-bold text-xs border border-blue-200">
                      {item.code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-xs hidden sm:inline">
                      {isExpanded ? 'طي التفاصيل' : 'عرض التفاصيل والمعالجة'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs">
                    <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                      <strong className="block text-slate-900 mb-1">الهدف ونطاق التطبيق:</strong>
                      {item.summary}
                    </div>

                    <div>
                      <strong className="block text-slate-900 mb-2">أبرز الأحكام والضوابط العملية:</strong>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                        {item.keyArticles.map((art, idx) => (
                          <li key={idx}>{art}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Academy tab */}
      {activeTab === 'academy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0A4DA3] font-bold text-[10px]">مسار مهني</span>
            <h4 className="font-bold text-sm text-slate-900">إعداد القوائم المالية وفق المعايير المصرية</h4>
            <p className="text-slate-500 leading-relaxed">
              شرح عملي خطوة بخطوة لتحويل ميزان المراجعة إلى قائمة الدخل والمركز المالي والتدفقات النقدية.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">دليل ضريبي</span>
            <h4 className="font-bold text-sm text-slate-900">دليل الفحص الضريبي وإعداد الدفاتر المنتظمة</h4>
            <p className="text-slate-500 leading-relaxed">
              كيفية إعداد الملف الضريبي والمستندات الثبوتية المؤيدة للتكاليف لاجتياز الفحص الضريبي بنجاح.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-[10px]">حوكمة ورقابة</span>
            <h4 className="font-bold text-sm text-slate-900">تصميم وتطبيق نظام الرقابة الداخلية</h4>
            <p className="text-slate-500 leading-relaxed">
              أفضل الممارسات لفصل المسؤوليات والاعتمادات وحماية أصول المنشأة ومنع التلاعب والاختلاس.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
