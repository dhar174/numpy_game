# NumPy Nebula: Reboot the Colony Ship

An educational browser game for NumPy beginners. Players repair a damaged colony ship by writing real Python and NumPy code in a guided console, then reading the live array outputs in an inspector.

## Run locally

```powershell
python -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173) in a browser.

## Notes

- NumPy runs in the browser through Pyodide.
- The game exposes `window.render_game_to_text()` and `window.advanceTime(ms)` for automated playtesting.
- Mission content covers array creation, indexing, slicing, views vs copies, broadcasting, masks, aggregation, reshaping, stacking, random generation, sorting, and matrix math.
