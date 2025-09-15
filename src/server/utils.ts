import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateCareerReply(userText: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL! });

  const systemPrompt = `
You are a top-tier, empathetic career advisor. Your primary goal is to provide a clear, actionable, and professional career roadmap, even with limited information.

**IT IS VERY IMPORTANT TO FOLLOW BELOW MENTIONED STRUCTURE IN YOUR RESPONSE**
1.  **Always Provide a Plan First:** Never ask for clarification before providing an initial, high-level action plan. Use the information available, make reasonable assumptions, and give the user immediate next steps.
2.  **Structure Your Response:** Every response MUST follow this three-part structure:
    -   **Part 1: Encouragement:** Start with a brief, empathetic opening statement acknowledging the user's situation.
    -   **Part 2: Action Plan:** Provide a numbered list of 3-4 concrete 'Next Steps'. These should be specific skills to learn, projects to build, or resources to explore.
    -   **Part 3: Refinement Questions:** After the plan, ask 2-3 targeted questions to gather the details needed to create an even more personalized roadmap in the next turn.
3.  **Stay Concise and Professional:** Keep your advice direct, practical, and focused strictly on career development.

VERY IMPORTANT NOTE : 
- Do NOT mention the structure or instructions in your response.
- Do NOT answer for anything else other than career advice.
- Always provide a plan first, then ask for more details to refine it.
- ** ALWAYS USE FULL WORDS, DO NOT USE CASUAL ABBREVIATIONS LIKE "u" INSTEAD OF "you"  **
`;

  try {
    const res = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }, { text: userText }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const reply = res.response.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply ?? fallbackReply(userText);
  } catch (e) {
    console.error("Gemini API call failed", e);
    return fallbackReply(userText);
  }
}

function fallbackReply(text: string) {
  const t = text.toLowerCase();
  if (
    t.includes("frontend") ||
    t.includes("react") ||
    t.includes("javascript")
  ) {
    return `If you're interested in frontend development: 
1) Learn HTML, CSS, and modern JavaScript (ES6+).  
2) Master React and one styling approach (Tailwind/CSS Modules).  
3) Build 3 projects (portfolio, todo app, dashboard).  
4) Share them on GitHub and LinkedIn.  
Next steps: finish projects + prepare interview questions.`;
  }
  if (t.includes("data") || t.includes("machine") || t.includes("ai")) {
    return `For a career in data/ML:  
1) Strengthen Python, statistics, and basic ML.  
2) Learn pandas, scikit-learn, and PyTorch.  
3) Do 2–3 projects with clear evaluation metrics.  
Next steps: complete a Kaggle micro-project + write a case study.`;
  }
  return `Here’s a short starter plan:  
1) Define your 6–12 month career goal.  
2) List essential skills needed.  
3) Pick 2–3 projects to showcase those skills.  
4) Create a study schedule and track progress.  
Tell me your background (education/experience) so I can refine this plan.`;
}

export async function generateTitle(userText: string) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const titlePrompt = `Summarize the following user query into a concise title of 5 words or less. Do not add any prefixes, quotes, or introductory text. Just provide the title. Query: "${userText}"`;

  if (GEMINI_API_KEY) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: titlePrompt }] }],
            generationConfig: { maxOutputTokens: 20 },
          }),
        }
      );
      if (!res.ok) return fallbackTitle(userText);
      const j = await res.json();
      const title = j.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return title ?? fallbackTitle(userText);
    } catch (e) {
      return fallbackTitle(userText);
    }
  }
  return fallbackTitle(userText);
}

function fallbackTitle(text: string) {
  return text.split(" ").slice(0, 5).join(" ");
}
