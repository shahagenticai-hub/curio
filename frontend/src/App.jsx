import { useEffect, useState } from "react";
import PromptForm from "./components/PromptForm.jsx";
import CourseView from "./components/CourseView.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import { generateCourse, fetchCourseHistory, fetchCourseById } from "./api.js";

export default function App() {
  const [course, setCourse] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseHistory().then(setHistory).catch(() => {});
  }, []);

  async function handleGenerate(prompt) {
    setIsLoading(true);
    setError(null);
    try {
      const newCourse = await generateCourse(prompt);
      setCourse(newCourse);
      setHistory((h) => [{ ...newCourse }, ...h]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelectHistory(id) {
    setError(null);
    try {
      const selected = await fetchCourseById(id);
      setCourse(selected);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <div className="brand">
            <span className="brand-mark" />
            <span className="brand-name">Curio</span>
          </div>
          <h1>Turn one prompt into a full course, with the videos already picked out.</h1>
          <p className="sub">
            Describe what you want to learn. Gemini designs the curriculum, Curio finds
            matching lessons on YouTube for every step.
          </p>
          <PromptForm onGenerate={handleGenerate} isLoading={isLoading} />
          {error && <div className="error-banner">{error}</div>}
        </div>
      </header>

      <main className="main">
        <section>
          {isLoading && (
            <div className="loading-state">
              <strong>Designing your course...</strong>
              This calls Gemini for the outline, then searches YouTube for each lesson.
            </div>
          )}

          {!isLoading && !course && (
            <div className="empty-state">
              Enter what you want to learn above and Curio will build the course.
            </div>
          )}

          {!isLoading && course && <CourseView course={course} />}
        </section>

        <HistoryPanel history={history} onSelect={handleSelectHistory} />
      </main>
    </div>
  );
}
