import { sections } from './config.js';

/**
 * Generate all step DOM elements from config sections.
 */
export function renderNarrative(container) {
  sections.forEach((section) => {
    const step = document.createElement('section');
    step.className = `step${section.isTitle ? ' step--title' : ''}${section.isConclusion ? ' step--conclusion' : ''}`;
    step.dataset.section = section.id;
    step.dataset.index = sections.indexOf(section).toString();

    if (section.isTitle) {
      step.innerHTML = buildTitleCard(section);
    } else if (section.isConclusion) {
      step.innerHTML = buildConclusionCard(section);
    } else {
      step.innerHTML = buildStandardCard(section);
    }

    container.appendChild(step);
  });
}

function buildTitleCard(section) {
  return `
    <div class="card">
      <h1 class="card__title">${section.title}</h1>
      <p class="card__subtitle">${section.subtitle}</p>
      <hr class="card__divider">
      <blockquote class="card__excerpt">${section.excerpt}</blockquote>
      <p class="card__summary">${section.summary}</p>
      <div class="scroll-prompt">
        <span>Begin the journey</span>
        <span class="scroll-prompt__arrow">&darr;</span>
      </div>
    </div>
  `;
}

function buildStandardCard(section) {
  return `
    <div class="card">
      ${section.label ? `<span class="card__label">${section.label}</span>` : ''}
      <h2 class="card__title">${section.title}</h2>
      <div class="card__meta">
        <span>${section.meta}</span>
      </div>
      <hr class="card__divider">
      <blockquote class="card__excerpt">${section.excerpt}</blockquote>
      <p class="card__summary">${section.summary}</p>
    </div>
  `;
}

function buildConclusionCard(section) {
  return `
    <div class="card">
      ${section.label ? `<span class="card__label">${section.label}</span>` : ''}
      <h2 class="card__title">${section.title}</h2>
      <div class="card__meta">
        <span>${section.meta}</span>
      </div>
      <hr class="card__divider">
      <blockquote class="card__excerpt">${section.excerpt}</blockquote>
      <p class="card__summary">${section.summary}</p>
      <div class="card__stats">
        <div class="card__stat">
          <span class="card__stat-value">5,200</span>
          <span class="card__stat-label">Versts</span>
        </div>
        <div class="card__stat">
          <span class="card__stat-value">14</span>
          <span class="card__stat-label">Cities</span>
        </div>
        <div class="card__stat">
          <span class="card__stat-value">82</span>
          <span class="card__stat-label">Days</span>
        </div>
      </div>
    </div>
  `;
}
