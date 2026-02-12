# The Courier of the Czar

A scrollytelling map tracing Michael Strogoff's 5,500 km journey from Moscow to Irkutsk, based on Jules Verne's 1876 novel *Michael Strogoff*.

**[Live demo](https://jayendra13.github.io/The-Courier-of-the-Czar/)**

## What it does

Scroll through 20 narrative sections while an interactive map flies across Russia, revealing the route, rivers, mountain terrain, and atmospheric mood changes that match the story.

- Progressive route line from Moscow to Irkutsk via Turf.js
- 3D terrain for the Ural Mountains and Lake Baikal
- Per-section fog/atmosphere, river highlights, and region overlays
- Authentic excerpts from the original text
- Progress bar tracking distance in versts

## Tech stack

| Component | Library |
|-----------|---------|
| Map | [MapLibre GL JS](https://maplibre.org/) v4 |
| Tiles | [CartoDB Voyager](https://carto.com/basemaps/) (free, no API key) |
| Terrain | [AWS Elevation Tiles](https://registry.opendata.aws/terrain-tiles/) |
| Scroll | [Scrollama](https://github.com/russellsamora/scrollama) v3 |
| Route math | [Turf.js](https://turfjs.org/) |
| Build | [Vite](https://vite.dev/) |

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output goes to `dist/`. Deployed automatically to GitHub Pages on push to `main`.

## License

[MIT](LICENSE)
