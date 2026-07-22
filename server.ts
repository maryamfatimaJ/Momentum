import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // Helper function to get Gemini instance lazily
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Momentum AI Habit Tracker" });
  });

  // AI Endpoint: Natural Language Habit Creation
  app.post("/api/gemini/parse-habit", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getAi();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Extract habit details from this natural language prompt: "${prompt}". Return a structured JSON object representing the habit.`,
        config: {
          systemInstruction: "You are Momentum's AI Habit Architect. Parse the user's natural prompt into a well-defined habit. Select suitable defaults if details like reminder time or icon are not mentioned.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Short title of the habit (e.g. Morning Exercise)" },
              category: { type: Type.STRING, description: "Category: Fitness, Mindset, Health, Focus, Growth, or Wellness" },
              iconName: { type: Type.STRING, description: "Lucide icon name: Activity, Dumbbell, Droplets, BookOpen, Brain, Flame, Heart, Smile, Sun, Moon, Coffee, Code, Compass, Zap, CheckCircle2" },
              color: { type: Type.STRING, description: "Hex color code: #63C7D8 (Cyan), #A8E6CF (Mint), #C7B8FF (Lavender), #FFD78C (Amber), #7ED6A7 (Emerald), or #F4A7A7 (Rose)" },
              frequency: { type: Type.STRING, description: "Frequency: Daily, Weekly, or Monthly" },
              targetValue: { type: Type.NUMBER, description: "Target number if applicable, e.g. 30, 2, 10, or 1 for boolean" },
              targetUnit: { type: Type.STRING, description: "Target unit if applicable, e.g. mins, L, pages, steps, or times" },
              reminderTime: { type: Type.STRING, description: "Suggested reminder time in HH:MM 24hr format, e.g. 07:30" },
              notes: { type: Type.STRING, description: "A encouraging micro-tip or reminder for this habit" }
            },
            required: ["title", "category", "iconName", "color", "frequency", "targetValue", "targetUnit"]
          }
        }
      });

      const habitData = JSON.parse(response.text || "{}");
      res.json({ success: true, habit: habitData });
    } catch (error: any) {
      console.error("Parse Habit Error:", error);
      res.status(500).json({ error: error.message || "Failed to parse habit" });
    }
  });

  // AI Endpoint: Habit Coach Insights & Recovery Plan
  app.post("/api/gemini/coach-insight", async (req, res) => {
    try {
      const { habits, currentStreak, completionRate, missedHabits, userGoal } = req.body;
      const ai = getAi();

      const promptContext = `
User Data Context:
- Current overall streak: ${currentStreak || 0} days
- Today's completion rate: ${completionRate || 0}%
- Total active habits: ${habits ? habits.length : 0}
- Missed habits recently: ${JSON.stringify(missedHabits || [])}
- User primary focus/goal: ${userGoal || "Personal growth and daily consistency"}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: promptContext,
        config: {
          systemInstruction: "You are Momentum's empathetic, highly perceptive AI Habit Coach (inspired by Headspace and Apple Health). Deliver concise, calm, actionable insights that inspire daily action without causing stress. If there are missed streaks, offer a gentle recovery plan.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING, description: "Short motivational headline, max 8 words" },
              insight: { type: Type.STRING, description: "1-2 sentence core observation about current progress" },
              tip: { type: Type.STRING, description: "1 tactical action step for today" },
              recoveryPlan: { type: Type.STRING, description: "If habits were missed, a low-friction 1-step reset strategy; otherwise an encouragement" },
              detectedWeakness: { type: Type.STRING, description: "Name of habit needing focus or empty if none" },
              motivationalQuote: { type: Type.STRING, description: "Original inspiring quote for Momentum" }
            },
            required: ["headline", "insight", "tip", "recoveryPlan", "motivationalQuote"]
          }
        }
      });

      const coachData = JSON.parse(response.text || "{}");
      res.json({ success: true, coach: coachData });
    } catch (error: any) {
      console.error("Coach Insight Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI insight" });
    }
  });

  // AI Endpoint: Ask AI Coach a free-text question, grounded in current stats
  app.post("/api/gemini/ask-coach", async (req, res) => {
    try {
      const { question, currentStreak, completionRate, activeHabitsCount } = req.body;
      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Question is required" });
      }

      const ai = getAi();

      const promptContext = `
User Question: "${question}"

User Data Context:
- Current streak: ${currentStreak || 0} days
- Today's completion rate: ${completionRate || 0}%
- Total active habits: ${activeHabitsCount || 0}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: promptContext,
        config: {
          systemInstruction: "You are Momentum's empathetic AI Habit Coach. Answer the user's specific question directly, concisely (2-4 sentences), calmly, and actionably, grounding your answer in their habit data context when relevant.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING, description: "Direct answer to the user's question, 2-4 sentences" }
            },
            required: ["reply"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, reply: data.reply || "Keep building consistency with small, incremental steps." });
    } catch (error: any) {
      console.error("Ask Coach Error:", error);
      res.status(500).json({ error: error.message || "Failed to reach AI Coach" });
    }
  });

  // AI Endpoint: AI Weekly Review
  app.post("/api/gemini/weekly-review", async (req, res) => {
    try {
      const { historyData, activeHabitsCount } = req.body;
      const ai = getAi();

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Weekly performance log data: ${JSON.stringify(historyData || [])}, Active Habits: ${activeHabitsCount || 5}`,
        config: {
          systemInstruction: "You are Momentum's Weekly Review AI. Summarize performance, highlight winning habits, and give 3 key takeaways for next week in a crisp, premium tone.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "Weekly executive summary" },
              scoreGrade: { type: Type.STRING, description: "Consistency Grade e.g. A+, A, B+" },
              strongestHabit: { type: Type.STRING, description: "Name of the habit with highest compliance" },
              focusArea: { type: Type.STRING, description: "Habit or time slot to improve" },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 strategic micro-improvements for next week"
              }
            },
            required: ["summary", "scoreGrade", "strongestHabit", "focusArea", "recommendations"]
          }
        }
      });

      const reviewData = JSON.parse(response.text || "{}");
      res.json({ success: true, review: reviewData });
    } catch (error: any) {
      console.error("Weekly Review Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate weekly review" });
    }
  });

  // AI Endpoint: AI Habit Suggestions
  app.post("/api/gemini/suggest-habits", async (req, res) => {
    try {
      const { userInterest } = req.body;
      const ai = getAi();

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Suggest 4 high-impact habits tailored for someone aiming to improve in "${userInterest || 'General Life & Focus'}".`,
        config: {
          systemInstruction: "You are Momentum AI. Provide 4 actionable, beautifully framed habits with specific metrics.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                iconName: { type: Type.STRING },
                color: { type: Type.STRING },
                targetValue: { type: Type.NUMBER },
                targetUnit: { type: Type.STRING },
                reasoning: { type: Type.STRING, description: "Why this habit creates high momentum" }
              },
              required: ["title", "category", "iconName", "color", "targetValue", "targetUnit", "reasoning"]
            }
          }
        }
      });

      const suggestions = JSON.parse(response.text || "[]");
      res.json({ success: true, suggestions });
    } catch (error: any) {
      console.error("Suggest Habits Error:", error);
      res.status(500).json({ error: error.message || "Failed to suggest habits" });
    }
  });

  // Vite middleware for development vs static serve for production
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
    console.log(`Momentum server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
