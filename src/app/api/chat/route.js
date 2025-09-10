import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  try {
    const { query } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const websiteInfo = `
      Website Name: QuizPilot
      Purpose: Online quiz platform for learning and testing knowledge
      Features: User registration, multiple quiz categories, score tracking, analytics
      Target Audience: Students, educators, quiz enthusiasts
    `;

    const teamInfo = `
      Team Members:
      1. Rifat → https://ibrahimrifatpro.web.app/
      2. Rayhan → https://rayhab-portfolio.vercel.app/
      3. Rakib → https://rakibhasansohag-v2.vercel.app
      4. Sufian → https://abusufian.tech/
      5. Shahabb → https://ammar-shahahb-porfolio.vercel.app/
      6. Robiul → http://robiul-mern-portfolio.vercel.app/
    `;

    const prompt = `
      You are a helpful assistant for the website QuizPilot.
      - Give short and precise answers (1-3 sentences) when possible.
      - Only provide longer explanations if the question requires depth.
      - Use this context when relevant: 
      ${websiteInfo}

      If the user asks about the team, respond with their names and portfolio links:
      ${teamInfo}

      Question: ${query}
    `;


    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } },
    });

    return new Response(JSON.stringify({ answer: response.text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });


  } catch (err) {
    console.error("GenAI error:", err);
    return new Response(JSON.stringify({ error: "Failed to get response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
