import { missions, getConceptMatches } from "./missions.js";

const refs = {
  engineStatus: document.getElementById("engine-status"),
  progressStatus: document.getElementById("progress-status"),
  sectorList: document.getElementById("sector-list"),
  missionTitle: document.getElementById("mission-title"),
  missionSector: document.getElementById("mission-sector"),
  missionStory: document.getElementById("mission-story"),
  learningGoals: document.getElementById("learning-goals"),
  missionTasks: document.getElementById("mission-tasks"),
  conceptChips: document.getElementById("concept-chips"),
  arrayTags: document.getElementById("array-tags"),
  hintList: document.getElementById("hint-list"),
  hintBtn: document.getElementById("hint-btn"),
  runState: document.getElementById("run-state"),
  runSummary: document.getElementById("run-summary"),
  validationList: document.getElementById("validation-list"),
  stdoutPane: document.getElementById("stdout-pane"),
  errorPane: document.getElementById("error-pane"),
  runBtn: document.getElementById("run-btn"),
  resetBtn: document.getElementById("reset-btn"),
  nextBtn: document.getElementById("next-btn"),
  codeEditor: document.getElementById("code-editor"),
  variableTabs: document.getElementById("variable-tabs"),
  activeArrayBadge: document.getElementById("active-array-badge"),
  arrayInspector: document.getElementById("array-inspector"),
  shipCanvas: document.getElementById("ship-canvas"),
  canvasCard: document.getElementById("canvas-card"),
  fullscreenBtn: document.getElementById("fullscreen-btn"),
};

const state = {
  pyodide: null,
  pyodideReady: false,
  currentMissionIndex: 0,
  completedMissionIds: new Set(),
  selectedVariable: null,
  executionResult: null,
  hintsVisible: 1,
  simTime: 0,
  lastFrameTime: performance.now(),
  stars: createStars(88),
  nebulaSeeds: createNebulaSeeds(5),
};

const sectorPositions = [
  { x: 0.17, y: 0.5 },
  { x: 0.28, y: 0.32 },
  { x: 0.42, y: 0.25 },
  { x: 0.56, y: 0.35 },
  { x: 0.64, y: 0.55 },
  { x: 0.78, y: 0.48 },
  { x: 0.88, y: 0.34 },
];

function currentMission() {
  return missions[state.currentMissionIndex];
}

function isMissionUnlocked(index) {
  return index === 0 || index <= state.completedMissionIds.size;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createStars(count) {
  return Array.from({ length: count }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    radius: 0.6 + Math.random() * 1.8,
    speed: 0.004 + Math.random() * 0.01,
    phase: index * 0.73,
  }));
}

function createNebulaSeeds(count) {
  return Array.from({ length: count }, (_, index) => ({
    x: 0.18 + index * 0.17,
    y: 0.2 + (index % 2) * 0.16,
    radius: 110 + index * 25,
    hue: index % 2 === 0 ? "110, 244, 209" : "255, 190, 104",
  }));
}

function updateProgressStatus() {
  refs.progressStatus.textContent = `${state.completedMissionIds.size} / ${missions.length} sectors restored`;
}

function setEngineStatus(text, accent = false) {
  refs.engineStatus.textContent = text;
  refs.engineStatus.classList.toggle("accent", accent);
}

function renderMissionList() {
  refs.sectorList.innerHTML = missions
    .map((mission, index) => {
      const complete = state.completedMissionIds.has(mission.id);
      const current = index === state.currentMissionIndex;
      const locked = !isMissionUnlocked(index);
      const classes = ["sector-button"];

      if (complete) {
        classes.push("complete");
      }
      if (current) {
        classes.push("current");
      }
      if (locked) {
        classes.push("locked");
      }

      const status = complete ? "Restored" : locked ? "Locked" : "Available";

      return `
        <button
          class="${classes.join(" ")}"
          type="button"
          data-mission-index="${index}"
          ${locked ? "disabled" : ""}
        >
          <div class="sector-name">${mission.sectorLabel}: ${mission.sector}</div>
          <div class="sector-meta">${escapeHtml(mission.shortDescription)} | ${status}</div>
        </button>
      `;
    })
    .join("");
}

function renderMissionDetails() {
  const mission = currentMission();
  refs.missionTitle.textContent = `${mission.sector}: ${mission.title}`;
  refs.missionSector.textContent = mission.sectorLabel;
  refs.missionStory.textContent = mission.storyPrompt;
  refs.learningGoals.innerHTML = mission.learningGoals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join("");
  refs.missionTasks.innerHTML = mission.tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join("");
  refs.arrayTags.innerHTML = Object.entries(mission.initialArrays)
    .map(([name, detail]) => `<span class="chip">${escapeHtml(name)}: ${escapeHtml(detail)}</span>`)
    .join("");
}

function renderConceptChips() {
  const mission = currentMission();
  const code = refs.codeEditor.value;
  const matchedLabels = new Set(getConceptMatches(mission, code).map((concept) => concept.label));

  refs.conceptChips.innerHTML = mission.expectedConcepts
    .map((concept) => {
      const matched = matchedLabels.has(concept.label);
      const className = matched ? "chip matched" : "chip dim";
      return `<span class="${className}">${escapeHtml(concept.label)}</span>`;
    })
    .join("");
}

function renderHints() {
  const mission = currentMission();
  const visibleHints = mission.hints.slice(0, state.hintsVisible);
  refs.hintList.innerHTML = `
    <div class="hint-list">
      ${visibleHints
        .map((hint, index) => `<div class="hint-item"><strong>Hint ${index + 1}:</strong> ${escapeHtml(hint)}</div>`)
        .join("")}
    </div>
  `;
  refs.hintBtn.disabled = state.hintsVisible >= mission.hints.length;
}

function renderOutput() {
  const result = state.executionResult;

  if (!result) {
    refs.runState.textContent = "Starter code loaded";
    refs.runSummary.textContent =
      "Run the mission script to validate the current repair sequence and inspect the resulting arrays.";
    refs.validationList.innerHTML = "";
    refs.stdoutPane.textContent = "Waiting for first run...";
    refs.errorPane.textContent = "No errors yet.";
    return;
  }

  refs.runState.textContent = result.missionComplete ? "Sector restored" : result.error ? "Run failed" : "Needs tuning";
  refs.runSummary.textContent = result.error
    ? formatFriendlyError(result.error, currentMission())
    : result.validation.summary;
  refs.validationList.innerHTML = result.validation.checks
    .map((check) => `<li class="${check.passed ? "pass" : "fail"}">${check.passed ? "Pass" : "Fix"}: ${escapeHtml(check.label)}</li>`)
    .join("");
  refs.stdoutPane.textContent = result.stdout?.trim() || "No stdout for this run.";
  refs.errorPane.textContent = result.error?.trim() || "No errors for this run.";
}

function variableEntries() {
  const namedArrays = state.executionResult?.namedArrays;
  if (!namedArrays) {
    return [];
  }

  return Object.entries(namedArrays).sort((left, right) => {
    const leftType = left[1]?.type === "ndarray" ? 0 : 1;
    const rightType = right[1]?.type === "ndarray" ? 0 : 1;
    if (leftType !== rightType) {
      return leftType - rightType;
    }
    return left[0].localeCompare(right[0]);
  });
}

function ensureSelectedVariable() {
  const entries = variableEntries();
  if (!entries.length) {
    state.selectedVariable = null;
    return;
  }

  if (!entries.some(([name]) => name === state.selectedVariable)) {
    const preferred = currentMission().initialArrays
      ? Object.keys(currentMission().initialArrays).find((key) => entries.some(([name]) => name === key))
      : null;

    state.selectedVariable = preferred || entries[0][0];
  }
}

function renderVariableTabs() {
  const entries = variableEntries();

  if (!entries.length) {
    refs.variableTabs.innerHTML = "";
    refs.activeArrayBadge.textContent = "No array selected";
    return;
  }

  ensureSelectedVariable();
  refs.variableTabs.innerHTML = entries
    .map(([name, value]) => {
      const active = name === state.selectedVariable;
      const label = value?.type === "ndarray" ? `${name} [ndarray]` : `${name} [${value?.type || typeof value}]`;
      return `
        <button
          class="variable-tab ${active ? "active" : ""}"
          type="button"
          data-variable-name="${escapeHtml(name)}"
        >
          ${escapeHtml(label)}
        </button>
      `;
    })
    .join("");
}

function formatDisplayNumber(value) {
  if (typeof value !== "number") {
    return String(value);
  }

  if (!Number.isFinite(value)) {
    return String(value);
  }

  if (Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < 0.01)) {
    return value.toExponential(2);
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/\.?0+$/, "");
}

function flattenValues(data, target = []) {
  if (Array.isArray(data)) {
    data.forEach((item) => flattenValues(item, target));
    return target;
  }
  target.push(data);
  return target;
}

function renderGrid2D(data, prefix = "") {
  const rows = Array.isArray(data) ? data.length : 0;
  const cols = rows > 0 && Array.isArray(data[0]) ? data[0].length : 0;
  const numericValues = flattenValues(data).filter((value) => typeof value === "number" && Number.isFinite(value));
  const min = numericValues.length ? Math.min(...numericValues) : 0;
  const max = numericValues.length ? Math.max(...numericValues) : 1;
  const range = max - min || 1;

  return `
    <div class="heatmap-grid" style="--cols:${Math.max(cols, 1)}">
      ${data
        .map((row, rowIndex) =>
          row
            .map((value, colIndex) => {
              const numeric = typeof value === "number" && Number.isFinite(value);
              const intensity = numeric ? (value - min) / range : 0.45;
              const extraClass =
                typeof value === "boolean"
                  ? value
                    ? "boolean-true"
                    : "boolean-false"
                  : !numeric
                    ? "special"
                    : "";
              const indexLabel = prefix ? `${prefix}[${rowIndex}, ${colIndex}]` : `[${rowIndex}, ${colIndex}]`;
              return `
                <div class="heatmap-cell ${extraClass}" style="--intensity:${intensity}">
                  <span class="cell-value">${escapeHtml(formatDisplayNumber(value))}</span>
                  <span class="cell-index">${escapeHtml(indexLabel)}</span>
                </div>
              `;
            })
            .join(""),
        )
        .join("")}
    </div>
  `;
}

function renderArrayHeatmap(arrayValue) {
  const { data, ndim } = arrayValue;

  if (ndim === 1) {
    return renderGrid2D([data], "");
  }

  if (ndim === 2) {
    return renderGrid2D(data, "");
  }

  if (ndim >= 3 && Array.isArray(data)) {
    const slices = data.slice(0, 3);
    return `
      <div class="heatmap-stack">
        ${slices
          .map((slice, index) => `
            <div>
              <div class="slice-title">Slice ${index} along axis 0</div>
              ${renderGrid2D(slice, `[${index}]`)}
            </div>
          `)
          .join("")}
      </div>
    `;
  }

  return `<pre class="raw-pane">${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
}

function axisNoteFor(value) {
  if (value.ndim === 1) {
    return "Axis 0 runs left to right along the line.";
  }

  if (value.ndim === 2) {
    return "Axis 0 runs down the rows. Axis 1 runs across the columns.";
  }

  return "Axis 0 is the slice stack. The heatmap shows the first few axis-0 slices.";
}

function renderInspector() {
  const entries = variableEntries();

  if (!entries.length) {
    refs.arrayInspector.innerHTML = `<p class="empty-state">Run the current mission to inspect outputs.</p>`;
    refs.activeArrayBadge.textContent = "No array selected";
    return;
  }

  ensureSelectedVariable();
  const selectedValue = entries.find(([name]) => name === state.selectedVariable)?.[1];

  if (!selectedValue) {
    refs.arrayInspector.innerHTML = `<p class="empty-state">No matching value found.</p>`;
    refs.activeArrayBadge.textContent = "No array selected";
    return;
  }

  refs.activeArrayBadge.textContent = state.selectedVariable;

  if (selectedValue.type === "ndarray") {
    refs.arrayInspector.innerHTML = `
      <div class="meta-grid">
        <div class="meta-card"><span class="mini-label">dtype</span><strong>${escapeHtml(selectedValue.dtype)}</strong></div>
        <div class="meta-card"><span class="mini-label">shape</span><strong>${escapeHtml(JSON.stringify(selectedValue.shape))}</strong></div>
        <div class="meta-card"><span class="mini-label">ndim</span><strong>${escapeHtml(String(selectedValue.ndim))}</strong></div>
        <div class="meta-card"><span class="mini-label">size</span><strong>${escapeHtml(String(selectedValue.size))}</strong></div>
      </div>
      <p class="axis-note">${escapeHtml(axisNoteFor(selectedValue))}</p>
      ${renderArrayHeatmap(selectedValue)}
      <pre class="raw-pane">${escapeHtml(JSON.stringify(selectedValue.data, null, 2))}</pre>
    `;
    return;
  }

  refs.arrayInspector.innerHTML = `
    <div class="structured-box">
      <p class="axis-note">Structured value: ${escapeHtml(selectedValue.type || typeof selectedValue)}</p>
      <pre class="raw-pane">${escapeHtml(JSON.stringify(selectedValue, null, 2))}</pre>
    </div>
  `;
}

function updateControls() {
  const missionComplete = state.executionResult?.missionComplete;
  refs.runBtn.disabled = !state.pyodideReady;
  refs.resetBtn.disabled = !state.pyodideReady;
  refs.nextBtn.disabled = !missionComplete || state.currentMissionIndex >= missions.length - 1;
}

function renderAll() {
  updateProgressStatus();
  renderMissionList();
  renderMissionDetails();
  renderConceptChips();
  renderHints();
  renderOutput();
  renderVariableTabs();
  renderInspector();
  updateControls();
  drawShipCanvas();
  updateTextHooks();
}

function sanitizeValue(rawValue) {
  if (rawValue === null || rawValue === undefined) {
    return null;
  }

  if (Array.isArray(rawValue)) {
    return rawValue.map((item) => sanitizeValue(item));
  }

  if (typeof rawValue === "object") {
    return Object.fromEntries(Object.entries(rawValue).map(([key, value]) => [key, sanitizeValue(value)]));
  }

  return rawValue;
}

async function executePython(code) {
  const escapedCode = JSON.stringify(code);
  const script = `
import io
import json
import math
import sys
import traceback
import numpy as np

_user_code = ${escapedCode}
_stdout_buffer = io.StringIO()
_stderr_buffer = io.StringIO()
_namespace = {"np": np, "__builtins__": __builtins__}
_error = None

def _sanitize_jsonable(value, depth=0):
    if depth > 4:
        return {"type": type(value).__name__, "repr": repr(value)}
    if isinstance(value, np.ndarray):
        numeric = np.issubdtype(value.dtype, np.number)
        return {
            "type": "ndarray",
            "dtype": str(value.dtype),
            "shape": list(value.shape),
            "ndim": int(value.ndim),
            "size": int(value.size),
            "data": _sanitize_jsonable(value.tolist(), depth + 1),
            "repr": repr(value),
            "min": _sanitize_jsonable(float(np.nanmin(value))) if numeric and value.size else None,
            "max": _sanitize_jsonable(float(np.nanmax(value))) if numeric and value.size else None,
        }
    if isinstance(value, np.random.Generator):
        return {
            "type": "Generator",
            "bit_generator": value.bit_generator.__class__.__name__,
        }
    if isinstance(value, np.generic):
        return _sanitize_jsonable(value.item(), depth + 1)
    if isinstance(value, float):
        if math.isnan(value):
            return "NaN"
        if math.isinf(value):
            return "Infinity" if value > 0 else "-Infinity"
        return value
    if isinstance(value, (str, int, bool)) or value is None:
        return value
    if isinstance(value, (list, tuple)):
        return [_sanitize_jsonable(item, depth + 1) for item in value]
    if isinstance(value, dict):
        return {str(key): _sanitize_jsonable(item, depth + 1) for key, item in value.items()}
    return {
        "type": type(value).__name__,
        "repr": repr(value),
    }

_old_stdout, _old_stderr = sys.stdout, sys.stderr
sys.stdout, sys.stderr = _stdout_buffer, _stderr_buffer

try:
    exec(_user_code, _namespace)
except Exception:
    _error = traceback.format_exc()
finally:
    sys.stdout, sys.stderr = _old_stdout, _old_stderr

_visible = {}
for _name, _value in _namespace.items():
    if _name.startswith("__") or _name == "np":
        continue
    _visible[_name] = _sanitize_jsonable(_value)

json.dumps(
    {
        "stdout": _stdout_buffer.getvalue(),
        "stderr": _stderr_buffer.getvalue(),
        "error": _error,
        "namedArrays": _visible,
    }
)
`;

  const raw = await state.pyodide.runPythonAsync(script);
  const parsed = JSON.parse(raw);
  return {
    stdout: parsed.stdout,
    stderr: parsed.stderr,
    error: parsed.error,
    namedArrays: sanitizeValue(parsed.namedArrays),
  };
}

function formatFriendlyError(errorText, mission) {
  if (!errorText) {
    return "No errors for this run.";
  }

  const lowered = errorText.toLowerCase();
  if (lowered.includes("shape") && lowered.includes("broadcast")) {
    return "Broadcast mismatch detected. Recheck your array shapes before adding or multiplying them.";
  }
  if (lowered.includes("axis")) {
    return "Axis issue detected. Remember axis 0 runs down rows and axis 1 runs across columns for 2D arrays.";
  }
  if (lowered.includes("list") && lowered.includes("reshape")) {
    return "A Python list cannot reshape itself. Convert it into a NumPy array first.";
  }
  if (lowered.includes("too many indices")) {
    return "Indexing mismatch detected. Double-check whether the target is 1D or 2D before slicing.";
  }
  if (lowered.includes("nameerror")) {
    return "A variable name is missing or misspelled. Scan the starter code for the exact names this sector expects.";
  }
  return `${mission.sector} reports a Python error. Scroll to the error pane for the full traceback, then use the hints to narrow it down.`;
}

async function runMissionCode(options = {}) {
  if (!state.pyodideReady) {
    return;
  }

  const mission = currentMission();
  const { auto = false } = options;

  refs.runBtn.disabled = true;
  refs.runState.textContent = auto ? "Loading starter state" : "Running";
  refs.runSummary.textContent = auto ? "Initializing the current sector arrays..." : "Executing NumPy mission code...";

  try {
    const execution = await executePython(refs.codeEditor.value);
    const conceptMatches = getConceptMatches(mission, refs.codeEditor.value);
    const validation = mission.validator(execution, refs.codeEditor.value, conceptMatches);
    const missionComplete = !execution.error && validation.complete;

    state.executionResult = {
      ...execution,
      conceptsUsed: conceptMatches.map((concept) => concept.label),
      validation,
      missionComplete,
    };

    if (validation.focusVariable) {
      state.selectedVariable = validation.focusVariable;
    }

    if (execution.error) {
      state.hintsVisible = Math.min(state.hintsVisible + 1, mission.hints.length);
    }

    if (missionComplete) {
      state.completedMissionIds.add(mission.id);
      state.hintsVisible = mission.hints.length;
      if (!auto) {
        setEngineStatus(`${mission.sector} restored.`, true);
      }
    } else if (!auto) {
      setEngineStatus(`Running ${mission.sector} repair loop...`, false);
    }
  } catch (error) {
    state.executionResult = {
      stdout: "",
      stderr: "",
      error: String(error),
      namedArrays: {},
      conceptsUsed: [],
      validation: {
        checks: [],
        summary: "The browser-side NumPy engine hit an unexpected error.",
      },
      missionComplete: false,
    };
    state.hintsVisible = Math.min(state.hintsVisible + 1, mission.hints.length);
    setEngineStatus("Pyodide execution error", false);
  } finally {
    renderAll();
  }
}

async function loadMission(index, options = {}) {
  if (!isMissionUnlocked(index) || index < 0 || index >= missions.length) {
    return;
  }

  state.currentMissionIndex = index;
  state.executionResult = null;
  state.hintsVisible = 1;
  state.selectedVariable = null;
  refs.codeEditor.value = missions[index].starterCode;
  renderAll();

  if (state.pyodideReady && !options.skipAutoRun) {
    await runMissionCode({ auto: true });
  }
}

function handleMissionSelection(event) {
  const button = event.target.closest("[data-mission-index]");
  if (!button) {
    return;
  }

  const index = Number(button.dataset.missionIndex);
  loadMission(index);
}

function handleVariableSelection(event) {
  const button = event.target.closest("[data-variable-name]");
  if (!button) {
    return;
  }

  state.selectedVariable = button.dataset.variableName;
  renderVariableTabs();
  renderInspector();
  updateTextHooks();
}

function syncCanvasSize() {
  const rect = refs.shipCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const targetWidth = Math.max(320, Math.round(rect.width * dpr));
  const targetHeight = Math.max(220, Math.round(rect.height * dpr));

  if (refs.shipCanvas.width !== targetWidth || refs.shipCanvas.height !== targetHeight) {
    refs.shipCanvas.width = targetWidth;
    refs.shipCanvas.height = targetHeight;
  }
}

function drawShipCanvas() {
  syncCanvasSize();
  const canvas = refs.shipCanvas;
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const mission = currentMission();

  context.clearRect(0, 0, width, height);

  const backgroundGradient = context.createLinearGradient(0, 0, width, height);
  backgroundGradient.addColorStop(0, "#07101f");
  backgroundGradient.addColorStop(0.5, "#09182a");
  backgroundGradient.addColorStop(1, "#050a13");
  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, width, height);

  state.nebulaSeeds.forEach((seed, index) => {
    const pulse = 0.75 + 0.25 * Math.sin(state.simTime / 1800 + index);
    const gradient = context.createRadialGradient(
      width * seed.x,
      height * seed.y,
      0,
      width * seed.x,
      height * seed.y,
      seed.radius * pulse,
    );
    gradient.addColorStop(0, `rgba(${seed.hue}, 0.18)`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(width * seed.x, height * seed.y, seed.radius * pulse, 0, Math.PI * 2);
    context.fill();
  });

  state.stars.forEach((star) => {
    const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(state.simTime / 600 + star.phase));
    context.fillStyle = `rgba(237, 247, 255, ${twinkle})`;
    context.beginPath();
    context.arc(
      star.x * width,
      ((star.y + (state.simTime / 100000) * star.speed) % 1) * height,
      star.radius,
      0,
      Math.PI * 2,
    );
    context.fill();
  });

  const hullGradient = context.createLinearGradient(width * 0.08, height * 0.72, width * 0.92, height * 0.28);
  hullGradient.addColorStop(0, "rgba(64, 95, 135, 0.95)");
  hullGradient.addColorStop(0.55, "rgba(161, 217, 239, 0.82)");
  hullGradient.addColorStop(1, "rgba(78, 104, 163, 0.95)");
  context.fillStyle = hullGradient;

  context.beginPath();
  context.moveTo(width * 0.1, height * 0.58);
  context.quadraticCurveTo(width * 0.22, height * 0.25, width * 0.46, height * 0.22);
  context.lineTo(width * 0.86, height * 0.26);
  context.quadraticCurveTo(width * 0.95, height * 0.29, width * 0.91, height * 0.43);
  context.lineTo(width * 0.94, height * 0.48);
  context.quadraticCurveTo(width * 0.96, height * 0.54, width * 0.88, height * 0.62);
  context.lineTo(width * 0.44, height * 0.68);
  context.quadraticCurveTo(width * 0.2, height * 0.72, width * 0.1, height * 0.58);
  context.closePath();
  context.fill();

  context.strokeStyle = "rgba(255, 255, 255, 0.16)";
  context.lineWidth = 2;
  context.stroke();

  context.strokeStyle = "rgba(110, 244, 209, 0.18)";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(width * 0.15, height * 0.55);
  context.lineTo(width * 0.87, height * 0.33);
  context.stroke();

  context.font = `${Math.max(14, width / 48)}px Bahnschrift`;
  context.fillStyle = "rgba(237, 247, 255, 0.86)";
  context.fillText("COLONY SHIP // ARRAY NETWORK", width * 0.1, height * 0.14);
  context.fillStyle = "rgba(157, 181, 199, 0.86)";
  context.fillText(`Current sector: ${mission.sector}`, width * 0.1, height * 0.18);

  sectorPositions.forEach((position, index) => {
    const missionAtIndex = missions[index];
    const x = width * position.x;
    const y = height * position.y;
    const complete = state.completedMissionIds.has(missionAtIndex.id);
    const current = index === state.currentMissionIndex;
    const unlocked = isMissionUnlocked(index);
    const glow = current ? 18 + Math.sin(state.simTime / 180) * 4 : 10;

    context.beginPath();
    context.fillStyle = complete
      ? "rgba(140, 199, 255, 0.95)"
      : current
        ? "rgba(110, 244, 209, 0.95)"
        : unlocked
          ? "rgba(255, 190, 104, 0.9)"
          : "rgba(89, 104, 120, 0.75)";
    context.arc(x, y, current ? 14 : 11, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.strokeStyle = current ? "rgba(110, 244, 209, 0.35)" : "rgba(255, 255, 255, 0.12)";
    context.lineWidth = 2;
    context.arc(x, y, current ? 22 + glow * 0.18 : 18, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = "rgba(237, 247, 255, 0.9)";
    context.font = `${Math.max(11, width / 70)}px Bahnschrift`;
    context.fillText(missionAtIndex.sectorLabel, x - width * 0.035, y + 32);
  });
}

function updateTextHooks() {
  window.render_game_to_text = () =>
    JSON.stringify({
      mode: state.pyodideReady ? "ready" : "loading",
      coordinates: "Ship canvas origin is top-left. x increases right, y increases downward.",
      mission: {
        index: state.currentMissionIndex,
        id: currentMission().id,
        sector: currentMission().sector,
        title: currentMission().title,
        tasks: currentMission().tasks,
        complete: Boolean(state.executionResult?.missionComplete),
      },
      progress: {
        completed: Array.from(state.completedMissionIds),
        unlockedCount: Math.min(missions.length, state.completedMissionIds.size + 1),
      },
      arrays: variableEntries().map(([name, value]) => ({
        name,
        type: value?.type || typeof value,
        shape: value?.shape ?? null,
      })),
      activeVariable: state.selectedVariable,
      activeValue: state.selectedVariable
        ? state.executionResult?.namedArrays?.[state.selectedVariable] ?? null
        : null,
      output: {
        stdout: state.executionResult?.stdout ?? "",
        error: state.executionResult?.error ?? null,
        summary: state.executionResult?.validation?.summary ?? null,
      },
      hintsVisible: state.hintsVisible,
    });
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await refs.canvasCard.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
  drawShipCanvas();
}

async function initPyodide() {
  setEngineStatus("Loading Pyodide and NumPy...", false);
  const loadPyodide = window.loadPyodide;

  if (typeof loadPyodide !== "function") {
    throw new Error("Pyodide failed to load from the CDN.");
  }

  state.pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.3/full/",
  });
  await state.pyodide.loadPackage("numpy");
  await state.pyodide.runPythonAsync("import numpy as np");
  state.pyodideReady = true;
  setEngineStatus("NumPy engine ready", true);
}

function attachEvents() {
  refs.sectorList.addEventListener("click", handleMissionSelection);
  refs.variableTabs.addEventListener("click", handleVariableSelection);
  refs.hintBtn.addEventListener("click", () => {
    state.hintsVisible = Math.min(state.hintsVisible + 1, currentMission().hints.length);
    renderHints();
    updateTextHooks();
  });
  refs.runBtn.addEventListener("click", () => runMissionCode());
  refs.resetBtn.addEventListener("click", () => loadMission(state.currentMissionIndex));
  refs.nextBtn.addEventListener("click", () => {
    if (state.currentMissionIndex < missions.length - 1) {
      loadMission(state.currentMissionIndex + 1);
    }
  });
  refs.codeEditor.addEventListener("input", renderConceptChips);
  refs.codeEditor.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runMissionCode();
    }
  });
  refs.fullscreenBtn.addEventListener("click", () => toggleFullscreen());
  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "f" && document.activeElement !== refs.codeEditor) {
      event.preventDefault();
      toggleFullscreen();
    }
  });
  window.addEventListener("resize", drawShipCanvas);
  document.addEventListener("fullscreenchange", drawShipCanvas);

  window.advanceTime = (milliseconds) => {
    state.simTime += Number(milliseconds) || 0;
    drawShipCanvas();
    updateTextHooks();
  };
}

function animationLoop(timestamp) {
  const delta = Math.min(50, timestamp - state.lastFrameTime);
  state.lastFrameTime = timestamp;
  state.simTime += Math.max(delta, 0);
  drawShipCanvas();
  window.requestAnimationFrame(animationLoop);
}

async function init() {
  attachEvents();
  await loadMission(0, { skipAutoRun: true });
  drawShipCanvas();
  updateTextHooks();

  try {
    await initPyodide();
    await runMissionCode({ auto: true });
  } catch (error) {
    state.executionResult = {
      stdout: "",
      stderr: "",
      error: String(error),
      namedArrays: {},
      validation: {
        checks: [],
        summary: "The NumPy engine could not initialize. Check your internet connection or refresh the page.",
      },
      missionComplete: false,
    };
    setEngineStatus("NumPy engine failed to load", false);
    renderAll();
  }

  window.requestAnimationFrame(animationLoop);
}

init();
