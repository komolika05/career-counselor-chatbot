export async function generateCareerReply(userText: string) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const systemPrompt = `You are a helpful, pragmatic AI career counsellor. Give concise, actionable advice and suggested next steps.`;

  // If API key is present, call OpenAI (chat completion)
  if (GEMINI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userText },
          ],
          max_tokens: 500,
        }),
      });

      if (!res.ok) {
        console.error("OpenAI error", await res.text());
        return fallbackReply(userText);
      }
      const j = await res.json();
      const reply = j.choices?.[0]?.message?.content;
      return reply ?? fallbackReply(userText);
    } catch (e) {
      console.error("OpenAI call failed", e);
      return fallbackReply(userText);
    }
  }

  // no API key -> return a simple rule-based reply (free)
  return fallbackReply(userText);
}

function fallbackReply(text: string) {
  // very simple keyword-based fallback (expand as you like)
  const t = text.toLowerCase();
  if (
    t.includes("frontend") ||
    t.includes("react") ||
    t.includes("javascript")
  ) {
    return `If you're interested in frontend development: start with HTML/CSS basics, learn JavaScript (ES6+), then React. Build small projects (todo, portfolio) and learn one styling approach (Tailwind/CSS Modules). Consider GitHub portfolio + small freelancing jobs. Next steps: 1) finish 3 projects, 2) prepare 10 interview questions.`;
  }
  if (t.includes("data") || t.includes("machine") || t.includes("ai")) {
    return `For data/ML careers: strengthen Python, statistics, and basic ML. Learn pandas, scikit-learn, and one deep learning framework (PyTorch). Do 2-3 projects and explain your evaluation approach. Next steps: 1) complete a Kaggle micro-project, 2) write a short case study.`;
  }
  return `Thanks for sharing — here's a short plan: 1) clarify short-term goal (6-12 months), 2) list required skills, 3) pick 2-3 small projects to demonstrate those skills, 4) build a short study schedule. Tell me your current background (education / experience) and I will make the plan specific.`;
}
