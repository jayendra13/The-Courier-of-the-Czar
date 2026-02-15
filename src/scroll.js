import scrollama from 'scrollama';
import { sections } from './config.js';
import { getMap, flyTo, setTerrain, setFog, setRiverVisibility, setRegionVisibility, updateCityStates, setMapLabels } from './map.js';
import { updateRouteLine } from './route.js';
import { updateProgress } from './progress.js';

let scroller;
let currentIndex = 0;
const onSectionChange = [];

export function onSection(fn) {
  onSectionChange.push(fn);
}

export function getCurrentIndex() {
  return currentIndex;
}

export function initScroll() {
  scroller = scrollama();

  scroller
    .setup({
      step: '.step',
      offset: 0.5,
      progress: true,
      debug: false,
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit)
    .onStepProgress(handleStepProgress);

  window.addEventListener('resize', scroller.resize);
}

function handleStepEnter({ index }) {
  console.log('Entered section', index);
  currentIndex = index;
  const section = sections[index];
  if (!section) return;

  // Update active step styling
  document.querySelectorAll('.step').forEach((el, i) => {
    el.classList.toggle('is-active', i === index);
  });

  // Map operations — guard in case map isn't ready
  const map = getMap();
  if (map) {
    // Set layer state before camera animation so terrain/elevation
    // is resolved when flyTo calculates the camera path
    const ops = [
      () => setTerrain(section.terrain),
      () => setFog(section.fog),
      () => setRiverVisibility(section.rivers || []),
      () => setRegionVisibility(section.regions || []),
      () => setMapLabels(section.labels || []),
      () => updateCityStates(section.distanceKm),
      () => updateRouteLine(section.distanceKm),
      () => flyTo(section.camera),
    ];
    for (const op of ops) {
      try { op(); } catch (e) { console.warn('Map update error at section', index, e); }
    }
  }
  // Progress bar
  updateProgress(section.distanceKm);

  // Header title visibility (hide on first section)
  const headerTitle = document.querySelector('.site-header__title');
  if (headerTitle) {
    headerTitle.classList.toggle('visible', index > 0);
  }

  // Notify listeners (nav dots)
  onSectionChange.forEach((fn) => fn(index));
}

function handleStepExit({ index, direction }) {
  // When scrolling up past a step, re-activate the one above it
  if (direction === 'up' && index > 0) {
    handleStepEnter({ index: index - 1 });
  }
}

function handleStepProgress({ index, progress }) {
  const section = sections[index];
  const nextSection = sections[index + 1];
  if (!section || !nextSection) return;

  // Interpolate distance for smooth progress bar
  const distRange = nextSection.distanceKm - section.distanceKm;
  const interpDist = section.distanceKm + distRange * progress;
  updateProgress(interpDist);
}

/**
 * Scroll to a specific section by index.
 */
export function scrollToSection(index) {
  const steps = document.querySelectorAll('.step');
  if (steps[index]) {
    steps[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Re-trigger the map update for the current scroll section.
 * Call after async map init to sync the map with where the user has scrolled.
 */
export function syncCurrentSection() {
  handleStepEnter({ index: currentIndex });
}
