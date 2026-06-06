import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

function buildFallback(action: string, body: Record<string, any>) {
  const resume = body.resume ?? {};
  const summary = resume.personal?.summary ?? "Experienced professional.";
  const skills = Array.isArray(resume.skills) ? resume.skills.slice(0, 6) : [];
  const targetRole = resume.targetRole ?? "Professional";
  const jd = String(body.jobDescription ?? body.sourceText ?? "").toLowerCase();

  if (action === "optimize") {
    return {
      atsScore: Math.min(96, 68 + skills.length * 3),
      keywordCoverage: skills.slice(0, 5),
      missingKeywords: ["Leadership", "Metrics", "Cross-functional collaboration"].filter((item) => !jd.includes(item.toLowerCase())),
      enhancedSummary: `${summary} Focused on ${targetRole}, measurable delivery outcomes, stakeholder communication, and practical execution.`,
      improvedBullets: [
        "Reduced delivery risk through tighter planning, backlog hygiene, and release checkpoints.",
        "Translated technical complexity into clear execution plans for stakeholders and delivery teams.",
        "Used AI-aware workflows and engineering context to speed decision-making and unblock teams.",
      ],
      suggestedTemplateId: targetRole.toLowerCase().includes("engineer") ? "technical" : targetRole.toLowerCase().includes("manager") ? "executive" : "modern",
    };
  }

  if (action === "cover-letter") {
    return {
      subjectLine: `Application for ${targetRole}`,
      body: `Dear Hiring Team,\n\nI am excited to apply for the ${targetRole} position. My background combines delivery leadership, technical execution, and practical stakeholder alignment. I have led complex software work, improved team throughput, and supported high-quality releases while staying close to engineering realities.\n\nI would welcome the chance to contribute that blend of execution rigor and technical fluency to your team.\n\nSincerely,\n${resume.personal?.fullName ?? "Candidate"}`,
    };
  }

  if (action === "variants") {
    return [
      {
        role: "Software Engineer Resume",
        headline: "Engineering-focused variant emphasizing architecture, delivery, and backend systems.",
        summary: "Highlights hands-on PHP, Laravel, integrations, and technical decision support.",
      },
      {
        role: "Technical Lead Resume",
        headline: "Leadership variant balancing code quality, mentoring, and project execution.",
        summary: "Highlights team leadership, technical reviews, and system planning.",
      },
      {
        role: "AI Project Manager Resume",
        headline: "AI delivery variant centered on prompt-aware execution and modern workflow optimization.",
        summary: "Highlights AI training, delivery governance, and cross-functional execution.",
      },
    ];
  }

  if (action === "import-analysis") {
    return {
      detectedSections: ["Profile", "Experience", "Skills", "Education"],
      extractedHighlights: ["Leadership", "Delivery ownership", "Technical background"],
      parsingNotes: [
        "PDF and DOCX parsing in-browser is limited without dedicated extractors.",
        "Best results come from uploaded TXT or exported PDF text.",
      ],
    };
  }

  return {
    templateId: jd.includes("sidebar") ? "sidebar" : jd.includes("ats") ? "ats" : jd.includes("creative") ? "creative" : "modern",
    rationale: [
      "Matched the uploaded reference to the closest maintainable React layout.",
      "Prioritized section hierarchy and spacing over pixel-perfect cloning.",
    ],
    palette: ["Slate", "Blue", "White"],
    typography: ["Outfit", "Inter"],
  };
}

function getClient() {
  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

export const handler = async (event: { httpMethod: string; body?: string | null }) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const action = String(body.action ?? "optimize");
    const ai = getClient();

    if (!ai) {
      return {
        statusCode: 200,
        body: JSON.stringify(buildFallback(action, body)),
        headers: { "Content-Type": "application/json" },
      };
    }

    const schemaByAction: Record<string, any> = {
      optimize: {
        type: Type.OBJECT,
        required: ["atsScore", "keywordCoverage", "missingKeywords", "enhancedSummary", "improvedBullets", "suggestedTemplateId"],
        properties: {
          atsScore: { type: Type.INTEGER },
          keywordCoverage: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          enhancedSummary: { type: Type.STRING },
          improvedBullets: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedTemplateId: { type: Type.STRING },
        },
      },
      "cover-letter": {
        type: Type.OBJECT,
        required: ["subjectLine", "body"],
        properties: {
          subjectLine: { type: Type.STRING },
          body: { type: Type.STRING },
        },
      },
      variants: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["role", "headline", "summary"],
          properties: {
            role: { type: Type.STRING },
            headline: { type: Type.STRING },
            summary: { type: Type.STRING },
          },
        },
      },
      "import-analysis": {
        type: Type.OBJECT,
        required: ["detectedSections", "extractedHighlights", "parsingNotes"],
        properties: {
          detectedSections: { type: Type.ARRAY, items: { type: Type.STRING } },
          extractedHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
          parsingNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
      "screenshot-template": {
        type: Type.OBJECT,
        required: ["templateId", "rationale", "palette", "typography"],
        properties: {
          templateId: { type: Type.STRING },
          rationale: { type: Type.ARRAY, items: { type: Type.STRING } },
          palette: { type: Type.ARRAY, items: { type: Type.STRING } },
          typography: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    };

    const prompt = `
      You are Resume Studio Pro's AI assistant.
      Use model gemini-2.5-flash behavior: concise, structured, practical, and recruiter-friendly.
      Action: ${action}
      Payload:
      ${JSON.stringify(body).slice(0, 24000)}
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schemaByAction[action],
      },
    });

    return {
      statusCode: 200,
      body: result.text ?? JSON.stringify(buildFallback(action, body)),
      headers: { "Content-Type": "application/json" },
    };
  } catch (error: any) {
    return {
      statusCode: 200,
      body: JSON.stringify(buildFallback("optimize", {})),
      headers: { "Content-Type": "application/json" },
    };
  }
};
