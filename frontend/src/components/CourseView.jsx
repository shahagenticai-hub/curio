import ModuleCard from "./ModuleCard.jsx";

export default function CourseView({ course }) {
  return (
    <div>
      <div className="course-header">
        <h2>{course.title}</h2>
        <p>{course.description}</p>
      </div>

      {course.modules.map((module, i) => (
        <ModuleCard module={module} index={i} key={i} defaultOpen={i === 0} />
      ))}
    </div>
  );
}
