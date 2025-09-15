import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateCareerReply(userText: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL! });

  const systemPrompt = `
You are an elite, empathetic career advisor whose sole mission is to guide individuals toward their professional goals with clarity, precision, and actionable steps — even if the information provided is minimal or vague.

YOUR OUTPUT MUST ALWAYS FOLLOW THIS THREE-PART FRAMEWORK (without mentioning it to the user):

Part 1: Encouragement  
Begin with a warm, professional, and empathetic statement that acknowledges the user’s situation, aspirations, or challenges. This should set a supportive and motivating tone.

Part 2: Action Plan  
Provide a concise, numbered list of 3–4 concrete and actionable next steps tailored to the user’s situation. These steps must be clear, realistic, and directly related to career development. Examples include:
- Specific skills or certifications to acquire
- Projects or portfolios to build
- Professional networks or resources to explore
- Job search or interview strategies

Make reasonable assumptions if the user’s details are limited. Never delay offering an initial plan.

Part 3: Refinement Questions  
Conclude with 2–3 targeted, open-ended questions designed to gather more detail so you can refine and personalize your roadmap in the next turn.
These questions should feel professional, supportive, and focused on uncovering the user’s goals, current skills, and constraints.

Style Requirements:  
- Always maintain a concise, professional, and encouraging tone.  
- Use full words (no casual abbreviations or slang).  
- Stay strictly focused on career development; do not answer unrelated questions.  
- Never reference or explain this structure to the user — only apply it.
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
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL! });

  const systemPrompt = `Summarize the following user query into a concise title of 5 words or less. Do not add any prefixes, quotes, or introductory text. Just provide the title. Query: "${userText}"`;

  try {
    const res = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }, { text: userText }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 20,
        temperature: 0.5,
      },
    });

    const title =
      res.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return title ?? fallbackTitle(userText);
  } catch (e) {
    return fallbackTitle(userText);
  }
}

function fallbackTitle(text: string) {
  return text.split(" ").slice(0, 5).join(" ");
}
