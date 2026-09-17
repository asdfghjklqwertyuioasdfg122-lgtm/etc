import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { User, ChatMessage } from '../../types';
import {
  MessageSquare,
  Send,
  Megaphone,
  PlusCircle,
  Clock,
  User as UserIcon,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building,
  Crown,
  Search,
  Pin,
  X,
} from 'lucide-react';
import { BluePyramidLogo } from '../common/BluePyramidLogo';

interface CommunicationModuleProps {
  currentUser: User;
}

export const CommunicationModule: React.FC<CommunicationModuleProps> = ({ currentUser }) => {
  const isOwner = currentUser.isOwner || currentUser.role.includes('Owner');
  const [activeTab, setActiveTab] = useState<'circulars' | 'memos'>('circulars');
  const [messages, setMessages] = useState<ChatMessage[]>(StorageService.getChats());
  const [searchTerm, setSearchTerm] = useState('');

  // Circular Form State (Publishing by Owner/Admin)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [circularTitle, setCircularTitle] = useState('');
  const [circularCategory, setCircularCategory] = useState<'إداري' | 'مالي' | 'ضريبي' | 'رقابي'>('إداري');
  const [circularPriority, setCircularPriority] = useState<'عادي' | 'هام' | 'عاجل جداً'>('هام');
  const [circularBody, setCircularBody] = useState('');

  // Direct Memo State
  const [memoText, setMemoText] = useState('');
  const [memoRecipient, setMemoRecipient] = useState<string>('all');

  const users = StorageService.getUsers();

  const refreshMessages = () => {
    setMessages(StorageService.getChats());
  };

  const handlePublishCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!circularTitle.trim() || !circularBody.trim()) return;

    const formattedMessage = `[تعميم ${circularPriority}] - ${circularCategory} | ${circularTitle.trim()}\n\n${circularBody.trim()}`;

    StorageService.addChatMessage({
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      message: formattedMessage,
      isAnnouncement: true,
    });

    // Notify all users in notification center
    StorageService.addNotification({
      title: `تعميم جديد: ${circularTitle.trim()}`,
      message: `${circularBody.trim().substring(0, 100)}...`,
      type: circularPriority === 'عاجل جداً' ? 'ALERT' : 'INFO',
    });

    StorageService.addActivityLog({
      userId: currentUser.id,
      username: currentUser.username,
      action: 'إصدار تعميم إداري',
      module: 'المراسلات والتعاميم',
      details: `قام (${currentUser.fullName}) بإصدار التعميم: ${circularTitle.trim()}`,
    });

    setIsPublishModalOpen(false);
    setCircularTitle('');
    setCircularBody('');
    refreshMessages();
  };

  const handleSendMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoText.trim()) return;

    StorageService.addChatMessage({
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      receiverId: memoRecipient === 'all' ? undefined : memoRecipient,
      message: memoText.trim(),
      isAnnouncement: false,
    });

    setMemoText('');
    refreshMessages();
  };

  const circulars = messages.filter((m) => m.isAnnouncement);
  const directMemos = messages.filter((m) => !m.isAnnouncement);

  const filteredCirculars = circulars.filter((c) =>
    c.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.senderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="communication-module-container" className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2 border-[#0A4DA3]/20 shadow-sm">
        <div className="flex items-center gap-3.5">
          <BluePyramidLogo size="md" />
          <div>
            <div className="flex items-center gap-2.5 text-[#0A4DA3] font-bold text-xl">
              <h2>المراسلات والتعاميم الإدارية والرقابية</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              منظومة التواصل المؤسسي الداخلي، التعاميم المعتمدة، وتوجيهات الإدارة العليا لفرق العمل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              id="publish-circular-button"
              onClick={() => setIsPublishModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>إصدار تعميم رسمي جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-sm font-semibold">
        <button
          id="tab-circulars-btn"
          onClick={() => setActiveTab('circulars')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'circulars'
              ? 'border-[#0A4DA3] text-[#0A4DA3] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          التعاميم والقرارات الرسمية ({circulars.length})
        </button>

        <button
          id="tab-memos-btn"
          onClick={() => setActiveTab('memos')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'memos'
              ? 'border-[#0A4DA3] text-[#0A4DA3] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          المذكرات والملاحظات الداخلية ({directMemos.length})
        </button>
      </div>

      {/* TAB 1: Circulars */}
      {activeTab === 'circulars' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث في التعاميم والقرارات..."
                className="w-full pr-9 pl-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0A4DA3]"
              />
            </div>
          </div>

          {filteredCirculars.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0A4DA3] flex items-center justify-center mx-auto mb-3 border border-blue-100">
                <Megaphone className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">لا توجد تعاميم إدارية منشورة</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
                يتم نشر القرارات الرسمية وتوجيهات الرقابة الضريبية والمالية هنا لجميع منسوبي المنشأة.
              </p>
              {isOwner && (
                <button
                  onClick={() => setIsPublishModalOpen(true)}
                  className="px-4 py-2 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>إصدار أول تعميم رسمي</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredCirculars.map((circ) => (
                <div
                  key={circ.id}
                  className="bg-white rounded-2xl border-2 border-[#0A4DA3]/20 p-6 shadow-xs hover:border-[#0A4DA3]/50 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-[#0A4DA3] rounded-xl border border-blue-100 flex-shrink-0">
                        <Pin className="w-5 h-5 text-[#0A4DA3]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-[#0A4DA3]">
                            تعميم رسمي
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {new Date(circ.timestamp).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          من: {circ.senderName} ({circ.senderRole})
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {circ.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Internal Memos & Notes */}
      {activeTab === 'memos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">سجل المذكرات والملاحظات التنفيذية</h3>
              <p className="text-xs text-slate-400">تبادل التوجيهات وملاحظات المراجعة الدفترية بين الزملاء</p>
            </div>
          </div>

          {/* Form to send memo */}
          <form onSubmit={handleSendMemo} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="sm:w-64">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">الموجّه إليه:</label>
                <select
                  value={memoRecipient}
                  onChange={(e) => setMemoRecipient(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0A4DA3]"
                >
                  <option value="all">الجميع (مذكرة عامة لكافة الفريق)</option>
                  {users
                    .filter((u) => u.id !== currentUser.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">نص المذكرة / الملاحظة:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={memoText}
                    onChange={(e) => setMemoText(e.target.value)}
                    placeholder="اكتب ملاحظة أو توجيه محاسبي أو استفسار فني..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0A4DA3]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0A4DA3] hover:bg-[#1565C0] text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* List of memos */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {directMemos.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                لا توجد مذكرات أو ملاحظات مسجلة بعد.
              </div>
            ) : (
              directMemos.map((memo) => {
                const isSentByMe = memo.senderId === currentUser.id;
                const recipientUser = users.find((u) => u.id === memo.receiverId);

                return (
                  <div
                    key={memo.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSentByMe
                        ? 'bg-blue-50/50 border-blue-200/80 mr-auto max-w-2xl'
                        : 'bg-white border-slate-200 max-w-2xl'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{memo.senderName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                          {memo.senderRole}
                        </span>
                        {recipientUser && (
                          <span className="text-[10px] text-[#0A4DA3] font-semibold">
                            ← إلى: {recipientUser.fullName}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(memo.timestamp).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{memo.message}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL: Publish Circular */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#0A4DA3] font-bold text-base">
                <Megaphone className="w-5 h-5" />
                <h3>إصدار تعميم إداري رسمي</h3>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishCircular} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان التعميم:</label>
                <input
                  type="text"
                  required
                  value={circularTitle}
                  onChange={(e) => setCircularTitle(e.target.value)}
                  placeholder="مثال: تعليمات إغلاق الفترة المالية ومطابقة أرصدة الضرائب"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0A4DA3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تصنيف التعميم:</label>
                  <select
                    value={circularCategory}
                    onChange={(e) => setCircularCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0A4DA3]"
                  >
                    <option value="إداري">إداري وتنظيمي</option>
                    <option value="مالي">مالي ومحاسبي</option>
                    <option value="ضريبي">ضريبي وتشريعي</option>
                    <option value="رقابي">رقابي وتدقيق</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">درجة الأهمية:</label>
                  <select
                    value={circularPriority}
                    onChange={(e) => setCircularPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0A4DA3]"
                  >
                    <option value="عادي">عادي</option>
                    <option value="هام">هام</option>
                    <option value="عاجل جداً">عاجل جداً</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نص وتفاصيل التعميم:</label>
                <textarea
                  required
                  rows={5}
                  value={circularBody}
                  onChange={(e) => setCircularBody(e.target.value)}
                  placeholder="اكتب نص القرار أو التوجيه الإداري كاملاً..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0A4DA3] leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A4DA3] hover:bg-[#1565C0] text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  نشر التعميم رسمياً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
