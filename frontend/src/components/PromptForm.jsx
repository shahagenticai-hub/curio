import { useState } from "react";

export default function PromptForm({ onGenerate, isLoading }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onGenerate(value.trim());
  }

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. Teach me React from scratch for someone who already knows JavaScript"
        disabled={isLoading}
      />
      <div className="prompt-row">
        <span className="hint">One prompt in, a full course out.</span>
        <button className="primary" type="submit" disabled={isLoading}>
          {isLoading ? "Building your course..." : "Generate course"}
        </button>
      </div>
    </form>
  );
}
