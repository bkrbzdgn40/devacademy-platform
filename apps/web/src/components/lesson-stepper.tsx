"use client";

import { useState, type ReactNode } from "react";

export type LessonStep = {
  id: string;
  label: string;
  title: string;
  content: ReactNode;
};

export function LessonStepper({ steps }: { steps: LessonStep[] }) {
  const [active, setActive] = useState(0);
  // Keep previously visited questions mounted so going back does not discard
  // in-page answers, but defer the editor until its stage is first opened.
  const [visited, setVisited] = useState<number[]>([0]);
  if (steps.length === 0) return null;

  function openStep(index: number) {
    if (index < 0 || index >= steps.length) return;
    setActive(index);
    setVisited((old) => old.includes(index) ? old : [...old, index]);
  }

  return <div className="lesson-stepper">
    <nav className="lesson-stepper-nav" aria-label="Ders aşamaları">
      <ol>{steps.map((step, index) => <li key={step.id}>
        <button type="button" data-lesson-step={index}
          aria-current={active === index ? "step" : undefined}
          aria-controls={visited.includes(index) ? "lesson-step-panel-" + step.id : undefined}
          onClick={() => openStep(index)}>
          <span className="lesson-step-number">{index + 1}</span>
          <span>{step.label}</span>
        </button>
      </li>)}</ol>
    </nav>
    <p className="lesson-step-count" aria-live="polite">
      Aşama {active + 1} / {steps.length}. Tek seferde bir aşamaya odaklan; önceki yanıtlarına dönebilirsin.
    </p>
    {steps.map((step, index) => visited.includes(index) ? <section
      key={step.id} id={"lesson-step-panel-" + step.id}
      className="lesson-step-panel" aria-labelledby={"lesson-step-heading-" + step.id}
      hidden={active !== index}>
      <h2 id={"lesson-step-heading-" + step.id}>{step.title}</h2>
      {step.content}
    </section> : null)}
    <div className="lesson-step-actions">
      <button type="button" className="subtle-action" disabled={active === 0}
        onClick={() => openStep(active - 1)}>← Önceki aşama</button>
      {active < steps.length - 1 && <button type="button" className="primary-button"
        onClick={() => openStep(active + 1)}>Sonraki aşama →</button>}
    </div>
  </div>;
}
