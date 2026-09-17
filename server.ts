import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "ETC ERP Platform", time: new Date().toISOString() });
  });

  // AI assistant endpoint
  const handleAiRequest = async (req: express.Request, res: express.Response) => {
    try {
      const { prompt, systemInstruction, mode, role, language, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      const userText = prompt || "";
      const isEnglish = language === 'en' || (language !== 'ar' && /^[A-Za-z0-9\s.,?!'"-:;()]+$/.test(userText.trim().slice(0, 40)));

      // Role specific prompt enhancements
      const roleProfiles: Record<string, string> = {
        friend: "أنت صديق العمل والمستشار المقرب، تتكلم بلغة مصرية ودودة جداً ودافئة، تدعم المستخدم وتشجعه وتبسط له أعقد المسائل المحاسبية والمالية والبيزنس كأنك زميله وصاحبه من سنين.",
        manager: "أنت المدير العام (General Manager)، تركيزك على القيادة، الإنتاجية، سير العمل، التنسيق بين الإدارات، تعظيم الإيرادات وتحقيق الأهداف الاستراتيجية بلهجة مصرية قيادية حاسمة وواضحة.",
        cfo: "أنت المدير المالي التنفيذي (CFO)، تركيزك على هيكل رأس المال، التدفقات النقدية، الربحية، السيولة، إدارة المخاطر، والقرارات الاستثمارية الاستراتيجية وفق معايير المحاسبة المصرية والدولية.",
        chief_accountant: "أنت رئيس الحسابات (Chief Accountant)، خبير بالقيود المحاسبية، اليومية العامة، ميزان المراجعة، التسويات البنكية، إقفالات الفترات، ومطابقة الحسابات بالقيد المزدوج طبقاً لمعايير المحاسبة المصرية (EAS).",
        internal_auditor: "أنت المراجع الداخلي (Internal Auditor)، تركز على الرقابة الداخلية، سلامة الإجراءات، فصل المهام، كشف الأخطاء، ومنع التلاعب وحماية أصول المنشأة بدقة رقابية صارمة.",
        external_auditor: "أنت المراجع الخارجي / مراقب الحسابات (External Auditor)، تفحص القوائم المالية وفق معايير المراجعة المصرية (ESA) والدولية، وتصدر أحكاماً مهنية محايدة وتقارير خالية من التحريف الهام والمؤثر.",
        tax_consultant: "أنت المستشار الضريبي (Tax Consultant)، خبير بالقوانين الضريبية المصرية (ضريبة الدخل 91/2005، القيمة المضافة 67/2016، قانون الإجراءات 206/2020، ضريبة المرتبات قانون 30/2023، منظومة الفاتورة والإيصال الإلكتروني). تركز على الامتثال وتفادي الغرامات.",
        financial_analyst: "أنت المحلل المالي (Financial Analyst)، تحلل المؤشرات، السيولة، النشاط، المديونية، الربحية، وتحسب نقطة التعادل، وتعد التوقعات ودراسات الجدوى المالية باحترافية.",
        business_consultant: "أنت مستشار الأعمال والشركات (Business Consultant)، تقدم حلولاً تسويقية، خطط نمو، نماذج أعمال، استراتيجيات تسعير وتوسّع تنافسي للمؤسسات المصرية والعربية.",
        accounting_trainer: "أنت المدرب المحاسبي (Accounting Trainer)، تشرح المفاهيم بأسلوب تعليمي مبسط مع أمثلة عملية وتمارين تطبيقية تساعد المحاسبين على التطور المهني.",
        etc_professor: "أنت أستاذ وخبير ETC (Professor of ETC)، المرجع الأكاديمي والمهني الأول، تجمع بين المعايير الأكاديمية الصارمة والخبرة العملية في السوق المصري بأسلوب تعليمي رفيع ووقور.",
        colleague: "أنت زميل العمل (Colleague)، تتناقش بحيوية وإيجابية وتعاون، تشارك الآراء وتبادل الخبرات بروح الفريق الواحد."
      };

      const selectedProfile = roleProfiles[role || mode] || roleProfiles['etc_professor'];

      const complianceDirective = `
قواعد الامتثال الأخلاقي والقانوني الصارمة:
- يجوز لك: كشف المخاطر ونقاط الضعف والمخالفات، واقتراح التصحيحات المحاسبية والتحسين الضريبي القانوني المعتمد.
- يُحظر عليك تماماً: اقتراح أي تهرب ضريبي، أو تلاعب بالدفاتر والمستندات، أو إخفاء بيانات، أو مخالفة القوانين المصرية والدولية.
`;

      const responseFormatInstruction = isEnglish
        ? `Respond in fluent, professional English. For professional queries, provide a structured breakdown:
1. Summary
2. Analysis
3. Risks
4. Financial Impact
5. Tax Impact
6. Recommendations
7. Next Steps`
        : `تحدث باللغة العربية، وباللهجة المصرية المهنية الطبيعية (تجنب الردود الآلية الجافة، واستخدم أسلوب المحاسب المصري الخبير الودود مثل "الحالة دي محتاجة معالجة بالشكل ده..."، "فيه مخاطرة ممكن تحصل لو...").
لكل استشارة مهنية أو فنية، التزم بالهيكل الآتي بوضوح:
1. 📝 الملخص
2. 🔍 التحليل الفني والمهني
3. ⚠️ المخاطر ونقاط الضعف
4. 💰 الأثر المالي والتدفق النقدي
5. 🏛️ الأثر الضريبي والامتثال
6. 💡 التوصيات العملية
7. 🚀 الخطوات التالية التنفيذية`;

      const finalSystemInstruction = systemInstruction || `
أنت ETC AI - الرفيق والمستشار الذكي الشامل لمنصة ETC الذكية للمحاسبة والمراجعة والضرائب وإدارة الأعمال في جمهورية مصر العربية.
الدور الحالي المحدد لك: ${selectedProfile}
${complianceDirective}
${responseFormatInstruction}
سياق بيانات المنشأة الحالية (إن وجد):
${context || "المنظومة متصلة بالدفاتر والسجلات المعتمدة للمنشأة."}
`;

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: finalSystemInstruction,
          }
        });

        return res.json({ text: response.text, role: role || mode || 'etc_professor' });
      }

      // High-grade intelligent local fallback if no API key is set
      const lower = userText.toLowerCase();
      let fallbackResponse = "";

      if (isEnglish) {
        fallbackResponse = `### 1. Summary
Regarding "${userText}": under Egyptian Accounting Standards (EAS) and applicable tax legislation, all transactions must strictly adhere to the accrual basis, matching principle, and double-entry bookkeeping.

### 2. Analysis
The transaction must be documented with verified supporting documents (e-invoice, approved contract, or bank advice).

### 3. Risks
Non-compliance with e-invoicing mandates or lack of formal withholding tax (Form 41) deduction entails severe penalties under Unified Tax Procedures Law 206/2020.

### 4. Financial Impact
Accurate recognition maintains real working capital clarity and prevents profit distortion.

### 5. Tax Impact
Ensures full deductibility of cost items under Income Tax Law 91/2005 and correct 14% VAT input deduction where eligible.

### 6. Recommendations
1. Validate supplier/partner tax registration number on the Egyptian Tax Authority portal.
2. Record the balanced journal entry immediately.
3. Archive electronic receipts in the ETC File Analyzer.

### 7. Next Steps
Record the corresponding journal entry now in the Accounting Module.`;
      } else {
        fallbackResponse = `### 1. 📝 الملخص
أهلاً بحضرتك يا فندم! بخصوص سؤالك عن "${userText}": المعالجة المحاسبية والضريبية الصحيحة وفقاً لمعايير المحاسبة المصرية (EAS) وقوانين الضرائب تستلزم تطبيق مبدأ الاستحقاق والقيد المزدوج المتوازن مع التوثيق بالفاتورة الإلكترونية المعتمدة.

### 2. 🔍 التحليل الفني والمهني
- **التوجيه المحاسبي**: أي معاملة مالية بيتم إثباتها بدفتر اليومية بقيد مزدوج (طرف مدين وطرف دائن متطابقين).
- **التشريعات المنظمة**: معيار المحاسبة المصري رقم (1) لعرض القوائم المالية، وقانون الإجراءات الضريبية الموحد رقم 206 لسنة 2020.

### 3. ⚠️ المخاطر ونقاط الضعف
- عدم تسجيل العملية بفاتورة إلكترونية معتمدة برقم تسجيل ضريبي رسمي قد يترتب عليه عدم اعتماد المصروف ضريبياً واستبعاده بالفحص.
- التأخر في إثبات القيد يؤثر على دقة ميزان المراجعة والقوائم المالية الختامية.

### 4. 💰 الأثر المالي والتدفق النقدي
- الإثبات الدقيق يضمن وضوح التدفق النقدي التشغيلي وحساب الأرباح الفعلية بدقة دون تضخيم أو إهدار.

### 5. 🏛️ الأثر الضريبي والامتثال
- الالتزام بنسبة ضريبة القيمة المضافة العامة (14%) وخصم ضرائب الخصم والتحصيل (نموذج 41) وتوريدها في المواعيد القانونية لتفادي غرامات التأخير.

### 6. 💡 التوصيات العملية
1. توثيق العملية فوراً بمستند رسمي معتمد وإرفاقه بالمحلل الذكي للمستندات في المنصة.
2. التأكد من خصم ضريبة أ.ت.ص المقررة (1% أو 3% توريدات ومقاولات / 5% خدمات مهنية).
3. ترحيل القيد لدفتر الأستاذ وميزان المراجعة.

### 7. 🚀 الخطوات التالية التنفيذية
تقدر تتوجه مباشرة لشاشة **«المحاسبة واليومية العامة»** لتسجيل القيد أو ترفع المستند في **«المحلل الذكي للمستندات»** ليقوم النظام بتوليد القيد آلياً بضغطة زر واحدة!`;
      }

      return res.json({
        text: fallbackResponse,
        role: role || mode || 'etc_professor',
        isLocalFallback: true,
      });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      return res.status(500).json({ error: error.message || "حدث خطأ أثناء معالجة الطلب" });
    }
  };

  app.post("/api/ai/ask", handleAiRequest);
  app.post("/api/gemini", handleAiRequest);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ETC Server running on port ${PORT}`);
  });
}

startServer();
