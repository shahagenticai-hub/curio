const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function generateCourse(prompt) {
  const res = await fetch(`${BASE_URL}/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return handle(res);
}

export async function fetchCourseHistory() {
  const res = await fetch(`${BASE_URL}/courses`);
  return handle(res);
}

export async function fetchCourseById(id) {
  const res = await fetch(`${BASE_URL}/courses/${id}`);
  return handle(res);
}
