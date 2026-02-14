import 'maplibre-gl/dist/maplibre-gl.css';
import './style/variables.css';
import './style/main.css';
import './style/narrative.css';

import { initMap, setBaseLayer, getBaseMode } from './map.js';
import { renderNarrative } from './narrative.js';
import { initRoute } from './route.js';
import { initScroll, onSection, scrollToSection, syncCurrentSection } from './scroll.js';
import { initProgress } from './progress.js';
import { sections } from './config.js';

async function main() {
  // Render narrative cards
  const narrativeContainer = document.querySelector('.scrolly__narrative');
  renderNarrative(narrativeContainer);

  // Init chapter nav dots
  initNav();

  // Init progress bar (doesn't depend on map)
  initProgress();

  // Init scroll observer (must come after DOM is built, but doesn't need map)
  initScroll();

  // Init map, route (async — scroll works even if map fails to load)
  try {
    await initMap();
    initRoute();
    initBasemapToggle();
    // Map loaded after scroll init — sync map to wherever the user has scrolled
    syncCurrentSection();
  } catch (e) {
    console.error('Map init error:', e);
  }
}

function initNav() {
  const dotsContainer = document.querySelector('.chapter-dots');
  if (!dotsContainer) return;

  sections.forEach((section, i) => {
    const dot = document.createElement('button');
    dot.className = 'chapter-dots__dot';
    dot.title = section.title;
    dot.setAttribute('aria-label', `Jump to: ${section.title}`);
    dot.addEventListener('click', () => scrollToSection(i));
    dotsContainer.appendChild(dot);
  });

  // Listen for section changes to update active dot
  onSection((index) => {
    const dots = dotsContainer.querySelectorAll('.chapter-dots__dot');
    dots.forEach((dot, i) => {
      dot.classList.remove('active', 'visited');
      if (i === index) dot.classList.add('active');
      else if (i < index) dot.classList.add('visited');
    });
  });
}

function initBasemapToggle() {
  const buttons = document.querySelectorAll('.basemap-toggle__option');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode === getBaseMode()) return;
      buttons.forEach((b) => b.classList.remove('basemap-toggle__option--active'));
      btn.classList.add('basemap-toggle__option--active');
      setBaseLayer(mode);
      // Restore section fog for the new mode
      syncCurrentSection();
    });
  });
}

main();
