import { GoogleGenAI, Type } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required to use AI features.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "resume-studio-pro-netlify",
      },
    },
  });
};

export const handler = async (event: any) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { jobDescription, focus } = body;

    if (!jobDescription || typeof jobDescription !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "jobDescription is required and must be a string." }),
      };
    }

    const ai = getGeminiClient();
    const systemInstruction = `
      You are an expert executive resume writing assistant and matching engine.
      Your task is to analyze M. Sujitha's professional resume against a provided job description.
      You must evaluate the alignment score (0 to 100), identify matching strengths and skill gaps,
      craft a customized headline and executive summary, recommend which specific projects to highlight with matching angles,
      and write a high-impact cover letter.

      Sujitha's Resume Context:
      - 13+ years of total software experience. Evolved from lead PHP/web developer into Technical Project Manager.
      - Deep certifications: Google Project Management Specialization, 10+ Google and IBM AI / Generative AI courses.
      - Experience:
        * BrainCert (Jan 2021 - Present): Project Manager (5.5 yrs) leading 10+ people, improving delivery efficiency by 20-25%. Managed unified SaaS classroom / virtual whiteboard platform.
        * BrainCert Project Lead/Team Lead (1.5 yrs): managed code reviews, database optimization, MySQL.
        * Senior PHP Developer and Project Lead across multiple solutions: Laravel (4.2-5.3), CodeIgniter, Slim PHP UI integrations, API engineering.

      Guidelines:
      1. Emphasize how her technical developer background (PHP, Laravel, databases) makes her an exceptional TECHNICAL Project Manager or Tech Lead who understands development realities.
      2. Leverage her strong GenAI credentials (Google & IBM prompt engineering Certifications) for modern, AI-aware setups.
      3. Keep the tone executive, confident, pragmatic, and professional.
    `;

    const prompt = `Analyze this Job Description:\n${jobDescription.slice(0, 15000)}\n\nTarget Focus Area requested by user: ${focus || "balanced"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "score",
            "strengths",
            "gaps",
            "tailoredHeadline",
            "tailoredSummary",
            "highlightedProjects",
            "coverLetter",
            "interviewPrep",
          ],
          properties: {
            score: { type: Type.INTEGER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            tailoredHeadline: { type: Type.STRING },
            tailoredSummary: { type: Type.STRING },
            highlightedProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["projectId", "projectName", "matchingAngle"],
                properties: {
                  projectId: { type: Type.STRING },
                  projectName: { type: Type.STRING },
                  matchingAngle: { type: Type.STRING },
                },
              },
            },
            coverLetter: { type: Type.STRING },
            interviewPrep: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI engine");
    }

    return {
      statusCode: 200,
      body: responseText.trim(),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error: any) {
    console.error("AI Tailor Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "An unexpected error occurred during analysis." }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
};
