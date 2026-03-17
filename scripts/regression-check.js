import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const editorLabel = "NumPy mission code editor";

const solutions = [
  {
    id: "boot-bay",
    activeVariable: "power_core [ndarray]",
    expectedShape: [3, 4],
    code: `# Boot Bay: restore the starter arrays.
# NumPy is already imported as np.
# Replace each placeholder with the healthy array described in the checklist.

# TODO: make power_core a 3x4 float64 grid of zeros.
power_core = np.zeros((3, 4), dtype=np.float64)

# TODO: create six evenly spaced values from 0.1 to 1.1, then reshape to 2x3.
calibration = np.linspace(0.1, 1.1, 6, dtype=np.float64).reshape(2, 3)

# TODO: make nanobots a 2x2 matrix filled with 7 using dtype=np.int16.
nanobots = np.full((2, 2), 7, dtype=np.int16)

# Leave boot_matrix as the diagnostic matrix you inspect in report.
boot_matrix = np.array([[2, 4, 6], [8, 10, 12]], dtype=np.int16)

# TODO: create the course line with np.arange(10, 20, 2).
course_line = np.arange(10, 20, 2)

report = {
    "shape": boot_matrix.shape,
    "ndim": boot_matrix.ndim,
    "size": boot_matrix.size,
    "dtype": str(boot_matrix.dtype),
}

print("Boot Bay arrays online.")`,
  },
  {
    id: "sensor-deck",
    activeVariable: "sensor_grid [ndarray]",
    expectedShape: [4, 4],
    code: `# Sensor Deck: restore visibility.
# The matrix is healthy; your job is to select and mutate the right views.

sensor_grid = np.arange(1, 17).reshape(4, 4)

# TODO: grab the first row only.
first_row = sensor_grid[0].copy()

# TODO: take rows 1:3 and columns 1:4.
scan_window = sensor_grid[1:3, 1:4].copy()

# TODO: use fancy indexing to pull [2, 12, 13].
priority = sensor_grid[[0, 2, 3], [1, 3, 0]]

view_patch = sensor_grid[:, :2]

# TODO: make copy_patch an actual copy before editing it.
copy_patch = sensor_grid[:, :2].copy()

# TODO: add 100 to every value in view_patch so sensor_grid changes too.
view_patch[:] = view_patch + 100

# TODO: set the top-left cell of copy_patch to -999 without changing sensor_grid.
copy_patch[0, 0] = -999

print("Sensor deck aligned.")`,
  },
  {
    id: "reactor-garden",
    activeVariable: "boosted [ndarray]",
    expectedShape: [2, 3],
    code: `# Reactor Garden: tune the waveform.
# Build each array from the previous one instead of typing final values by hand.

heat = np.array([[1.0, -4.0, 9.0], [16.0, -25.0, 36.0]])
bias = np.array([0.5, 1.0, 1.5])

# TODO: take the absolute value first.
magnitude = np.abs(heat)

# TODO: take the square root of magnitude.
root_heat = np.sqrt(magnitude)

# TODO: apply np.sin to root_heat.
wave = np.sin(root_heat)

# TODO: broadcast bias across the rows of root_heat.
boosted = root_heat + bias

# TODO: use boosted to build efficiency and log_signal.
efficiency = np.exp(-boosted / 10)
log_signal = np.log1p(boosted)

# TODO: mark boosted values greater than 4.
danger = boosted > 4

print("Reactor waveforms tuned.")`,
  },
  {
    id: "quarantine-lab",
    activeVariable: "quarantine [ndarray]",
    expectedShape: [3, 3],
    code: `# Quarantine Lab: stabilize the samples.
# Build your masks step by step so each one explains the next array.

samples = np.array([
    [1.2, np.nan, 3.5],
    [0.4, -1.2, np.nan],
    [2.1, 0.0, 4.4],
], dtype=np.float64)

# TODO: mark the finite cells with ~np.isnan(samples).
finite_mask = ~np.isnan(samples)

# TODO: replace NaN with 0.0 using np.where.
clean = np.where(finite_mask, samples, 0.0)

# TODO: keep only the clean values that are at least 0.5.
safe_mask = clean >= 0.5
filtered = clean[safe_mask]

# TODO: summarize the cleaned grid with np.any and np.all.
has_breach = np.any(clean < 0)
all_stable = np.all(clean <= 5)

# TODO: keep safe cells and zero-out the rest.
quarantine = np.where(safe_mask, clean, 0.0)

print("Lab quarantine sweep staged.")`,
  },
  {
    id: "cargo-forge",
    activeVariable: "stacked [ndarray]",
    expectedShape: [2, 2, 2],
    code: `# Cargo Forge: repack the hold.
# Reuse the provided arrays. Your job is to reorganize them without losing data.

crates = np.arange(1, 13).reshape(3, 4)
left = np.array([[1, 2], [3, 4]])
right = np.array([[5, 6], [7, 8]])
cube = np.arange(1, 9).reshape(2, 2, 2)

# TODO: reshape crates into a 2x6 grid.
reshaped = crates.reshape(2, 6)

# TODO: use ravel() for a flat view and flatten() for a flat copy.
flat_view = crates.ravel()
flat_copy = crates.flatten()

# TODO: rotate crates with transpose and rotate cube with swapaxes.
transposed = crates.T
swapped = np.swapaxes(cube, 0, 2)

# TODO: join left and right across columns, then stack them into a new axis.
merged = np.concatenate([left, right], axis=1)
stacked = np.stack([left, right])

# TODO: split np.arange(12) into 3 equal sections.
sections = np.split(np.arange(12), 3)

# TODO: repeat [1, 2, 3] twice each and tile the checker pattern to 4x4.
repeated = np.repeat(np.array([1, 2, 3]), 2)
tiled = np.tile(np.array([[1, 0], [0, 1]]), (2, 2))

print("Cargo patterns queued.")`,
  },
  {
    id: "drone-bridge",
    activeVariable: "navigation [ndarray]",
    expectedShape: [2, 2],
    code: `# Drone Bridge: route the swarm.
# Keep the route matrices. Replace the placeholder analytics with real NumPy results.

rng = np.random.default_rng(7)
traffic = rng.integers(2, 20, size=(3, 4))

# TODO: reduce traffic across rows and columns with the correct axes.
totals = traffic.sum(axis=1)
means = traffic.mean(axis=0)
minimum = traffic.min()
maximum = traffic.max()
spread = traffic.std()
argmin_idx = np.argmin(traffic)
argmax_idx = np.argmax(traffic)

# TODO: sort each row, then argsort only the first row.
sorted_rows = np.sort(traffic, axis=1)
sort_order = np.argsort(traffic[0])
unique_codes = np.unique(np.array([2, 2, 3, 5, 5, 7]))

route_a = np.array([[2, 1, 0], [1, 3, 2]])
route_b = np.array([[1, 2], [0, 1], [4, 2]])

# TODO: use matrix multiplication for navigation and np.dot for energy_dot.
navigation = route_a @ route_b
energy_dot = np.dot(np.array([1, 2, 3]), np.array([4, 5, 6]))

print("Drone bridge awaiting routes.")`,
  },
  {
    id: "colony-core",
    activeVariable: "course [ndarray]",
    expectedShape: [2, 2],
    code: `# Colony Core: execute the rescue sequence.
# This capstone should read like a NumPy pipeline, not a pile of hand-entered answers.

weights = np.array([
    [1.0, 0.5],
    [0.0, 1.0],
    [1.5, -0.5],
    [0.5, 1.5],
    [1.0, 1.0],
    [0.2, 1.3],
    [1.1, 0.4],
    [0.3, 1.2],
])

# TODO: start with the 4x4 grid from 1 through 16.
grid = np.arange(1, 17).reshape(4, 4)

# TODO: keep only the even cells with np.where.
safe = np.where(grid % 2 == 0, grid, 0)

# TODO: broadcast the repair vector across safe, then sum across axis 1.
row_power = (safe + np.array([0, 5, 10, 15])).sum(axis=1)
boosted = safe + np.array([0, 5, 10, 15])

# TODO: reshape boosted to (2, 8), then use @ with weights.
matrix = boosted.reshape(2, 8)
course = matrix @ weights

# TODO: rescue_score should be the mean of the course matrix.
rescue_score = course.mean()

print("Colony Core rescue path pending.")`,
  },
];

function startServer(root) {
  const mimeTypes = new Map([
    [".html", "text/html; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".css", "text/css; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".png", "image/png"],
    [".svg", "image/svg+xml"],
  ]);

  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    let pathname = decodeURIComponent(requestUrl.pathname);
    if (pathname === "/") {
      pathname = "/index.html";
    }

    const targetPath = path.resolve(root, `.${pathname}`);
    if (!targetPath.startsWith(root)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    fs.readFile(targetPath, (error, file) => {
      if (error) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "Content-Type": mimeTypes.get(path.extname(targetPath)) ?? "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(file);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({
        server,
        origin: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

async function getState(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

async function waitForReady(page) {
  await page.waitForFunction(() => {
    if (typeof window.render_game_to_text !== "function") {
      return false;
    }
    const state = JSON.parse(window.render_game_to_text());
    return state.mode === "ready";
  }, { timeout: 180000 });
}

async function waitForMissionReady(page, missionId) {
  await page.waitForFunction((expectedId) => {
    const state = JSON.parse(window.render_game_to_text());
    return state.mode === "ready" && state.mission.id === expectedId && state.arrays.length > 0;
  }, missionId, { timeout: 30000 });
}

async function fillEditor(page, code) {
  await page.getByRole("textbox", { name: editorLabel }).fill(code);
}

async function runCurrentMission(page, mission) {
  console.log(`Running mission: ${mission.id}`);
  await fillEditor(page, mission.code);
  await page.getByRole("button", { name: "Run Code" }).click();
  try {
    await page.waitForFunction((expectedId) => {
      const state = JSON.parse(window.render_game_to_text());
      return state.mission.id === expectedId && state.mission.complete === true;
    }, mission.id, { timeout: 30000 });
  } catch (error) {
    const state = await getState(page);
    throw new Error(
      `Mission ${mission.id} did not complete.\nSummary: ${state.output.summary}\nError: ${state.output.error ?? "none"}`,
      { cause: error },
    );
  }

  const state = await getState(page);
  assert.equal(state.mission.id, mission.id, `Expected mission ${mission.id} to be active`);
  assert.equal(state.mission.complete, true, `Mission ${mission.id} should complete`);
  assert.ok(state.progress.completed.includes(mission.id), `Progress should include ${mission.id}`);

  await page.getByRole("button", { name: mission.activeVariable }).click();
  const updatedState = await getState(page);
  assert.deepEqual(updatedState.activeValue?.shape, mission.expectedShape, `${mission.id} inspector shape mismatch`);
}

async function main() {
  const { server, origin } = await startServer(rootDir);
  const consoleErrors = [];
  const pageErrors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(String(error));
  });

  try {
    await page.goto(origin, { waitUntil: "domcontentloaded" });
    await waitForReady(page);

    const initialState = await getState(page);
    assert.equal(initialState.mission.id, "boot-bay");
    assert.equal(typeof initialState.engineStatus, "string");
    assert.ok(initialState.arrays.length > 0, "Initial auto-run should populate arrays");
    assert.equal(await page.evaluate(() => typeof window.advanceTime), "function");
    assert.equal(await page.evaluate(() => typeof window.render_game_to_text), "function");

    const advancedMission = await page.evaluate(() => {
      window.advanceTime(750);
      return JSON.parse(window.render_game_to_text()).mission.id;
    });
    assert.equal(advancedMission, "boot-bay", "advanceTime should not break mission state");

    await waitForMissionReady(page, solutions[0].id);
    await runCurrentMission(page, solutions[0]);
    assert.equal(await page.getByRole("button", { name: "Next Sector" }).isEnabled(), true);

    await page.getByRole("button", { name: "Reset Mission" }).click();
    await page.waitForFunction(() => {
      const state = JSON.parse(window.render_game_to_text());
      return state.mission.id === "boot-bay" && state.mission.complete === false;
    }, { timeout: 15000 });
    const resetState = await getState(page);
    assert.equal(resetState.mission.complete, false, "Reset should return Boot Bay to incomplete state");

    await waitForMissionReady(page, solutions[0].id);
    await runCurrentMission(page, solutions[0]);
    await page.getByRole("button", { name: "Next Sector" }).click();

    for (let index = 1; index < solutions.length; index += 1) {
      const mission = solutions[index];
      await waitForMissionReady(page, mission.id);
      await runCurrentMission(page, mission);

      if (index < solutions.length - 1) {
        await page.getByRole("button", { name: "Next Sector" }).click();
      }
    }

    const finalState = await getState(page);
    assert.equal(finalState.mission.id, "colony-core");
    assert.equal(finalState.mission.complete, true);
    assert.equal(finalState.progress.completed.length, 7, "All seven missions should be complete");
    assert.equal(finalState.progress.unlockedCount, 7);

    if (pageErrors.length) {
      throw new Error(`Page errors detected:\n${pageErrors.join("\n")}`);
    }
    if (consoleErrors.length) {
      throw new Error(`Console errors detected:\n${consoleErrors.join("\n")}`);
    }

    console.log("Regression check passed: startup, hooks, reset flow, progression, and all seven mission solutions verified.");
  } catch (error) {
    const screenshotPath = path.join(rootDir, "output", "regression-failure.png");
    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    throw error;
  } finally {
    await page.close();
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
