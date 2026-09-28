import Course from "../models/Course.js";
import { generateCourseOutline } from "../services/geminiService.js";
import { attachResourcesToModules } from "../services/youtubeService.js";

// POST /api/courses  { prompt: string }
export async function createCourse(req, res) {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Please provide a non-empty 'prompt' string." });
  }

  try {
    // 1. Ask Gemini to design the course outline (title, modules, lessons)
    const outline = await generateCourseOutline(prompt.trim());

    // 2. For every lesson, fetch real YouTube videos matching its topic
    const modulesWithResources = await attachResourcesToModules(outline.modules);

    // 3. Persist the finished course so it shows up in course history
    const course = await Course.create({
      prompt: prompt.trim(),
      title: outline.title,
      description: outline.description,
      modules: modulesWithResources,
    });

    res.status(201).json(course);
  } catch (err) {
    console.error("[createCourse] failed:", err);
    res.status(500).json({ error: "Failed to generate course. " + err.message });
  }
}

// GET /api/courses
export async function listCourses(req, res) {
  const courses = await Course.find()
    .select("title description prompt createdAt")
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(courses);
}

// GET /api/courses/:id
export async function getCourse(req, res) {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ error: "Course not found." });
  }

  res.json(course);
}
