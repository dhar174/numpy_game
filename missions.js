const EPSILON = 1e-6;

function approxEqual(actual, expected, epsilon = EPSILON) {
  return Math.abs(actual - expected) <= epsilon;
}

function deepApproxEqual(actual, expected, epsilon = EPSILON) {
  if (typeof actual === "number" && typeof expected === "number") {
    return approxEqual(actual, expected, epsilon);
  }

  if (typeof actual === "string" || typeof expected === "string") {
    return actual === expected;
  }

  if (typeof actual === "boolean" || typeof expected === "boolean") {
    return actual === expected;
  }

  if (actual === null || expected === null) {
    return actual === expected;
  }

  if (!Array.isArray(actual) || !Array.isArray(expected)) {
    return actual === expected;
  }

  if (actual.length !== expected.length) {
    return false;
  }

  return actual.every((item, index) =>
    deepApproxEqual(item, expected[index], epsilon),
  );
}

function shapeMatches(value, expectedShape) {
  return (
    value?.type === "ndarray" &&
    Array.isArray(value.shape) &&
    deepApproxEqual(value.shape, expectedShape)
  );
}

function dtypeMatches(value, expectedDtype) {
  return value?.type === "ndarray" && value.dtype === expectedDtype;
}

function ndarrayMatches(value, expectedData, options = {}) {
  if (value?.type !== "ndarray") {
    return false;
  }

  if (options.shape && !shapeMatches(value, options.shape)) {
    return false;
  }

  if (options.dtype && !dtypeMatches(value, options.dtype)) {
    return false;
  }

  return deepApproxEqual(value.data, expectedData, options.epsilon ?? EPSILON);
}

function getValue(namedArrays, key) {
  return namedArrays?.[key];
}

function scalarValue(namedArrays, key) {
  const value = getValue(namedArrays, key);
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "string") {
    return value;
  }
  return value?.value ?? value;
}

function checkConcepts(code, concepts) {
  return concepts.filter((concept) => concept.pattern.test(code));
}

function summarizeChecks(checks, successSummary, failSummary, focusVariable) {
  const complete = checks.every((check) => check.passed);
  return {
    complete,
    checks,
    summary: complete ? successSummary : failSummary,
    focusVariable,
  };
}

export function getConceptMatches(mission, code) {
  return checkConcepts(code, mission.expectedConcepts);
}

function validateBootBay(execution, code, conceptMatches) {
  const namedArrays = execution.namedArrays;
  const report = getValue(namedArrays, "report");

  const checks = [
    {
      label: "power_core is a 3x4 float64 zero matrix",
      passed: ndarrayMatches(getValue(namedArrays, "power_core"), [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ], { shape: [3, 4], dtype: "float64" }),
    },
    {
      label: "calibration uses linspace and reshape to form a 2x3 grid",
      passed: ndarrayMatches(getValue(namedArrays, "calibration"), [
        [0.1, 0.30000000000000004, 0.5],
        [0.7000000000000001, 0.9, 1.1],
      ], { shape: [2, 3], dtype: "float64", epsilon: 1e-8 }),
    },
    {
      label: "nanobots is a 2x2 int16 matrix filled with 7",
      passed: ndarrayMatches(getValue(namedArrays, "nanobots"), [
        [7, 7],
        [7, 7],
      ], { shape: [2, 2], dtype: "int16" }),
    },
    {
      label: "course_line comes from np.arange(10, 20, 2)",
      passed: ndarrayMatches(getValue(namedArrays, "course_line"), [10, 12, 14, 16, 18], {
        shape: [5],
      }),
    },
    {
      label: "report captures shape, ndim, size, and dtype",
      passed:
        report?.shape &&
        deepApproxEqual(report.shape, [2, 3]) &&
        report.ndim === 2 &&
        report.size === 6 &&
        report.dtype === "int16",
    },
    {
      label: "Creation and metadata functions are all present",
      passed: conceptMatches.length >= 8,
    },
  ];

  return summarizeChecks(
    checks,
    "Boot Bay is online. You built the first arrays and confirmed how NumPy tracks shape and dtype.",
    "Boot Bay still has a few mismatched arrays. Focus on creation helpers and the report metadata.",
    "calibration",
  );
}

function validateSensorDeck(execution, code, conceptMatches) {
  const namedArrays = execution.namedArrays;

  const checks = [
    {
      label: "first_row slices the first row correctly",
      passed: ndarrayMatches(getValue(namedArrays, "first_row"), [1, 2, 3, 4], { shape: [4] }),
    },
    {
      label: "scan_window captures the 2x3 sensor window",
      passed: ndarrayMatches(getValue(namedArrays, "scan_window"), [
        [6, 7, 8],
        [10, 11, 12],
      ], { shape: [2, 3] }),
    },
    {
      label: "priority uses fancy indexing to pull [2, 12, 13]",
      passed: ndarrayMatches(getValue(namedArrays, "priority"), [2, 12, 13], {
        shape: [3],
      }),
    },
    {
      label: "view_patch mutates the original sensor_grid through a view",
      passed: ndarrayMatches(getValue(namedArrays, "sensor_grid"), [
        [101, 102, 3, 4],
        [105, 106, 7, 8],
        [109, 110, 11, 12],
        [113, 114, 15, 16],
      ], { shape: [4, 4] }),
    },
    {
      label: "copy_patch is independent and keeps its own -999 edit",
      passed: Array.isArray(getValue(namedArrays, "copy_patch")?.data) &&
        getValue(namedArrays, "copy_patch").data[0]?.[0] === -999 &&
        getValue(namedArrays, "sensor_grid")?.data?.[0]?.[0] === 101,
    },
    {
      label: "Indexing, slicing, copy, and fancy indexing syntax all appear",
      passed: conceptMatches.length >= 5,
    },
  ];

  return summarizeChecks(
    checks,
    "Sensor Deck is aligned. You used slices, fancy indexing, and saw how a view can alter the parent array.",
    "Sensor Deck still needs precise indexing. Make sure the fancy index and copy vs. view behavior match the checklist.",
    "sensor_grid",
  );
}

function validateReactorGarden(execution, code, conceptMatches) {
  const namedArrays = execution.namedArrays;

  const checks = [
    {
      label: "magnitude applies np.abs to every reactor reading",
      passed: ndarrayMatches(getValue(namedArrays, "magnitude"), [
        [1, 4, 9],
        [16, 25, 36],
      ], { shape: [2, 3] }),
    },
    {
      label: "root_heat uses np.sqrt after abs",
      passed: ndarrayMatches(getValue(namedArrays, "root_heat"), [
        [1, 2, 3],
        [4, 5, 6],
      ], { shape: [2, 3], epsilon: 1e-8 }),
    },
    {
      label: "boosted adds the broadcast bias vector",
      passed: ndarrayMatches(getValue(namedArrays, "boosted"), [
        [1.5, 3, 4.5],
        [4.5, 6, 7.5],
      ], { shape: [2, 3], epsilon: 1e-8 }),
    },
    {
      label: "efficiency and log_signal use exp and log1p",
      passed:
        ndarrayMatches(getValue(namedArrays, "efficiency"), [
          [0.8607079764250578, 0.7408182206817179, 0.6376281516217733],
          [0.6376281516217733, 0.5488116360940264, 0.4723665527410147],
        ], { shape: [2, 3], epsilon: 1e-8 }) &&
        ndarrayMatches(getValue(namedArrays, "log_signal"), [
          [0.9162907318741551, 1.3862943611198906, 1.7047480922384253],
          [1.7047480922384253, 1.9459101490553132, 2.1400661634962708],
        ], { shape: [2, 3], epsilon: 1e-8 }),
    },
    {
      label: "danger flags every boosted value above 4",
      passed: ndarrayMatches(getValue(namedArrays, "danger"), [
        [false, false, true],
        [true, true, true],
      ], { shape: [2, 3] }),
    },
    {
      label: "Vectorized math, ufuncs, comparison, and broadcasting are used",
      passed: conceptMatches.length >= 7,
    },
  ];

  return summarizeChecks(
    checks,
    "Reactor Garden is stabilized. Your NumPy ufuncs and broadcast math tuned every lane at once.",
    "Reactor Garden still shows waveform drift. Recheck the ufunc chain and the broadcast bias vector.",
    "boosted",
  );
}

function validateQuarantineLab(execution, code, conceptMatches) {
  const namedArrays = execution.namedArrays;

  const checks = [
    {
      label: "finite_mask spots the non-NaN cells",
      passed: ndarrayMatches(getValue(namedArrays, "finite_mask"), [
        [true, false, true],
        [true, true, false],
        [true, true, true],
      ], { shape: [3, 3] }),
    },
    {
      label: "clean replaces NaN with 0.0 using np.where",
      passed: ndarrayMatches(getValue(namedArrays, "clean"), [
        [1.2, 0, 3.5],
        [0.4, -1.2, 0],
        [2.1, 0, 4.4],
      ], { shape: [3, 3], epsilon: 1e-8 }),
    },
    {
      label: "safe_mask and filtered keep only readings >= 0.5",
      passed:
        ndarrayMatches(getValue(namedArrays, "safe_mask"), [
          [true, false, true],
          [false, false, false],
          [true, false, true],
        ], { shape: [3, 3] }) &&
        ndarrayMatches(getValue(namedArrays, "filtered"), [1.2, 3.5, 2.1, 4.4], {
          shape: [4],
          epsilon: 1e-8,
        }),
    },
    {
      label: "has_breach and all_stable summarize the mask with any/all",
      passed: scalarValue(namedArrays, "has_breach") === true && scalarValue(namedArrays, "all_stable") === true,
    },
    {
      label: "quarantine keeps only the safe cells",
      passed: ndarrayMatches(getValue(namedArrays, "quarantine"), [
        [1.2, 0, 3.5],
        [0, 0, 0],
        [2.1, 0, 4.4],
      ], { shape: [3, 3], epsilon: 1e-8 }),
    },
    {
      label: "Masking, where, filtering, any, and all all appear in code",
      passed: conceptMatches.length >= 6,
    },
  ];

  return summarizeChecks(
    checks,
    "Quarantine Lab is clear. You cleaned NaNs, filtered with masks, and summarized the room with any/all.",
    "Quarantine Lab still has unstable samples. Check the NaN cleanup, safe mask, and summary booleans.",
    "quarantine",
  );
}

function validateCargoForge(execution, code, conceptMatches) {
  const namedArrays = execution.namedArrays;
  const sections = getValue(namedArrays, "sections");

  const checks = [
    {
      label: "reshaped turns crates into a 2x6 matrix",
      passed: ndarrayMatches(getValue(namedArrays, "reshaped"), [
        [1, 2, 3, 4, 5, 6],
        [7, 8, 9, 10, 11, 12],
      ], { shape: [2, 6] }),
    },
    {
      label: "flat_view and flat_copy both flatten the cargo in order",
      passed:
        ndarrayMatches(getValue(namedArrays, "flat_view"), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], {
          shape: [12],
        }) &&
        ndarrayMatches(getValue(namedArrays, "flat_copy"), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], {
          shape: [12],
        }),
    },
    {
      label: "transposed and swapped rotate cargo axes",
      passed:
        ndarrayMatches(getValue(namedArrays, "transposed"), [
          [1, 5, 9],
          [2, 6, 10],
          [3, 7, 11],
          [4, 8, 12],
        ], { shape: [4, 3] }) &&
        ndarrayMatches(getValue(namedArrays, "swapped"), [
          [
            [1, 5],
            [3, 7],
          ],
          [
            [2, 6],
            [4, 8],
          ],
        ], { shape: [2, 2, 2] }),
    },
    {
      label: "merged and stacked combine the left and right modules",
      passed:
        ndarrayMatches(getValue(namedArrays, "merged"), [
          [1, 2, 5, 6],
          [3, 4, 7, 8],
        ], { shape: [2, 4] }) &&
        ndarrayMatches(getValue(namedArrays, "stacked"), [
          [
            [1, 2],
            [3, 4],
          ],
          [
            [5, 6],
            [7, 8],
          ],
        ], { shape: [2, 2, 2] }),
    },
    {
      label: "split, repeat, and tile all match the cargo brief",
      passed:
        Array.isArray(sections) &&
        sections.length === 3 &&
        ndarrayMatches(sections[0], [0, 1, 2, 3], { shape: [4] }) &&
        ndarrayMatches(sections[1], [4, 5, 6, 7], { shape: [4] }) &&
        ndarrayMatches(sections[2], [8, 9, 10, 11], { shape: [4] }) &&
        ndarrayMatches(getValue(namedArrays, "repeated"), [1, 1, 2, 2, 3, 3], { shape: [6] }) &&
        ndarrayMatches(getValue(namedArrays, "tiled"), [
          [1, 0, 1, 0],
          [0, 1, 0, 1],
          [1, 0, 1, 0],
          [0, 1, 0, 1],
        ], { shape: [4, 4] }),
    },
    {
      label: "Reshape, transpose, stack, split, repeat, and tile all appear",
      passed: conceptMatches.length >= 10,
    },
  ];

  return summarizeChecks(
    checks,
    "Cargo Forge is packed and indexed. You reshaped, stacked, split, and tiled your way through the hold.",
    "Cargo Forge still has cargo drift. Double-check the axis transforms and the split/repeat/tile outputs.",
    "stacked",
  );
}

function validateDroneBridge(execution, code, conceptMatches) {
  const namedArrays = execution.namedArrays;

  const checks = [
    {
      label: "rng is a Generator seeded with np.random.default_rng",
      passed: getValue(namedArrays, "rng")?.type === "Generator",
    },
    {
      label: "traffic is the expected 3x4 random grid for seed 7",
      passed: ndarrayMatches(getValue(namedArrays, "traffic"), [
        [19, 13, 14, 18],
        [12, 15, 17, 6],
        [2, 7, 7, 17],
      ], { shape: [3, 4] }),
    },
    {
      label: "Axis reductions return the correct totals, means, min, max, and std",
      passed:
        ndarrayMatches(getValue(namedArrays, "totals"), [64, 50, 33], { shape: [3] }) &&
        ndarrayMatches(getValue(namedArrays, "means"), [11, 11.666666666666666, 12.666666666666666, 13.666666666666666], {
          shape: [4],
          epsilon: 1e-8,
        }) &&
        scalarValue(namedArrays, "minimum") === 2 &&
        scalarValue(namedArrays, "maximum") === 19 &&
        approxEqual(Number(scalarValue(namedArrays, "spread")), 5.277704677856337, 1e-8),
    },
    {
      label: "argmin, argmax, sort, argsort, and unique all line up",
      passed:
        scalarValue(namedArrays, "argmin_idx") === 8 &&
        scalarValue(namedArrays, "argmax_idx") === 0 &&
        ndarrayMatches(getValue(namedArrays, "sorted_rows"), [
          [13, 14, 18, 19],
          [6, 12, 15, 17],
          [2, 7, 7, 17],
        ], { shape: [3, 4] }) &&
        ndarrayMatches(getValue(namedArrays, "sort_order"), [1, 2, 3, 0], { shape: [4] }) &&
        ndarrayMatches(getValue(namedArrays, "unique_codes"), [2, 3, 5, 7], { shape: [4] }),
    },
    {
      label: "navigation and energy_dot use matrix math and np.dot",
      passed:
        ndarrayMatches(getValue(namedArrays, "navigation"), [
          [2, 5],
          [9, 9],
        ], { shape: [2, 2] }) &&
        scalarValue(namedArrays, "energy_dot") === 32,
    },
    {
      label: "Generator, reductions, ordering, unique, dot, and matmul all appear",
      passed: conceptMatches.length >= 11,
    },
  ];

  return summarizeChecks(
    checks,
    "Drone Bridge is navigating cleanly. You combined seeded randomness, aggregation, sorting, and matrix math.",
    "Drone Bridge still has route noise. Verify the seed, axis choices, and both matrix operations.",
    "navigation",
  );
}

function validateCapstone(execution, code, conceptMatches) {
  const namedArrays = execution.namedArrays;

  const checks = [
    {
      label: "grid is created with arange and reshaped to 4x4",
      passed: ndarrayMatches(getValue(namedArrays, "grid"), [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ], { shape: [4, 4] }),
    },
    {
      label: "safe uses a boolean mask and np.where to keep even cells",
      passed: ndarrayMatches(getValue(namedArrays, "safe"), [
        [0, 2, 0, 4],
        [0, 6, 0, 8],
        [0, 10, 0, 12],
        [0, 14, 0, 16],
      ], { shape: [4, 4] }),
    },
    {
      label: "boosted applies the broadcast repair vector and row_power sums axis 1",
      passed:
        ndarrayMatches(getValue(namedArrays, "boosted"), [
          [0, 7, 10, 19],
          [0, 11, 10, 23],
          [0, 15, 10, 27],
          [0, 19, 10, 31],
        ], { shape: [4, 4] }) &&
        ndarrayMatches(getValue(namedArrays, "row_power"), [36, 44, 52, 60], {
          shape: [4],
        }),
    },
    {
      label: "matrix reshapes to 2x8 and course uses matrix multiplication",
      passed:
        ndarrayMatches(getValue(namedArrays, "matrix"), [
          [0, 7, 10, 19, 0, 11, 10, 23],
          [0, 15, 10, 27, 0, 19, 10, 31],
        ], { shape: [2, 8] }) &&
        ndarrayMatches(getValue(namedArrays, "course"), [
          [44.6, 76.4],
          [52.6, 116.4],
        ], { shape: [2, 2], epsilon: 1e-8 }),
    },
    {
      label: "rescue_score reports the final mean energy",
      passed: approxEqual(Number(scalarValue(namedArrays, "rescue_score")), 72.5, 1e-8),
    },
    {
      label: "The capstone uses creation, masking, broadcasting, aggregation, reshape, and matmul",
      passed: conceptMatches.length >= 7,
    },
  ];

  return summarizeChecks(
    checks,
    "The colony ship is back online. You fused creation, masking, broadcasting, reduction, reshaping, and matrix math into one rescue sequence.",
    "The final rescue path is close. Revisit the even mask, broadcast vector, axis sum, reshape, and matrix multiplication steps.",
    "course",
  );
}

export const missions = [
  {
    id: "boot-bay",
    sectorLabel: "Sector 1",
    sector: "Boot Bay",
    title: "Cold Start Arrays",
    shortDescription: "Creation functions, shape, ndim, size, dtype",
    storyPrompt:
      "The ship wakes in pieces. Boot Bay can only relight the cryo decks if you rebuild the first power arrays and prove you understand what an ndarray knows about itself.",
    learningGoals: [
      "Create arrays with np.array, zeros, full, arange, and linspace.",
      "Inspect shape, ndim, size, and dtype on an ndarray.",
      "Use dtype deliberately for int16 and float64 systems.",
    ],
    tasks: [
      "Turn power_core into a 3x4 float64 grid of zeros.",
      "Build calibration as a 2x3 linspace from 0.1 to 1.1.",
      "Fill nanobots with 7 using np.full and dtype np.int16.",
      "Create course_line as np.arange(10, 20, 2).",
      "Update report to capture boot_matrix shape, ndim, size, and dtype.",
    ],
    initialArrays: {
      power_core: "Reactor cells",
      calibration: "Thruster tuning values",
      nanobots: "Repair swarm count",
      boot_matrix: "Diagnostic matrix",
    },
    expectedConcepts: [
      { label: "np.array", pattern: /np\.array\s*\(/ },
      { label: "np.zeros", pattern: /np\.zeros\s*\(/ },
      { label: "np.full", pattern: /np\.full\s*\(/ },
      { label: "np.arange", pattern: /np\.arange\s*\(/ },
      { label: "np.linspace", pattern: /np\.linspace\s*\(/ },
      { label: ".shape", pattern: /\.shape\b/ },
      { label: ".ndim", pattern: /\.ndim\b/ },
      { label: ".size", pattern: /\.size\b/ },
      { label: "dtype", pattern: /dtype/ },
    ],
    starterCode: `# Boot Bay: restore the starter arrays.
# NumPy is already imported as np.

power_core = np.ones((2, 2), dtype=np.float64)
calibration = np.arange(6)
nanobots = np.array([1, 1, 1, 1], dtype=np.int16)
boot_matrix = np.array([[2, 4, 6], [8, 10, 12]], dtype=np.int16)
course_line = np.array([0.0, 1.0, 2.0])

report = {
    "shape": boot_matrix.shape,
    "ndim": boot_matrix.ndim,
    "size": boot_matrix.size,
    "dtype": str(boot_matrix.dtype),
}

print("Boot Bay arrays online.")
`,
    hints: [
      "Remember: np.zeros((rows, cols), dtype=np.float64) creates a 2D float grid.",
      "np.linspace(start, stop, count) is a great way to make evenly spaced calibration values.",
      "You can reshape a 1D result with .reshape(2, 3) after linspace or arange.",
    ],
    validator: validateBootBay,
  },
  {
    id: "sensor-deck",
    sectorLabel: "Sector 2",
    sector: "Sensor Deck",
    title: "Views Through the Glass",
    shortDescription: "Indexing, slicing, fancy indexing, views vs copies",
    storyPrompt:
      "Sensor Deck is blind. You need to splice out precise windows from a scanning matrix and prove that one slice is a live view while another is a safe copy.",
    learningGoals: [
      "Index rows and submatrices from an ndarray.",
      "Use fancy indexing with matching index arrays.",
      "See the difference between a view and a copy.",
    ],
    tasks: [
      "Fix first_row so it grabs the first row of sensor_grid.",
      "Fix scan_window so it captures rows 1:3 and cols 1:4.",
      "Use fancy indexing to pull [2, 12, 13] into priority.",
      "Make copy_patch a true copy before you edit it.",
      "Mutate view_patch by adding 100 so the parent sensor_grid changes too.",
    ],
    initialArrays: {
      sensor_grid: "Main sensor matrix",
      scan_window: "Focused scan region",
      priority: "Critical picks",
    },
    expectedConcepts: [
      { label: "arange+reshape", pattern: /arange\s*\([^)]*\)\.reshape\s*\(/ },
      { label: "row index", pattern: /\[\s*0\s*\]/ },
      { label: "slice", pattern: /\[\s*1\s*:\s*3\s*,\s*1\s*:\s*4\s*\]/ },
      { label: "fancy index", pattern: /\[\s*\[\s*0\s*,\s*2\s*,\s*3\s*\]\s*,\s*\[\s*1\s*,\s*3\s*,\s*0\s*\]\s*\]/ },
      { label: ".copy()", pattern: /\.copy\s*\(/ },
    ],
    starterCode: `# Sensor Deck: restore visibility.

sensor_grid = np.arange(1, 17).reshape(4, 4)

first_row = sensor_grid[1]
scan_window = sensor_grid[0:2, 0:2]
priority = sensor_grid[[0, 1, 2], [0, 1, 2]]
view_patch = sensor_grid[:, :2]
copy_patch = sensor_grid[:, :2]

view_patch[:] = view_patch
copy_patch[0, 0] = copy_patch[0, 0]

print("Sensor deck aligned.")
`,
    hints: [
      "Python slices stop just before the end index, so 1:3 means rows 1 and 2.",
      "Fancy indexing can pair row and column index arrays element-by-element.",
      "A slice is usually a view; add .copy() when you want independence.",
    ],
    validator: validateSensorDeck,
  },
  {
    id: "reactor-garden",
    sectorLabel: "Sector 3",
    sector: "Reactor Garden",
    title: "Broadcast Bloom",
    shortDescription: "Vectorized arithmetic, ufuncs, comparisons, broadcasting",
    storyPrompt:
      "The ship's reactor planters pulse like a neon garden. Tune the waveform by running NumPy math over whole arrays instead of touching one cell at a time.",
    learningGoals: [
      "Apply ufuncs like abs, sqrt, sin, exp, and log1p to entire arrays.",
      "Use vectorized comparisons to make a danger mask.",
      "Broadcast a 1D bias vector across each reactor row.",
    ],
    tasks: [
      "Use np.abs to create magnitude from heat.",
      "Use np.sqrt on magnitude to create root_heat.",
      "Make wave with np.sin(root_heat).",
      "Broadcast bias across root_heat to create boosted.",
      "Create efficiency with np.exp(-boosted / 10) and log_signal with np.log1p(boosted).",
      "Flag boosted > 4 inside danger.",
    ],
    initialArrays: {
      heat: "Signed reactor readings",
      bias: "Broadcast lane bias",
      boosted: "Bias-adjusted roots",
    },
    expectedConcepts: [
      { label: "np.abs", pattern: /np\.abs\s*\(/ },
      { label: "np.sqrt", pattern: /np\.sqrt\s*\(/ },
      { label: "np.sin", pattern: /np\.sin\s*\(/ },
      { label: "broadcast add", pattern: /\+\s*bias\b/ },
      { label: "np.exp", pattern: /np\.exp\s*\(/ },
      { label: "np.log1p", pattern: /np\.log1p\s*\(/ },
      { label: "comparison", pattern: />\s*4/ },
    ],
    starterCode: `# Reactor Garden: tune the waveform.

heat = np.array([[1.0, -4.0, 9.0], [16.0, -25.0, 36.0]])
bias = np.array([0.5, 1.0, 1.5])

magnitude = heat
root_heat = magnitude
wave = magnitude
boosted = root_heat
efficiency = root_heat
log_signal = root_heat
danger = heat

print("Reactor waveforms tuned.")
`,
    hints: [
      "np.abs can clean up negative values before you take square roots.",
      "Adding a 1D array of length 3 to a 2x3 matrix broadcasts across rows.",
      "Comparison operators like > return boolean arrays element-by-element.",
    ],
    validator: validateReactorGarden,
  },
  {
    id: "quarantine-lab",
    sectorLabel: "Sector 4",
    sector: "Quarantine Lab",
    title: "Mask the Contagion",
    shortDescription: "Boolean masks, where, filtering, any, all, NaN cleanup",
    storyPrompt:
      "Spores leaked into the bio lab. You need masks that find missing readings, filter out unsafe samples, and summarize the room before the contamination spreads.",
    learningGoals: [
      "Use np.isnan and boolean logic to spot missing data.",
      "Replace NaN with safe fill values using np.where.",
      "Filter arrays with masks and summarize them with np.any and np.all.",
    ],
    tasks: [
      "Create finite_mask with ~np.isnan(samples).",
      "Replace NaN values in clean with 0.0 using np.where.",
      "Create safe_mask for clean values >= 0.5.",
      "Use the mask to build filtered and quarantine.",
      "Set has_breach with np.any(clean < 0) and all_stable with np.all(clean <= 5).",
    ],
    initialArrays: {
      samples: "Raw bio readings",
      clean: "NaN-free sample grid",
      quarantine: "Safe output lanes",
    },
    expectedConcepts: [
      { label: "np.isnan", pattern: /np\.isnan\s*\(/ },
      { label: "~ mask", pattern: /~\s*np\.isnan/ },
      { label: "np.where", pattern: /np\.where\s*\(/ },
      { label: "boolean filter", pattern: /\[\s*safe_mask\s*\]/ },
      { label: "np.any", pattern: /np\.any\s*\(/ },
      { label: "np.all", pattern: /np\.all\s*\(/ },
    ],
    starterCode: `# Quarantine Lab: stabilize the samples.

samples = np.array([
    [1.2, np.nan, 3.5],
    [0.4, -1.2, np.nan],
    [2.1, 0.0, 4.4],
], dtype=np.float64)

finite_mask = samples
clean = samples
safe_mask = clean
filtered = clean
has_breach = False
all_stable = False
quarantine = clean

print("Lab quarantine sweep staged.")
`,
    hints: [
      "np.isnan returns a boolean array that is perfect for masking missing values.",
      "np.where(condition, when_true, when_false) works element-by-element on the whole grid.",
      "You can filter an array directly with clean[safe_mask].",
    ],
    validator: validateQuarantineLab,
  },
  {
    id: "cargo-forge",
    sectorLabel: "Sector 5",
    sector: "Cargo Forge",
    title: "Crate Choreography",
    shortDescription: "Reshape, flatten, transpose, swapaxes, concatenate, stack, split, repeat, tile",
    storyPrompt:
      "Cargo Forge is a shifting puzzle of crates and drones. Repack the hold by bending dimensions, merging layouts, and cloning patterns without losing track of the data.",
    learningGoals: [
      "Reshape, ravel, and flatten arrays into new views or copies.",
      "Rotate axes with transpose and swapaxes.",
      "Combine and split arrays with concatenate, stack, and split.",
      "Repeat and tile patterns to build structured layouts.",
    ],
    tasks: [
      "Reshape crates into a 2x6 matrix called reshaped.",
      "Create flat_view with ravel() and flat_copy with flatten().",
      "Transpose crates and swap the axes of cube.",
      "Concatenate left and right along axis 1 into merged.",
      "Stack left and right into stacked, split np.arange(12) into sections, then create repeated and tiled patterns.",
    ],
    initialArrays: {
      crates: "Cargo manifest grid",
      cube: "3D crate stack",
      stacked: "Combined cargo layers",
    },
    expectedConcepts: [
      { label: "reshape", pattern: /reshape\s*\(/ },
      { label: "ravel", pattern: /ravel\s*\(/ },
      { label: "flatten", pattern: /flatten\s*\(/ },
      { label: "transpose", pattern: /\.T\b|transpose\s*\(/ },
      { label: "swapaxes", pattern: /swapaxes\s*\(/ },
      { label: "concatenate", pattern: /concatenate\s*\(/ },
      { label: "stack", pattern: /stack\s*\(/ },
      { label: "split", pattern: /split\s*\(/ },
      { label: "repeat", pattern: /repeat\s*\(/ },
      { label: "tile", pattern: /tile\s*\(/ },
    ],
    starterCode: `# Cargo Forge: repack the hold.

crates = np.arange(1, 13).reshape(3, 4)
left = np.array([[1, 2], [3, 4]])
right = np.array([[5, 6], [7, 8]])
cube = np.arange(1, 9).reshape(2, 2, 2)

reshaped = crates
flat_view = crates
flat_copy = crates
transposed = crates
swapped = cube
merged = left
stacked = left
sections = np.array([1, 2, 3])
repeated = np.array([1, 2, 3])
tiled = left

print("Cargo patterns queued.")
`,
    hints: [
      "ravel() often returns a flattened view, while flatten() returns a new copy.",
      "The transpose shortcut for a 2D array is array.T.",
      "np.tile can repeat a small pattern in both row and column directions.",
    ],
    validator: validateCargoForge,
  },
  {
    id: "drone-bridge",
    sectorLabel: "Sector 6",
    sector: "Drone Bridge",
    title: "Route the Swarm",
    shortDescription: "Aggregations, axis semantics, sorting, unique, random Generator, dot, matmul",
    storyPrompt:
      "The drone fleet is awake but drifting. Seed the route planner, measure traffic along the right axes, and compute a clean navigation matrix before the swarm collides.",
    learningGoals: [
      "Generate repeatable random values with np.random.default_rng().",
      "Use reduction ops like sum, mean, min, max, std, argmin, and argmax along the right axis.",
      "Sort, argsort, and deduplicate values with unique.",
      "Compare dot products and matrix multiplication.",
    ],
    tasks: [
      "Seed rng with np.random.default_rng(7) and generate traffic with integers(2, 20, size=(3, 4)).",
      "Compute totals across rows and means across columns.",
      "Capture minimum, maximum, std, argmin_idx, and argmax_idx.",
      "Sort each traffic row, argsort the first row, and create unique_codes from [2, 2, 3, 5, 5, 7].",
      "Use route_a @ route_b for navigation and np.dot on [1, 2, 3] and [4, 5, 6] for energy_dot.",
    ],
    initialArrays: {
      traffic: "Drone traffic grid",
      navigation: "Matrix-multiplied route map",
      unique_codes: "Deduplicated flight IDs",
    },
    expectedConcepts: [
      { label: "default_rng", pattern: /default_rng\s*\(/ },
      { label: "integers", pattern: /integers\s*\(/ },
      { label: "sum(axis=1)", pattern: /sum\s*\(\s*axis\s*=\s*1\s*\)/ },
      { label: "mean(axis=0)", pattern: /mean\s*\(\s*axis\s*=\s*0\s*\)/ },
      { label: "std", pattern: /std\s*\(/ },
      { label: "argmin", pattern: /argmin\s*\(/ },
      { label: "argmax", pattern: /argmax\s*\(/ },
      { label: "sort", pattern: /sort\s*\(/ },
      { label: "argsort", pattern: /argsort\s*\(/ },
      { label: "unique", pattern: /unique\s*\(/ },
      { label: "matmul", pattern: /@|matmul\s*\(/ },
      { label: "dot", pattern: /dot\s*\(/ },
    ],
    starterCode: `# Drone Bridge: route the swarm.

rng = np.random.default_rng(0)
traffic = np.zeros((3, 4), dtype=int)
totals = traffic
means = traffic
minimum = 0
maximum = 0
spread = 0.0
argmin_idx = 0
argmax_idx = 0
sorted_rows = traffic
sort_order = np.array([])
unique_codes = np.array([])
route_a = np.array([[2, 1, 0], [1, 3, 2]])
route_b = np.array([[1, 2], [0, 1], [4, 2]])
navigation = route_a
energy_dot = 0

print("Drone bridge awaiting routes.")
`,
    hints: [
      "A Generator from np.random.default_rng(seed) gives repeatable random values.",
      "axis=1 reduces across columns inside each row, while axis=0 reduces down the rows for each column.",
      "The @ operator performs matrix multiplication when the shapes line up.",
    ],
    validator: validateDroneBridge,
  },
  {
    id: "colony-core",
    sectorLabel: "Sector 7",
    sector: "Colony Core",
    title: "Final Rescue Sequence",
    shortDescription: "Capstone: creation, masking, broadcasting, aggregation, reshape, matrix math",
    storyPrompt:
      "The colony ship can jump only once. Rebuild the final energy route from scratch by combining the NumPy tools you learned in every sector. Scalar tinkering will not save the crew.",
    learningGoals: [
      "Create a structured grid from scratch with arange and reshape.",
      "Use a boolean mask with where to keep only the useful cells.",
      "Broadcast a repair vector, reduce with axis-aware sums, reshape, and finish with matrix multiplication.",
    ],
    tasks: [
      "Create grid as np.arange(1, 17).reshape(4, 4).",
      "Use np.where(grid % 2 == 0, grid, 0) to build safe.",
      "Broadcast [0, 5, 10, 15] across safe to build boosted.",
      "Compute row_power with boosted.sum(axis=1).",
      "Reshape boosted into matrix with shape (2, 8).",
      "Multiply matrix @ weights into course and set rescue_score to course.mean().",
    ],
    initialArrays: {
      grid: "Core energy grid",
      boosted: "Broadcast-repaired lanes",
      course: "Jump matrix",
    },
    expectedConcepts: [
      { label: "arange", pattern: /arange\s*\(/ },
      { label: "reshape", pattern: /reshape\s*\(/ },
      { label: "where", pattern: /where\s*\(/ },
      { label: "mod mask", pattern: /%\s*2/ },
      { label: "broadcast vector", pattern: /\+\s*np\.array\s*\(\s*\[\s*0\s*,\s*5\s*,\s*10\s*,\s*15\s*\]\s*\)/ },
      { label: "sum(axis=1)", pattern: /sum\s*\(\s*axis\s*=\s*1\s*\)/ },
      { label: "matmul", pattern: /@|matmul\s*\(/ },
    ],
    starterCode: `# Colony Core: execute the rescue sequence.

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

grid = np.arange(16).reshape(4, 4)
safe = grid
row_power = np.zeros(4)
boosted = grid
matrix = grid
course = np.zeros((2, 2))
rescue_score = 0.0

print("Colony Core rescue path pending.")
`,
    hints: [
      "Build the final grid from 1 through 16, not 0 through 15.",
      "A boolean mask like grid % 2 == 0 pairs naturally with np.where.",
      "The capstone should chain whole-array operations together. Avoid hand-typing the final numbers.",
    ],
    validator: validateCapstone,
  },
];
