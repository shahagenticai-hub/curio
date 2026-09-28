import { GoogleGenAI, Type } from "@google/genai";

// The client automatically reads process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// We force Gemini to answer in this exact shape so the backend never has
// to guess-parse free-form text. This is what "structured output" means.
const courseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Short, catchy course title" },
    description: {
      type: Type.STRING,
      description: "1-2 sentence summary of what the learner will achieve",
    },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          lessons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: {
                  type: Type.STRING,
                  description: "2-3 sentences explaining what this lesson covers",
                },
                searchQuery: {
                  type: Type.STRING,
                  description:
                    "A short, specific YouTube search query (3-6 words) that would find a good tutorial video for exactly this lesson",
                },
              },
              required: ["title", "description", "searchQuery"],
            },
          },
        },
        required: ["title", "lessons"],
      },
    },
  },
  required: ["title", "description", "modules"],
};

const SYSTEM_INSTRUCTION = `You are an expert curriculum designer. Given a single learning
request from a student, design a complete, well-sequenced course outline.

Rules:
- Produce between 3 and 6 modules, ordered from foundational to advanced.
- Each module should have between 2 and 5 lessons.
- Lesson descriptions must be concrete and specific to the topic, not generic filler.
- Every lesson needs a "searchQuery" - a precise phrase a student could paste into
  YouTube search to find a real, relevant tutorial for that exact lesson.
- Keep the whole outline realistic for a self-paced learner to actually finish.`;

/**
 * Calls Gemini with a learner's free-text prompt and returns a structured
 * course outline: { title, description, modules: [{ title, lessons: [...] }] }
 */
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.8-flash";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// "Busy" errors are temporary (overloaded servers or rate limits), so retrying makes sense.
function isBusyError(err) {
  const msg = String(err?.message || "");
  return msg.includes("503") || msg.includes("429") || msg.includes("UNAVAILABLE");
}

async function callGemini(model, userPrompt) {
  return ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [{ text: `Learner's request: "${userPrompt}"` }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: courseSchema,
      temperature: 0.6,
    },
  });
}

/**
 * Generates a structured course outline from a learner's prompt.
 * Tries the main model first; if Gemini is busy, retries once, then
 * falls back to a second model before giving up.
 */
export async function generateCourseOutline(userPrompt) {
  const models = [MODEL, FALLBACK_MODEL];
  let lastError;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await callGemini(model, userPrompt);
        const text = response.text;

        if (!text) {
          throw new Error("Gemini returned an empty response.");
        }

        return JSON.parse(text);
      } catch (err) {
        lastError = err;

        // Only retry temporary "busy" errors. Anything else is a real bug, so fail fast.
        if (!isBusyError(err)) throw err;

        console.warn(`[gemini] ${model} busy (attempt ${attempt}), retrying...`);
        await sleep(1500 * attempt);
      }
    }
  }

  throw lastError;
}
