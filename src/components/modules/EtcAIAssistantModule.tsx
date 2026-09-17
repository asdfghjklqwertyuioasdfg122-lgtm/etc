import React, { useState, useRef, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { User } from '../../types';
import {
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Bot,
  User as UserIcon,
  ShieldAlert,
  CheckCircle2,
  Users,
  Briefcase,
  TrendingUp,
  Receipt,
  FileCheck2,
  GraduationCap,
  Scale,
  Building,
  HeartHandshake,
  UserCheck,
} from 'lucide-react';
import { BluePyramidLogo } from '../common/BluePyramidLogo';

interface EtcAIAssistantModuleProps {
  currentUser: User;
}

interface AiMessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  role?: string;
  timestamp: string;
}

export type EtcAIPersona =
  | 'auto'
  | 'friend'
  | 'manager'
  | 'cfo'
  | 'chief_accountant'
  | 'internal_auditor'
  | 'external_auditor'
  | 'tax_consultant'
  | 'financial_analyst'
  | 'business_consultant'
  | 'accounting_trainer'
  | 'etc_professor'
  | 'colleague';

export const EtcAIAssistantModule: React.FC<EtcAIAssistantModuleProps> = ({ currentUser }) => {
  const [selectedRole, setSelectedRole] = useState<EtcAIPersona>('auto');
  const [messages, setMessages] = useState<AiMessageItem[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      role: 'etc_professor',
      text: `أهلاً بحضرتك يا أستاذ ${currentUser.fullName} في 🤖 ETC AI ULTIMATE!
أنا رفيقك ومستشارك المهني والشخصي الشامل. أقدر أكلمك وأساعدك بأي شخصية تحبها:
• 🤝 صديق عمل مقرب يبسط لك كل الأمور.
• 👨‍💼 مدير عام يساعدك في القرارات وإدارة فريقك.
• 💰 CFO خبير في التدفقات النقدية وهيكل التمويل.
• 📑 رئيس حسابات خبير بالقيود وفق معايير المحاسبة المصرية (EAS).
• 🧾 مستشار ضريبي يحميك من الغرامات ويفحص إقراراتك (قوانين 91/2005 و67/2016 و206/2020).
• 🔍 مراجع داخلي أو 📋 مراقب حسابات خارجي للتدقيق والرقابة.
• 👨‍🏫 أستاذ وخبير ETC لتفسير أي معادلة إكسيل، قيد، أو دراسة مالية.

اتفضل اطرح سؤالك أو موضوع النقاش، وأنا معاك خطوة بخطوة بكل وضوح وسلاسة!`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roleDefinitions: { id: EtcAIPersona; title: string; icon: string; desc: string }[] = [
    { id: 'auto', title: 'تلقائي ذكي', icon: '🤖', desc: 'يختار تلقائياً أفضل دور للموقف' },
    { id: 'friend', title: 'صديق العمل', icon: '🤝', desc: 'ودود وداعم ويبسط المعقد' },
    { id: 'etc_professor', title: 'أستاذ ETC', icon: '👨‍🏫', desc: 'المرجع الأكاديمي والمهني الأول' },
    { id: 'cfo', title: 'CFO مدير مالي', icon: '💰', desc: 'سيولة وتدفقات وقرارات استثمار' },
    { id: 'chief_accountant', title: 'رئيس حسابات', icon: '📑', desc: 'قيود اليومية ومعايير EAS' },
    { id: 'tax_consultant', title: 'مستشار ضريبي', icon: '🧾', desc: 'دخل وقيمة مضافة وفاتورة إلكترونية' },
    { id: 'internal_auditor', title: 'مراجع داخلي', icon: '🔍', desc: 'رقابة داخلية ومنع تلاعب' },
    { id: 'external_auditor', title: 'مراقب حسابات', icon: '📋', desc: 'فحص القوائم ومعايير المراجعة' },
    { id: 'financial_analyst', title: 'محلل مالي', icon: '📊', desc: 'مؤشرات وKPIs ونقاط تعادل' },
    { id: 'manager', title: 'المدير العام', icon: '👨‍💼', desc: 'قيادة وسير العمل والإنتاجية' },
    { id: 'business_consultant', title: 'مستشار أعمال', icon: '🏢', desc: 'نماذج أعمال وتسعير وتوسع' },
    { id: 'accounting_trainer', title: 'مدرب محاسبي', icon: '🎓', desc: 'شرح مبسط وتطبيقات عملية' },
    { id: 'colleague', title: 'زميل العمل', icon: '👥', desc: 'نقاش مباشر وتبادل آراء بروح الفريق' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

    const userMsg: AiMessageItem = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const accounts = StorageService.getAccounts();
      const entries = StorageService.getJournalEntries();
      const partners = StorageService.getPartners();

      const contextSummary = `
بيانات المؤسسة الفعلية المسجلة:
- عدد الحسابات: ${accounts.length}
- إجمالي الأصول: ${accounts.filter((a) => a.type === 'Asset').reduce((sum, a) => sum + a.balance, 0)} ج.م
- إجمالي الإيرادات: ${accounts.filter((a) => a.type === 'Revenue').reduce((sum, a) => sum + a.balance, 0)} ج.م
- إجمالي المصروفات: ${accounts.filter((a) => a.type === 'Expense').reduce((sum, a) => sum + a.balance, 0)} ج.م
- عدد الشركاء: ${partners.length}
- عدد قيود اليومية: ${entries.length}
قواعد الامتثال: لا تبتكر بيانات وهمية، التزم بالمعايير المصرية والنزاهة الرقابية التامة.
`;

      const effectiveRole = selectedRole === 'auto' ? 'etc_professor' : selectedRole;

      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query.trim(),
          role: effectiveRole,
          context: contextSummary,
        }),
      });

      const data = await response.json();
      const aiReplyText = data.text || 'أهلاً بحضرتك يا فندم، أنا جاهز لمساعدتك في أي استفسار مالي أو ضريبي أو إداري.';

      const aiMsg: AiMessageItem = {
        id: 'msg_' + Date.now() + '_ai',
        sender: 'ai',
        role: data.role || effectiveRole,
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: AiMessageItem = {
        id: 'msg_' + Date.now() + '_err',
        sender: 'ai',
        text: 'عذراً، حدث تعذر في الاتصال، ويعمل النظام حالياً بالقواعد المحاسبية والضريبية المدمجة.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-EG';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const quickPrompts = [
    'كيف أعالج ضريبة القيمة المضافة 14% على الأصول الثابتة بالدفاتر؟',
    'ما هي شروط نموذج 41 لضريبة الخصم والتحصيل ونسب الخصم الحالية؟',
    'اشرح لي معادلة XLOOKUP وINDEX MATCH لتحليل ميزان المراجعة بالإكسيل',
    'ما الفرق بين الفحص التقديري والربط الضريبي النهائي بقانون 206/2020؟',
    'كيف أحسب معدل دوران المخزون ومتوسط فترة التحصيل للعملاء؟',
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border-2 border-[#0A4DA3]/20 shadow-md overflow-hidden">
      {/* Header with Blue Pyramid Logo & Persona Status */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/50">
        <div className="flex items-center gap-3">
          <BluePyramidLogo size="md" animate />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">
                🤖 ETC AI — المساعد والرفيق المالي الذكي
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] font-bold border border-emerald-500/20">
                متصل • EAS & IFRS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              يتحدث باللهجة المصرية المهنية أو الإنجليزية بأسلوب إنساني طبيعي غير آلي
            </p>
          </div>
        </div>

        {/* Compliance Banner */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 shadow-xs self-start md:self-auto">
          <ShieldAlert className="w-4 h-4 text-[#0A4DA3]" />
          <span>كشف المخاطر والتحسين الضريبي القانوني • حظر التهرب والتلاعب</span>
        </div>
      </div>

      {/* 12 Persona Switcher Bar */}
      <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap ml-2">اختر الدور:</span>
        {roleDefinitions.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              title={role.desc}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-[#0A4DA3] text-white shadow-sm font-bold scale-102'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200/80'
              }`}
            >
              <span>{role.icon}</span>
              <span>{role.title}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl ${
                isUser ? 'mr-auto flex-row-reverse' : 'ml-auto'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-[#0A4DA3] text-white'
                    : 'bg-white border-2 border-[#0A4DA3]/30 text-[#0A4DA3]'
                }`}
              >
                {isUser ? (
                  <UserIcon className="w-5 h-5" />
                ) : (
                  <BluePyramidLogo size="sm" />
                )}
              </div>

              <div
                className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-[#0A4DA3] text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border-2 border-[#0A4DA3]/15 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line font-sans prose-sm">{msg.text}</div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/40 text-[10px] opacity-75">
                  <span className="font-mono">{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      className="hover:underline flex items-center gap-1 text-[#0A4DA3] font-bold cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      استماع صوتي
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white border-2 border-[#0A4DA3]/30 flex items-center justify-center">
              <BluePyramidLogo size="sm" animate />
            </div>
            <div className="p-4 bg-white border-2 border-[#0A4DA3]/20 rounded-2xl text-xs text-slate-600 flex items-center gap-3 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0A4DA3] animate-ping" />
              <span className="font-medium">
                ETC AI يقوم بدراسة الحالة والتحليل ومطابقة معايير EAS وقوانين الضرائب...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-slate-200 bg-white flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-bold whitespace-nowrap ml-1">استفسارات شائعة:</span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(qp)}
            className="px-3 py-1.5 bg-blue-50/70 hover:bg-blue-100 text-[#0A4DA3] border border-blue-200/60 rounded-xl whitespace-nowrap transition-colors cursor-pointer font-medium"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="تحدث مع ETC AI بكل حرية في المحاسبة، الضرائب، إدارة الأعمال، دراسات الجدوى..."
            className="flex-1 p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4DA3] focus:border-transparent transition-all"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-3.5 bg-gradient-to-r from-[#0A4DA3] to-[#1565C0] hover:from-[#1565C0] hover:to-[#0A4DA3] text-white rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-md flex items-center justify-center active:scale-95"
            title="إرسال"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

