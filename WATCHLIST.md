# Watchlist

Mills whose status was changed by hand in `tools/prep.py` (dictionaries `BUILT`, `GONE` and `MOVED_TO`) and that are worth checking again later. When the source data catches up, or the situation changes, update or remove the entry in `prep.py`, rebuild `data/data.js` and update this list.

| Added | Mill | Ten Bruggencate | What we did | Check again | What to look for |
|---|---|---|---|---|---|
| 14-11-2026 | De Slagdijkstermolen, Oude Leije (near Stiens, Friesland), 8-sided grondzeiler, built 1864 | 03034 | Marked as lost in 2026 (`GONE`): burnt down in the night of 13–14 November 2026 and collapsed. The fire brigade called it a total loss; no word yet on rebuilding. Source: [NOS, 14-11-2026](https://nos.nl/l/2639444) | 2028 and later | Has it been rebuilt? If so: remove it from `GONE`, and add the rebuilt mill as standing (status *herbouwd*, rebuilt in the year it turned again). Also check whether the RCE / molendatabase export now lists it as lost, in which case the hand fix is no longer needed. |

## Hand fixes that need no follow-up

These are corrections to the export, not changing situations. They can go once a fresh export has the right data.

- **Ceres, Bovenkarspel (01420)**: build year 1849 (`BUILT`); the export has none. A mill moved from the Zaan region. Note: it burnt in 2019 and was rebuilt in 2021–2022, and it counts as standing.
- **Thirteen moves** that the export doesn't mark (`MOVED_TO`), each with a one-line source note in `prep.py`.
