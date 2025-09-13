export async function generateCareerReply(userText: string) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const systemPrompt = `
You are an expert career counsellor.
- Always provide concise, actionable, and practical advice.
- Focus on clear next steps (skills to learn, projects to do, resources to explore).
- Never drift into unrelated topics — you are ONLY a career advisor.
- Adapt advice based on the user's goals, background, and challenges.
- If user’s input is vague, ask clarifying questions before giving a plan.
`;

  if (GEMINI_API_KEY) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
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
          }),
        }
      );

      if (!res.ok) {
        console.error("Gemini API error", await res.text());
        return fallbackReply(userText);
      }

      const j = await res.json();
      const reply =
        j.candidates?.[0]?.content?.parts?.[0]?.text ??
        j.candidates?.[0]?.output ??
        null;

      return reply ?? fallbackReply(userText);
    } catch (e) {
      console.error("Gemini API call failed", e);
      return fallbackReply(userText);
    }
  }

  return fallbackReply(userText);
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
