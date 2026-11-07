# Wind en water / Wind and Water

An interactive map of nearly 20,000 mills in the Netherlands, 1200–2026: when they were built, when they disappeared, which still stand, and how drainage mills and later pumping stations kept the polders dry. Dutch and English.

Plain HTML, CSS and JavaScript. No build step, no framework, no npm.

## Run it locally

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000/>. Opening `index.html` straight from disk also works in most browsers, but a local server is closer to how it runs online.

## Layout

```
index.html          page structure
css/style.css       all styling
js/                 the app, as plain scripts loaded in order (they share one scope)
  01-i18n.js          Dutch and English text
  02-records.js       unpacks the mill records, filters
  03-landscape.js     palaeogeographic maps, drained lakes, sprites
  04-view.js          canvas size, fit, resize
  05-time.js          year, playback, intro
  06-ui.js            panel, legend, notes
  07-chart.js         counts and the timeline chart
  08-interaction.js   pan, zoom, hover, tooltips, keyboard
  09-basemap.js       PDOK map tiles, landscape drawing
  10-mills.js         drawing the mills
  11-lens.js          magnifier, screen-reader announcements
  12-events.js        floods and depolderings (curated list)
  13-main.js          frame loop and start-up
data/data.js        generated data (records, landscape rasters, drained lakes)
tools/prep.py       builds data/data.js from the source downloads
tools/tr.py         Dutch to English vocabulary for mill types and functions
tests/smoke.py      loads the page in a headless browser and fails on JS errors
```

Order matters: each script may use what the earlier ones define. Anything that starts work asynchronously (image loading, timers) is kicked off from `13-main.js`, after every script has loaded.

## Rebuilding the data

Put the source GeoJSON files in `raw/` (not committed) and run:

```sh
pip install pillow
python3 tools/prep.py raw data/data.js
```

Expected files in `raw/`: `molens.geojson`, `weidemolens.geojson`, `verdwenen_molens.geojson`, `gemalen.geojson`, `droogmakerijen.geojson`, and `paleogeografie1250nc.geojson`, `paleogeografie1500nc.geojson`, `paleogeografie1850nc.geojson`, `paleogeografie2000nc.geojson`.

## Sources

- Mills, lost mills, pumping stations and drained lakes: datasets of the Rijksdienst voor het Cultureel Erfgoed (RCE).
- Landscape: palaeogeographic maps of the Netherlands (1250, 1500, 1850, 2000).
- Street map: BRT-Achtergrondkaart, © Kadaster / PDOK, CC BY 4.0.
- Floods and depolderings: a curated list in `js/12-events.js`, each entry checked against a source other than an AI summary.

TODO before publishing: confirm the licence terms of each RCE dataset and of the palaeogeographic maps, and choose a licence for this code.
