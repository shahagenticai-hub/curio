import { useState } from "react";
import ResourceCard from "./ResourceCard.jsx";

export default function ModuleCard({ module, index, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="module">
      <div className="module-header" onClick={() => setOpen((o) => !o)}>
        <span className="module-number">{String(index + 1).padStart(2, "0")}</span>
        <h3>{module.title}</h3>
        <span className="module-toggle">{open ? "hide" : "show"}</span>
      </div>

      {open && (
        <div className="lessons">
          {module.lessons.map((lesson, i) => (
            <div className="lesson" key={i}>
              <h4>{lesson.title}</h4>
              <p>{lesson.description}</p>
              {lesson.resources && lesson.resources.length > 0 ? (
                <div className="resources">
                  {lesson.resources.map((r, j) => (
                    <ResourceCard resource={r} key={j} />
                  ))}
                </div>
              ) : (
                <span className="no-resources">No video match found for this lesson yet.</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
