import { cities } from './data/cities.js';
import { TOTAL_DISTANCE_KM } from './config.js';

let fillEl;
let labelEl;
let tickEls = [];

export function initProgress() {
  const bar = document.querySelector('.progress-bar');
  if (!bar) return;

  fillEl = bar.querySelector('.progress-bar__fill');
  labelEl = bar.querySelector('.progress-bar__label--current');

  // Create tick marks for each city
  const track = bar.querySelector('.progress-bar__track');
  cities.forEach((city) => {
    const pct = (city.distanceKm / TOTAL_DISTANCE_KM) * 100;
    const tick = document.createElement('div');
    tick.className = 'progress-bar__tick';
    tick.style.left = `${pct}%`;
    tick.title = city.name;
    track.appendChild(tick);
    tickEls.push({ el: tick, distanceKm: city.distanceKm });
  });
}

export function updateProgress(distanceKm) {
  const pct = Math.min((distanceKm / TOTAL_DISTANCE_KM) * 100, 100);

  if (fillEl) {
    fillEl.style.width = `${pct}%`;
  }

  if (labelEl) {
    const versts = Math.round(distanceKm * 1.0668); // 1 km ≈ 1.0668 versts
    labelEl.textContent = `${versts.toLocaleString()} versts`;
  }

  // Update tick states
  tickEls.forEach(({ el, distanceKm: tickDist }) => {
    el.classList.toggle('visited', tickDist <= distanceKm);
  });
}
