import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Helper to initialize Gemini client lazily
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Analyze PDF API Endpoint
app.post("/api/analyze-pdf", async (req, res) => {
  try {
    const { pdfBase64, pdfText, documentName, level, language, interests } = req.body;

    if (!pdfBase64 && !pdfText) {
      return res.status(400).json({ error: "مطلوب إرفاق مستند PDF أو النص الخاص به." });
    }

    const ai = getGeminiClient();

    const selectedLevel = level || "متوسط";
    const selectedLang = language || "عربي";
    const selectedInterests = Array.isArray(interests) && interests.length > 0 ? interests.join(" و ") : "الألعاب والتقنية";

    const prompt = `أنت "وافي" (Wafi) – الرفيق الذكي للشرح والمذاكرة المعزز بالذكاء الاصطناعي.
قم بتحليل المستند الدراسي المرفق بأسلوب تعليمي مبسط، واحترافي ومشجع.
معايير التخصيص المطلوبة:
- مستوى الشرح: ${selectedLevel}
- لغة المخرجات الرئيسية: ${selectedLang} (مع صياغة عربية سلسة وجذابة)
- اهتمامات الطالب وشغفه: (${selectedInterests}). استخدم تشبيهات وأمثلة واقعية مأخوذة بشكل ذكي ومباشر من اهتمامات الطالب!

قم باستخراج المخرجات التالية بهيكلية JSON دقيقة جداً:
1. metadata:
   - title: عنوان أو موضوع المستند الرئيسي (بالعربية).
   - estimatedTime: وقت المذاكرة التقديري بالدقائق (مثال: "25 دقيقة").
   - subject: المادة أو المجال التعليمي.
   - totalTopics: عدد المواضيع الرئيسية المحللة.
2. summary:
   - overview: ملخص شامل ومبسط للمستند (فقرتين) يربط بين المفاهيم الرئيسية واهتمامات الطالب (${selectedInterests}).
   - keyPoints: قائمة بالنقاط والمفاهيم الأساسية (من 4 إلى 6 نقاط). كل نقطة تحتوي على:
     - id: رقم تعريف.
     - title: اسم المفهوم أو النقطة.
     - explanation: شرح دقيق ومبسط يناسب مستوى (${selectedLevel}).
     - interestAnalogy: تشبيه أو مثال تطبيقي من اهتمامات الطالب (${selectedInterests}) يرسخ الفكرة.
     - tag: تصنيف الفرع أو الأهمية (مثال: "مفهوم جوهري", "قانون هام", "تطبيق عملي").
   - audioScript: نص صوتي ملخص موجز ومحفز يمكن قراءته للطالب لتثبيت المعلومات قبل المذاكرة.
3. flashcards:
   - قائمة من 5 إلى 8 بطاقات استذكار (Flashcards) تفاعلية. كل بطاقة تحتوي على:
     - id: رقم.
     - topic: الموضوع الخاص بالبطاقة.
     - front: المفهوم أو السؤال في الجهة الأمامية.
     - back: الشرح والتعريف المباشر + مثال سريع مرتبط باهتمامات الطالب في الجهة الخلفية.
4. quiz:
   - اختبار تشخيصي تفاعلي من 5 أسئلة خيارات متعددة (MCQ). كل سؤال يحتوي على:
     - id: رقم السؤال.
     - question: نص السؤال باللغة العربية.
     - options: مصفوفة من 4 خيارات إجابة.
     - correctIndex: مؤشر الإجابة الصحيحة (0 إلى 3).
     - explanation: شرح سبب صحة الإجابة.
     - concept: المفهوم التعليمي المستهدف بالسؤال.
     - pageOrSection: رقم الصفحة أو الفصل المفترض في المستند.`;

    let contentsPayload: any;

    if (pdfBase64) {
      // Strip base64 header if present
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
      contentsPayload = {
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      };
    } else {
      contentsPayload = {
        parts: [
          { text: `محتوى المستند الدراسي (${documentName || "المستند"}):\n\n${pdfText}\n\n` },
          { text: prompt },
        ],
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contentsPayload,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metadata: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                estimatedTime: { type: Type.STRING },
                subject: { type: Type.STRING },
                totalTopics: { type: Type.NUMBER },
              },
              required: ["title", "estimatedTime", "subject"],
            },
            summary: {
              type: Type.OBJECT,
              properties: {
                overview: { type: Type.STRING },
                audioScript: { type: Type.STRING },
                keyPoints: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      interestAnalogy: { type: Type.STRING },
                      tag: { type: Type.STRING },
                    },
                    required: ["id", "title", "explanation", "interestAnalogy"],
                  },
                },
              },
              required: ["overview", "keyPoints"],
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                },
                required: ["id", "front", "back"],
              },
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                  concept: { type: Type.STRING },
                  pageOrSection: { type: Type.STRING },
                },
                required: ["id", "question", "options", "correctIndex", "explanation", "concept"],
              },
            },
          },
          required: ["metadata", "summary", "flashcards", "quiz"],
        },
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);

    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("Error in /api/analyze-pdf:", err);
    return res.status(500).json({
      error: "حدث خطأ أثناء تحليل المستند باستخدام الذكاء الاصطناعي وافي.",
      details: err.message,
    });
  }
});

// 2. Diagnose Wrong Answer / Gap Analysis
app.post("/api/diagnose-error", async (req, res) => {
  try {
    const { question, selectedOption, correctOption, concept, documentName, level, interests } = req.body;

    const ai = getGeminiClient();

    const selectedInterests = Array.isArray(interests) && interests.length > 0 ? interests.join(" و ") : "الألعاب والتقنية";

    const prompt = `أنت "وافي" المعلم الخصوصي الذكي. أجاب الطالب إجابة خاطئة على هذا السؤال في اختبار المادة:
السؤال: "${question}"
إجابة الطالب الخاطئة المختارة: "${selectedOption}"
الإجابة الصحيحة المطلوبة: "${correctOption}"
المفهوم المستهدف: "${concept}"
مستوى الشرح المطلوب: ${level || "متوسط"}
اهتمامات الطالب: (${selectedInterests})

قم بتحليل سبب وقوع الطالب في هذا الخطأ وتشخيص الفجوة التعليمية فوراً بأسلوب مشجع وإيجابي.
أرجع JSON بالهيكلية التالية:
- errorReason: توضيح دقيق ومبسط للسبب الذي جعل الطالب يختار هذا الخيار الخاطئ (تحليل اللبس الذهني).
- coreConcept: توضيح المفهوم الأساسي الصحيح بكلمات بسيطة.
- weaknessAnalysis: تشخيص نقطة الضعف/الفجوة التعليمية (مثال: "الخلط بين التسارع والسرعة المتجهة").
- interestAnalogy: تشبيه أو مثال توضيحي سريع مأخوذ من اهتمامات الطالب (${selectedInterests}) ليعالج الخطأ فوراً ولا ينساها أبداً.
- pageOrSection: إشارة مرجعية توجيهية للمراجعة في المستند.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            errorReason: { type: Type.STRING },
            coreConcept: { type: Type.STRING },
            weaknessAnalysis: { type: Type.STRING },
            interestAnalogy: { type: Type.STRING },
            pageOrSection: { type: Type.STRING },
          },
          required: ["errorReason", "coreConcept", "weaknessAnalysis", "interestAnalogy"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ success: true, diagnosis: data });
  } catch (err: any) {
    console.error("Error in /api/diagnose-error:", err);
    return res.status(500).json({ error: "تعذر تشخيص الخطأ حالياً.", details: err.message });
  }
});

// 3. Generate Remedial Plan API Endpoint
app.post("/api/generate-remedial", async (req, res) => {
  try {
    const { weakPoints, level, interests, documentName } = req.body;

    if (!weakPoints || !Array.isArray(weakPoints) || weakPoints.length === 0) {
      return res.status(400).json({ error: "لا توجد نقاط ضعف مسجلة لإعداد الجرعة العلاجية." });
    }

    const ai = getGeminiClient();
    const selectedInterests = Array.isArray(interests) && interests.length > 0 ? interests.join(" و ") : "الألعاب والتقنية";

    const prompt = `أنت "وافي" المعلم الخصوصي الذكي.
قام الطالب بإكمال الاختبار التشخيصي وظهرت لديه بعض الفجوات التعليمية ونقاط الضعف التالية:
${JSON.stringify(weakPoints, null, 2)}

المطلوب: إعداد "الجرعة العلاجية الفورية" (Remedial Plan) لمعالجة هذه الفجوات وإغلاقها تماماً.
لكل نقطة ضعف، صمم وحدة علاجية تشمل:
1. conceptId: رقم المفهوم.
2. title: عنوان المفهوم أو نقطة الضعف بأسلوب محفز (مثال: "علاج مفهوم: قوانين نيوتن").
3. simplifiedLesson: شرح معدل ومبسط جداً للمفهوم يركز على فك اللبس وإزالة نقطة الضعف تحديداً.
4. interestAnalogy: تشبيه أو قصة قصيرة مأخوذة بشكل مباشر من اهتمامات الطالب (${selectedInterests}).
5. keyTakeaways: مصفوفة من 2-3 نصائح سريعة لتثبيت المعلومة.
6. confirmationQuestion: سؤال تأكيدي تفاعلي جديد بالكامل لتغطية الفجوة والتأكد من استيعاب الدرس العلاجي:
   - question: نص السؤال التأكيدي.
   - options: 4 خيارات إجابة.
   - correctIndex: رقم الإجابة الصحيحة (0-3).
   - explanation: تعزيز فوري ومستحق عند الحل الصحيح.

أرجع النتيجة بصيغة JSON:
{
  "remedialUnits": [ ... ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            remedialUnits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  conceptId: { type: Type.STRING },
                  title: { type: Type.STRING },
                  simplifiedLesson: { type: Type.STRING },
                  interestAnalogy: { type: Type.STRING },
                  keyTakeaways: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  confirmationQuestion: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      correctIndex: { type: Type.NUMBER },
                      explanation: { type: Type.STRING },
                    },
                    required: ["question", "options", "correctIndex", "explanation"],
                  },
                },
                required: ["conceptId", "title", "simplifiedLesson", "interestAnalogy", "confirmationQuestion"],
              },
            },
          },
          required: ["remedialUnits"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ success: true, remedialPlan: data });
  } catch (err: any) {
    console.error("Error in /api/generate-remedial:", err);
    return res.status(500).json({ error: "تعذر إنشاء الجرعة العلاجية.", details: err.message });
  }
});

// 4. Chat with PDF & Tutor API Endpoint
app.post("/api/tutor-chat", async (req, res) => {
  try {
    const { message, chatHistory, documentContext, level, language, interests } = req.body;

    const ai = getGeminiClient();
    const selectedInterests = Array.isArray(interests) && interests.length > 0 ? interests.join(" و ") : "الألعاب والتقنية";

    const systemInstruction = `أنت "وافي" (Wafi) - المعلم الخصوصي الذكي والمحفز للطالب.
أسلوبك في الحديث:
- ودود جداً، مشجع، واستثنائي في الشرح والتوضيح.
- تستخدم كلمات مشجعة مثل: "أهلاً بك يا بطل!"، "سؤال رائع ذكي جداً!"، "دعني أبسطها لك بكل سهولة!"
- عندما تشرح أي فكرة، اربطها إذا أمكن باهتمامات الطالب: (${selectedInterests})، واستخدم أمثلة تشبيهية ممتعة.
- التزم بمستوى الشرح المطلوب (${level || "متوسط"}).
- اعتمد على محتوى المستند المرفق إذا كان ذا صلة، ووضحه بأسلوب مباشر ومقسّم على خطوات وعلامات توضيحية نسقية.
- حافظ على الإجابة واضحة ومركزة ومنظمة باستخدام تنسيق Markdown.`;

    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction,
      },
    });

    // Provide context if first message
    let fullUserMessage = message;
    if (documentContext) {
      fullUserMessage = `[محتوى المستند الدراسي المرجعي: "${documentContext.slice(0, 3000)}"]\n\nسؤال الطالب: ${message}`;
    }

    const chatResponse = await chat.sendMessage({
      message: fullUserMessage,
    });

    return res.json({ success: true, reply: chatResponse.text });
  } catch (err: any) {
    console.error("Error in /api/tutor-chat:", err);
    return res.status(500).json({ error: "تعذر الرد من المعلم وافي حالياً.", details: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Wafi AI Learning Server running on http://localhost:${PORT}`);
  });
}

startServer();
