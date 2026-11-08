# Molens door de eeuwen heen / Dutch Mills Through the Ages

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
fonts/              Inter Tight, self-hosted (no requests to Google)
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

Expected files in `raw/`: `molens.geojson`, `weidemolens.geojson`, `verdwenen_molens.geojson`, `gemalen.geojson`, `droogmakerijen.geojson`, `drgmk_molens_gemalen.geojson` (optional), and `paleogeografie1250nc.geojson`, `paleogeografie1500nc.geojson`, `paleogeografie1850nc.geojson`, `paleogeografie2000nc.geojson`.

## Sources and licences

| What | Source | Licence |
|---|---|---|
| Existing mills (`molens`) | RCE Landschapsatlas, after De Hollandsche Molen | Public domain |
| Lost mills (`verdwenen_molens`) | RCE Landschapsatlas, after De Hollandsche Molen | CC0 1.0 |
| Pasture mills and wind engines (`weidemolens`) | RCE Landschapsatlas, after De Hollandsche Molen | CC0 1.0 |
| Pumping stations (`gemalen`) | RCE Landschapsatlas, after the Nederlandse Gemalenstichting | CC0 1.0 |
| Drained lakes (`droogmakerijen`) | RCE Landschapsatlas, after the NAi Polderatlas | CC0 1.0 |
| Mills and pumping stations per drained lake (`drgmk_molens_gemalen`) | RCE Landschapsatlas, from historical maps (Blaeu, Dou, Bonne sheets and others) | CC0 1.0 |
| Landscape 1250, 1500, 1850, 2000 | Palaeogeographic maps, Atlas van Nederland in het Holoceen (RCE / Deltares, P.C. Vos et al.) | CC BY 4.0, attribution required, changes must be indicated |
| Street map tiles | BRT-Achtergrondkaart, Kadaster via PDOK (loaded live, not stored here) | CC BY 4.0, attribution required |
| Typeface | Inter Tight, The Inter Project Authors (`fonts/`) | SIL Open Font License 1.1, see `fonts/OFL.txt` |
| Floods and depolderings | Own selection and text in `js/12-events.js` | EUPL-1.2, like the code |

The CC BY credits are shown on the page: the Kadaster credit appears on the map whenever its tiles are visible, and the palaeogeographic maps are credited, with a note that they were simplified and recoloured, under "Sources & notes". `data/data.js` is derived from the sources above; because it contains the simplified palaeogeographic maps, anyone reusing it must keep that CC BY 4.0 credit.

The CC0 and public domain datasets need no credit, but the page credits RCE, De Hollandsche Molen and the Gemalenstichting anyway.

## Licence

Copyright © 2026 [Toni Nestorowicz](https://nestorowicz.nl).

The code and the project's own texts (including the curated floods and depolderings) are licensed under the European Union Public Licence, version 1.2 (EUPL-1.2). See `LICENSE`. Like the GPL it lets anyone use, change and share this work, also commercially, as long as changed versions stay under the same terms; unlike the GPL, that also applies when a changed version is only offered as an online service.

The data sources and the typeface keep their own licences, listed above.
