const STORAGE_KEY = "unit-price-checker-state-v1";
const ITEM_COUNT = 3;
const SHELF_TAG_TOLERANCE_PERCENT = 0.02;
const SHELF_TAG_TOLERANCE_ABSOLUTE = 0.005;
const DEFAULT_SHARE_BUNDLE_STATUS = "Updates automatically as you type.";
const TARGET_PRESETS_BY_FAMILY = {
  weight: [
    { amount: 16, unit: "oz", label: "16 oz" },
    { amount: 32, unit: "oz", label: "32 oz" },
    { amount: 64, unit: "oz", label: "64 oz" },
    { amount: 5, unit: "lb", label: "5 lb" },
  ],
  volume: [
    { amount: 12, unit: "floz", label: "12 fl oz" },
    { amount: 32, unit: "floz", label: "32 fl oz" },
    { amount: 64, unit: "floz", label: "64 fl oz" },
    { amount: 1, unit: "gal", label: "1 gal" },
  ],
  count: [
    { amount: 6, unit: "each", label: "6 count" },
    { amount: 12, unit: "each", label: "12 count" },
    { amount: 24, unit: "each", label: "24 count" },
    { amount: 1, unit: "dozen", label: "1 dozen" },
  ],
};

const UNITS = [
  { value: "g", label: "grams (g)", shortLabel: "g", family: "weight", factor: 1 },
  { value: "kg", label: "kilograms (kg)", shortLabel: "kg", family: "weight", factor: 1000 },
  { value: "oz", label: "ounces (oz)", shortLabel: "oz", family: "weight", factor: 28.349523125 },
  { value: "lb", label: "pounds (lb)", shortLabel: "lb", family: "weight", factor: 453.59237 },
  { value: "ml", label: "milliliters (mL)", shortLabel: "mL", family: "volume", factor: 1 },
  { value: "l", label: "liters (L)", shortLabel: "L", family: "volume", factor: 1000 },
  { value: "floz", label: "fluid ounces (fl oz)", shortLabel: "fl oz", family: "volume", factor: 29.5735295625 },
  { value: "cup", label: "cups", shortLabel: "cup", family: "volume", factor: 236.5882365 },
  { value: "pt", label: "pints", shortLabel: "pt", family: "volume", factor: 473.176473 },
  { value: "qt", label: "quarts", shortLabel: "qt", family: "volume", factor: 946.352946 },
  { value: "gal", label: "gallons", shortLabel: "gal", family: "volume", factor: 3785.411784 },
  { value: "each", label: "count (each)", shortLabel: "each", family: "count", factor: 1 },
  { value: "dozen", label: "dozens", shortLabel: "dozen", family: "count", factor: 12 },
];

const UNITS_BY_VALUE = Object.fromEntries(UNITS.map((unit) => [unit.value, unit]));
const DEFAULT_UNIT_BY_FAMILY = {
  weight: "oz",
  volume: "floz",
  count: "each",
};

const SAMPLE_STATE = {
  comparisonUnit: "oz",
  targetAmount: "64",
  targetUnit: "oz",
  items: [
    {
      name: "Store brand oats",
      price: "4.29",
      size: "32",
      unit: "oz",
      packCount: "1",
      coupon: "0",
      shelfTagPrice: "0.15",
      shelfTagUnit: "oz",
    },
    {
      name: "Name brand oats",
      price: "6.49",
      size: "42",
      unit: "oz",
      packCount: "1",
      coupon: "1.00",
      shelfTagPrice: "0.13",
      shelfTagUnit: "oz",
    },
    {
      name: "Warehouse pack",
      price: "7.99",
      size: "2",
      unit: "lb",
      packCount: "1",
      coupon: "0",
      shelfTagPrice: "0.25",
      shelfTagUnit: "oz",
    },
  ],
};

const STARTER_PRESETS = [
  {
    id: "cereal",
    label: "Breakfast cereal",
    description: "18 oz vs family size vs warehouse bag",
    state: {
      comparisonUnit: "oz",
      targetAmount: "36",
      targetUnit: "oz",
      items: [
        {
          name: "Store brand cereal",
          price: "4.79",
          size: "18",
          unit: "oz",
          packCount: "1",
          coupon: "0",
          shelfTagPrice: "0.27",
          shelfTagUnit: "oz",
        },
        {
          name: "Family size cereal",
          price: "6.99",
          size: "27.5",
          unit: "oz",
          packCount: "1",
          coupon: "1.50",
          shelfTagPrice: "0.25",
          shelfTagUnit: "oz",
        },
        {
          name: "Warehouse cereal bag",
          price: "9.98",
          size: "40",
          unit: "oz",
          packCount: "1",
          coupon: "0",
          shelfTagPrice: "0.28",
          shelfTagUnit: "oz",
        },
      ],
    },
  },
  {
    id: "paper-towels",
    label: "Paper towels",
    description: "2-pack vs 6-pack vs coupon bundle",
    state: {
      comparisonUnit: "each",
      targetAmount: "6",
      targetUnit: "each",
      items: [
        {
          name: "Store brand 2-pack",
          price: "4.49",
          size: "2",
          unit: "each",
          packCount: "1",
          coupon: "0",
          shelfTagPrice: "2.25",
          shelfTagUnit: "each",
        },
        {
          name: "Club 6-pack",
          price: "10.99",
          size: "6",
          unit: "each",
          packCount: "1",
          coupon: "0",
          shelfTagPrice: "1.83",
          shelfTagUnit: "each",
        },
        {
          name: "Name brand 3-pack deal",
          price: "7.99",
          size: "3",
          unit: "each",
          packCount: "1",
          coupon: "1.00",
          shelfTagPrice: "2.33",
          shelfTagUnit: "each",
        },
      ],
    },
  },
  {
    id: "sparkling-water",
    label: "Sparkling water",
    description: "Single cans vs 8-pack vs 12-pack",
    state: {
      comparisonUnit: "floz",
      targetAmount: "96",
      targetUnit: "floz",
      items: [
        {
          name: "Single cans",
          price: "5.00",
          size: "12",
          unit: "floz",
          packCount: "4",
          coupon: "0",
          shelfTagPrice: "0.10",
          shelfTagUnit: "floz",
        },
        {
          name: "8-pack lime",
          price: "5.99",
          size: "12",
          unit: "floz",
          packCount: "8",
          coupon: "0",
          shelfTagPrice: "0.06",
          shelfTagUnit: "floz",
        },
        {
          name: "12-pack variety",
          price: "8.99",
          size: "12",
          unit: "floz",
          packCount: "12",
          coupon: "1.00",
          shelfTagPrice: "0.07",
          shelfTagUnit: "floz",
        },
      ],
    },
  },
  {
    id: "coffee",
    label: "Ground coffee",
    description: "12 oz bag vs 20 oz can vs warehouse whole bean",
    state: {
      comparisonUnit: "oz",
      targetAmount: "24",
      targetUnit: "oz",
      items: [
        {
          name: "Store brand bag",
          price: "7.99",
          size: "12",
          unit: "oz",
          packCount: "1",
          coupon: "0",
          shelfTagPrice: "0.67",
          shelfTagUnit: "oz",
        },
        {
          name: "Name brand can",
          price: "12.49",
          size: "20",
          unit: "oz",
          packCount: "1",
          coupon: "2.00",
          shelfTagPrice: "0.52",
          shelfTagUnit: "oz",
        },
        {
          name: "Warehouse whole bean",
          price: "18.99",
          size: "2.5",
          unit: "lb",
          packCount: "1",
          coupon: "0",
          shelfTagPrice: "0.50",
          shelfTagUnit: "oz",
        },
      ],
    },
  },
];

const elements = {
  cards: document.querySelector("#cards"),
  template: document.querySelector("#item-template"),
  comparisonUnit: document.querySelector("#comparison-unit"),
  targetAmount: document.querySelector("#target-amount"),
  targetUnit: document.querySelector("#target-unit"),
  targetPresets: document.querySelector("#target-presets"),
  starterPresets: document.querySelector("#starter-presets"),
  familyWarning: document.querySelector("#family-warning"),
  shelfAuditNotice: document.querySelector("#shelf-audit-notice"),
  summaryEmpty: document.querySelector("#summary-empty"),
  summaryContent: document.querySelector("#summary-content"),
  winnerName: document.querySelector("#winner-name"),
  winnerPriceLine: document.querySelector("#winner-price-line"),
  winnerContext: document.querySelector("#winner-context"),
  tripCard: document.querySelector("#trip-card"),
  tripWinnerName: document.querySelector("#trip-winner-name"),
  tripPriceLine: document.querySelector("#trip-price-line"),
  tripContext: document.querySelector("#trip-context"),
  winnerSplitExplainer: document.querySelector("#winner-split-explainer"),
  winnerSplitHeading: document.querySelector("#winner-split-heading"),
  winnerSplitBody: document.querySelector("#winner-split-body"),
  rankingList: document.querySelector("#ranking-list"),
  shareBundle: document.querySelector("#share-bundle"),
  shareBundleText: document.querySelector("#share-bundle-text"),
  shareBundleStatus: document.querySelector("#share-bundle-status"),
  copyVerdict: document.querySelector("#copy-verdict"),
  loadSample: document.querySelector("#load-sample"),
  copyLink: document.querySelector("#copy-link"),
  installApp: document.querySelector("#install-app"),
  installStrip: document.querySelector("#install-strip"),
  installStripButton: document.querySelector("#install-strip-button"),
  installStatus: document.querySelector("#install-status"),
  resetForm: document.querySelector("#reset-form"),
};

let state = loadState();
let currentShareBundleText = "";
let copyVerdictResetTimer = 0;
let deferredInstallPrompt = null;

renderCards();
applyStateToForm();
bindEvents();
registerServiceWorker();
setupInstallPrompt();
updateConnectivityStatus();
update();

function createEmptyItem(defaultUnit = "oz") {
  return {
    name: "",
    price: "",
    size: "",
    unit: defaultUnit,
    packCount: "1",
    coupon: "",
    shelfTagPrice: "",
    shelfTagUnit: defaultUnit,
  };
}

function createDefaultState() {
  return {
    comparisonUnit: "oz",
    targetAmount: "",
    targetUnit: "oz",
    items: Array.from({ length: ITEM_COUNT }, () => createEmptyItem()),
  };
}

function normalizeItem(item = {}) {
  const unit = UNITS_BY_VALUE[item.unit] ? item.unit : "oz";
  const shelfTagUnitCandidate = UNITS_BY_VALUE[item.shelfTagUnit] ? item.shelfTagUnit : unit;
  const shelfTagUnit =
    UNITS_BY_VALUE[shelfTagUnitCandidate]?.family === UNITS_BY_VALUE[unit]?.family
      ? shelfTagUnitCandidate
      : unit;

  return {
    name: String(item.name ?? "").slice(0, 60),
    price: stringifyField(item.price),
    size: stringifyField(item.size),
    unit,
    packCount: stringifyField(item.packCount || "1") || "1",
    coupon: stringifyField(item.coupon),
    shelfTagPrice: stringifyField(item.shelfTagPrice),
    shelfTagUnit,
  };
}

function normalizeState(input = {}) {
  const normalized = createDefaultState();
  const items = Array.isArray(input.items) ? input.items.slice(0, ITEM_COUNT) : [];
  normalized.items = Array.from({ length: ITEM_COUNT }, (_, index) => normalizeItem(items[index]));
  normalized.comparisonUnit = UNITS_BY_VALUE[input.comparisonUnit]
    ? input.comparisonUnit
    : normalized.items[0].unit;
  normalized.targetAmount = stringifyField(input.targetAmount);
  normalized.targetUnit = UNITS_BY_VALUE[input.targetUnit]
    ? input.targetUnit
    : normalized.comparisonUnit;
  return normalized;
}

function stringifyField(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function loadState() {
  if (window.location.hash === "#sample") {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    return normalizeState(SAMPLE_STATE);
  }

  const fromHash = parseStateFromHash();
  if (fromHash) return normalizeState(fromHash);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch (error) {
    console.warn("Could not load saved state", error);
  }

  return createDefaultState();
}

function parseStateFromHash() {
  const hash = window.location.hash.replace(/^#/, "").trim();
  if (!hash) return null;

  try {
    const decoded = decodeURIComponent(atob(hash));
    return JSON.parse(decoded);
  } catch (error) {
    console.warn("Invalid share link state", error);
    return null;
  }
}

function renderCards() {
  elements.cards.innerHTML = "";

  state.items.forEach((item, index) => {
    const fragment = elements.template.content.cloneNode(true);
    const card = fragment.querySelector(".item-card");
    card.dataset.index = String(index);
    fragment.querySelector(".item-badge").textContent = `Option ${index + 1}`;

    const unitSelect = fragment.querySelector(".unit");
    unitSelect.innerHTML = UNITS.map(
      (unit) => `<option value="${unit.value}">${unit.label}</option>`,
    ).join("");

    elements.cards.appendChild(fragment);
  });
}

function applyStateToForm() {
  state.items.forEach((item, index) => {
    const card = getCard(index);
    if (!card) return;

    card.querySelector(".item-name").value = item.name;
    card.querySelector(".price").value = item.price;
    card.querySelector(".size").value = item.size;
    card.querySelector(".unit").value = item.unit;
    card.querySelector(".pack-count").value = item.packCount || "1";
    card.querySelector(".coupon").value = item.coupon;
    card.querySelector(".shelf-tag-price").value = item.shelfTagPrice;
    syncShelfTagUnitSelect(card, item);
  });

  elements.targetAmount.value = state.targetAmount;
}

function bindEvents() {
  elements.cards.addEventListener("input", handleCardInput);
  elements.cards.addEventListener("change", handleCardInput);

  elements.comparisonUnit.addEventListener("change", (event) => {
    state.comparisonUnit = event.target.value;
    update();
  });

  elements.targetAmount.addEventListener("input", (event) => {
    state.targetAmount = event.target.value;
    update();
  });

  elements.targetUnit.addEventListener("change", (event) => {
    state.targetUnit = event.target.value;
    update();
  });

  elements.targetPresets.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-amount][data-unit]");
    if (!button) return;

    state.targetAmount = button.dataset.amount || "";
    state.targetUnit = button.dataset.unit || state.targetUnit;
    elements.targetAmount.value = state.targetAmount;
    update();
  });

  elements.loadSample.addEventListener("click", () => {
    state = normalizeState(SAMPLE_STATE);
    applyStateToForm();
    update();
  });

  elements.starterPresets?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-preset-id]");
    if (!button) return;

    const preset = STARTER_PRESETS.find((entry) => entry.id === button.dataset.presetId);
    if (!preset) return;

    state = normalizeState(preset.state);
    applyStateToForm();
    update();
  });

  elements.resetForm.addEventListener("click", () => {
    state = createDefaultState();
    applyStateToForm();
    update();
  });

  elements.copyLink.addEventListener("click", async () => {
    const url = buildShareUrl();
    const original = elements.copyLink.textContent;

    try {
      await navigator.clipboard.writeText(url);
      elements.copyLink.textContent = "Link copied";
    } catch (error) {
      console.warn("Clipboard write failed", error);
      elements.copyLink.textContent = "Copy failed";
    }

    window.setTimeout(() => {
      elements.copyLink.textContent = original;
    }, 1400);
  });

  elements.copyVerdict.addEventListener("click", async () => {
    if (!currentShareBundleText) {
      setShareBundleStatus("Add at least one comparable result first.");
      return;
    }

    const original = elements.copyVerdict.textContent;
    let copied = false;
    let selectedForManualCopy = false;

    try {
      await navigator.clipboard.writeText(currentShareBundleText);
      copied = true;
    } catch (error) {
      console.warn("Clipboard write failed", error);
      selectedForManualCopy = selectShareBundleText();
    }

    elements.copyVerdict.textContent = copied
      ? "Verdict copied"
      : selectedForManualCopy
        ? "Text selected"
        : "Copy failed";
    setShareBundleStatus(
      copied
        ? "Copied the plain-English verdict and exact share link."
        : selectedForManualCopy
          ? "Clipboard blocked. The verdict text is selected so you can copy it manually."
          : "Copy failed. You can still select the verdict text manually.",
    );

    window.clearTimeout(copyVerdictResetTimer);
    copyVerdictResetTimer = window.setTimeout(() => {
      elements.copyVerdict.textContent = original;
      setShareBundleStatus(DEFAULT_SHARE_BUNDLE_STATUS);
    }, 1600);
  });

  elements.shareBundleText.addEventListener("focus", selectShareBundleText);
  elements.shareBundleText.addEventListener("click", selectShareBundleText);
}

function handleCardInput(event) {
  const field = event.target.dataset.field;
  if (!field) return;

  const card = event.target.closest(".item-card");
  if (!card) return;

  const index = Number(card.dataset.index);
  state.items[index][field] = event.target.value;

  if (field === "unit") {
    syncShelfTagUnitSelect(card, state.items[index]);
  }

  update();
}

function selectShareBundleText() {
  if (!currentShareBundleText || !elements.shareBundleText) return false;
  elements.shareBundleText.focus();
  elements.shareBundleText.select();
  elements.shareBundleText.setSelectionRange(0, elements.shareBundleText.value.length);
  return true;
}

function setShareBundleStatus(message) {
  if (!elements.shareBundleStatus) return;
  elements.shareBundleStatus.textContent = message;
}


function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("assets/service-worker.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  });
}

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    showInstallCallToAction();
    setInstallStatus("Install is ready when you want it.");
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    hideInstallCallToAction();
    setInstallStatus("Installed. Your last comparison will still stay local to this browser.");
  });

  window.addEventListener("online", updateConnectivityStatus);
  window.addEventListener("offline", updateConnectivityStatus);

  elements.installApp?.addEventListener("click", triggerInstallPrompt);
  elements.installStripButton?.addEventListener("click", triggerInstallPrompt);
}

async function triggerInstallPrompt() {
  if (!deferredInstallPrompt) {
    setInstallStatus("Install depends on your browser. If the button never appears, use Add to Home Screen from the browser menu.");
    return;
  }

  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice.catch(() => null);
  deferredInstallPrompt = null;
  hideInstallCallToAction();

  if (choice?.outcome === "accepted") {
    setInstallStatus("Nice. Unit Price Checker is installing now.");
  } else {
    setInstallStatus("No problem. You can still use the browser menu to install it later.");
  }
}

function showInstallCallToAction() {
  elements.installApp?.classList.remove("hidden");
  elements.installStrip?.classList.remove("hidden");
}

function hideInstallCallToAction() {
  elements.installApp?.classList.add("hidden");
  elements.installStrip?.classList.add("hidden");
}

function updateConnectivityStatus() {
  if (!elements.installStatus) return;

  const online = navigator.onLine;
  elements.installStatus.classList.toggle("is-online", online);
  elements.installStatus.classList.toggle("is-offline", !online);

  if (online) {
    if (!deferredInstallPrompt && !elements.installStrip?.classList.contains("hidden")) {
      setInstallStatus("Online. Install is ready when your browser offers it.");
    }
    return;
  }

  setInstallStatus("Offline mode: the app shell and your last saved comparison should still open cleanly.");
}

function setInstallStatus(message) {
  if (!elements.installStatus) return;
  elements.installStatus.textContent = message;
}

function update() {
  const completeItems = state.items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => isCompleteItem(item));

  const activeFamily = syncComparisonUnitOptions(completeItems);
  syncTargetUnitOptions(activeFamily);
  renderTargetPresets(activeFamily);
  renderStarterPresets();

  const comparisonUnitMeta = UNITS_BY_VALUE[state.comparisonUnit];
  const targetPlan = getTargetPlan(activeFamily);

  const evaluated = state.items.map((item, index) => ({
    index,
    item,
    metrics: evaluateItem(item, state.comparisonUnit),
  }));

  const comparableItems = evaluated
    .filter(({ metrics }) => metrics.complete && metrics.sameFamily)
    .sort((a, b) => a.metrics.unitPrice - b.metrics.unitPrice);

  const winner = comparableItems[0] ?? null;
  const entries = comparableItems.map((entry) => ({
    ...entry,
    tripPlan: targetPlan ? buildTripPlan(entry.metrics, targetPlan) : null,
  }));
  const tripWinner = targetPlan ? getTripWinner(entries) : null;
  const excludedCount = evaluated.filter(
    ({ metrics }) => metrics.complete && !metrics.sameFamily,
  ).length;
  const shelfAudits = evaluated.filter(({ metrics }) => metrics.complete && metrics.shelfTagAudit);
  const suspiciousShelfEntries = shelfAudits.filter(
    ({ metrics }) => metrics.shelfTagAudit.status !== "close",
  );

  updateFamilyWarning(activeFamily, excludedCount);
  updateShelfAuditNotice(shelfAudits.length, suspiciousShelfEntries.length);
  updateCards(evaluated, winner, comparisonUnitMeta, targetPlan, tripWinner);
  updateSummary(entries, winner, comparisonUnitMeta, excludedCount, targetPlan, tripWinner);
  updateShareBundle(winner, comparisonUnitMeta, targetPlan, tripWinner, suspiciousShelfEntries);
  persistState();
  syncHash();
}

function renderStarterPresets() {
  if (!elements.starterPresets) return;

  const activeStateSignature = JSON.stringify(normalizeState(state));

  elements.starterPresets.innerHTML = STARTER_PRESETS.map((preset) => {
    const preview = buildStarterPresetPreview(preset);
    const isActive = JSON.stringify(normalizeState(preset.state)) === activeStateSignature;

    return `
      <button class="starter-preset${isActive ? " is-active" : ""}" type="button" data-preset-id="${preset.id}">
        <span class="starter-preset-topline">
          <span class="starter-preset-label">${escapeHtml(preset.label)}</span>
          <span class="starter-preset-meta">
            <span class="starter-preset-pill">${escapeHtml(preview.familyLabel)}</span>
            <span class="starter-preset-pill starter-preset-pill-alt">${escapeHtml(preview.outcomeLabel)}</span>
          </span>
        </span>
        <span class="starter-preset-description">${escapeHtml(preset.description)}</span>
        <span class="starter-preset-preview">${escapeHtml(preview.previewLine)}</span>
      </button>
    `;
  }).join("");
}

function buildStarterPresetPreview(preset) {
  const presetState = normalizeState(preset.state);
  const completeItems = presetState.items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => isCompleteItem(item));

  const selectedUnitMeta = UNITS_BY_VALUE[presetState.comparisonUnit];
  const activeFamily =
    completeItems.find(({ item }) => UNITS_BY_VALUE[item.unit]?.family === selectedUnitMeta?.family)
      ? selectedUnitMeta?.family
      : UNITS_BY_VALUE[completeItems[0]?.item.unit]?.family || selectedUnitMeta?.family || "weight";

  const comparisonUnit = UNITS_BY_VALUE[presetState.comparisonUnit]?.family === activeFamily
    ? presetState.comparisonUnit
    : DEFAULT_UNIT_BY_FAMILY[activeFamily];
  const comparisonMeta = UNITS_BY_VALUE[comparisonUnit];

  const evaluated = presetState.items
    .map((item, index) => ({ item, index, metrics: evaluateItem(item, comparisonUnit) }))
    .filter(({ metrics }) => metrics.complete && metrics.sameFamily)
    .sort((a, b) => a.metrics.unitPrice - b.metrics.unitPrice);

  const winner = evaluated[0] ?? null;
  const targetAmount = toPositiveNumber(presetState.targetAmount);
  const targetUnitMeta = UNITS_BY_VALUE[presetState.targetUnit];
  const targetPlan =
    targetAmount > 0 && targetUnitMeta?.family === activeFamily
      ? { amount: targetAmount, unitMeta: targetUnitMeta, baseAmount: targetAmount * targetUnitMeta.factor }
      : null;
  const entries = evaluated.map((entry) => ({
    ...entry,
    tripPlan: targetPlan ? buildTripPlan(entry.metrics, targetPlan) : null,
  }));
  const tripWinner = targetPlan ? getTripWinner(entries) : null;

  const familyLabelMap = {
    weight: "weight",
    volume: "volume",
    count: "count",
  };

  const winnerName = winner ? winner.item.name.trim() || `Option ${winner.index + 1}` : "No winner yet";
  const tripWinnerName = tripWinner ? tripWinner.item.name.trim() || `Option ${tripWinner.index + 1}` : winnerName;
  const outcomeLabel =
    targetPlan && tripWinner && winner && tripWinner.index !== winner.index
      ? "split winner"
      : targetPlan
        ? "same winner"
        : "unit-price demo";

  const previewLine =
    targetPlan && tripWinner && winner && tripWinner.index !== winner.index
      ? `Unit: ${winnerName} · Checkout: ${tripWinnerName}`
      : targetPlan && tripWinner
        ? `${tripWinnerName} wins both the aisle math and the trip total.`
        : `${winnerName} is the unit-price winner.`;

  return {
    familyLabel: familyLabelMap[activeFamily] || activeFamily,
    outcomeLabel,
    previewLine,
    comparisonMeta,
  };
}

function syncComparisonUnitOptions(completeItems) {
  const selectedUnitFamily = UNITS_BY_VALUE[state.comparisonUnit]?.family;
  const familyFromSelection = completeItems.some(
    ({ item }) => UNITS_BY_VALUE[item.unit]?.family === selectedUnitFamily,
  )
    ? selectedUnitFamily
    : null;

  const firstCompleteFamily = completeItems[0]
    ? UNITS_BY_VALUE[completeItems[0].item.unit]?.family
    : null;

  const activeFamily = familyFromSelection || firstCompleteFamily || "weight";
  const allowedUnits = UNITS.filter((unit) => unit.family === activeFamily);
  const firstCompleteUnit = completeItems.find(
    ({ item }) => UNITS_BY_VALUE[item.unit]?.family === activeFamily,
  )?.item.unit;

  if (!allowedUnits.some((unit) => unit.value === state.comparisonUnit)) {
    state.comparisonUnit =
      firstCompleteUnit && UNITS_BY_VALUE[firstCompleteUnit]
        ? firstCompleteUnit
        : DEFAULT_UNIT_BY_FAMILY[activeFamily];
  }

  elements.comparisonUnit.innerHTML = allowedUnits
    .map((unit) => `<option value="${unit.value}">${unit.label}</option>`)
    .join("");
  elements.comparisonUnit.value = state.comparisonUnit;

  return activeFamily;
}

function syncTargetUnitOptions(activeFamily) {
  const allowedUnits = UNITS.filter((unit) => unit.family === activeFamily);

  if (!allowedUnits.some((unit) => unit.value === state.targetUnit)) {
    state.targetUnit = allowedUnits.some((unit) => unit.value === state.comparisonUnit)
      ? state.comparisonUnit
      : DEFAULT_UNIT_BY_FAMILY[activeFamily];
  }

  elements.targetUnit.innerHTML = allowedUnits
    .map((unit) => `<option value="${unit.value}">${unit.label}</option>`)
    .join("");
  elements.targetUnit.value = state.targetUnit;
}

function renderTargetPresets(activeFamily) {
  if (!elements.targetPresets) return;

  const presets = TARGET_PRESETS_BY_FAMILY[activeFamily] || [];
  elements.targetPresets.innerHTML = presets
    .map((preset) => {
      const isActive =
        String(state.targetAmount).trim() === String(preset.amount) && state.targetUnit === preset.unit;

      return `<button class="target-preset${isActive ? " is-active" : ""}" type="button" data-amount="${preset.amount}" data-unit="${preset.unit}">${preset.label}</button>`;
    })
    .join("");
}

function syncShelfTagUnitSelect(card, item) {
  const shelfTagUnitSelect = card.querySelector(".shelf-tag-unit");
  const itemUnitMeta = UNITS_BY_VALUE[item.unit] || UNITS_BY_VALUE.oz;
  const allowedUnits = UNITS.filter((unit) => unit.family === itemUnitMeta.family);

  if (!allowedUnits.some((unit) => unit.value === item.shelfTagUnit)) {
    item.shelfTagUnit = item.unit;
  }

  shelfTagUnitSelect.innerHTML = allowedUnits
    .map((unit) => `<option value="${unit.value}">${unit.label}</option>`)
    .join("");
  shelfTagUnitSelect.value = item.shelfTagUnit;
}

function getTargetPlan(activeFamily) {
  const amount = toPositiveNumber(state.targetAmount);
  const unitMeta = UNITS_BY_VALUE[state.targetUnit];

  if (!(amount > 0) || !unitMeta || unitMeta.family !== activeFamily) {
    return null;
  }

  return {
    amount,
    unitMeta,
    baseAmount: amount * unitMeta.factor,
  };
}

function evaluateItem(item, comparisonUnitValue) {
  const unitMeta = UNITS_BY_VALUE[item.unit];
  const comparisonMeta = UNITS_BY_VALUE[comparisonUnitValue];
  const price = toPositiveNumber(item.price);
  const size = toPositiveNumber(item.size);
  const packCount = Math.max(1, toPositiveNumber(item.packCount) || 1);
  const coupon = Math.max(0, toNumber(item.coupon) || 0);

  if (!unitMeta || !(price > 0) || !(size > 0)) {
    return { complete: false };
  }

  const effectivePrice = Math.max(0, price - coupon);
  const totalBaseAmount = size * packCount * unitMeta.factor;
  const sameFamily = comparisonMeta?.family === unitMeta.family;
  const shelfTagAudit = buildShelfTagAudit(item, effectivePrice, totalBaseAmount, unitMeta);

  if (!sameFamily) {
    return {
      complete: true,
      sameFamily: false,
      effectivePrice,
      totalBaseAmount,
      unitMeta,
      shelfTagAudit,
    };
  }

  const totalComparisonAmount = totalBaseAmount / comparisonMeta.factor;
  const unitPrice = totalComparisonAmount > 0 ? effectivePrice / totalComparisonAmount : Number.NaN;

  return {
    complete: true,
    sameFamily: true,
    effectivePrice,
    totalBaseAmount,
    totalComparisonAmount,
    unitPrice,
    unitMeta,
    comparisonMeta,
    shelfTagAudit,
  };
}

function buildShelfTagAudit(item, effectivePrice, totalBaseAmount, itemUnitMeta) {
  const claimedUnitPrice = toPositiveNumber(item.shelfTagPrice);
  const claimedUnitMeta = UNITS_BY_VALUE[item.shelfTagUnit];

  if (!(claimedUnitPrice > 0) || !claimedUnitMeta || claimedUnitMeta.family !== itemUnitMeta.family) {
    return null;
  }

  const totalClaimUnits = totalBaseAmount / claimedUnitMeta.factor;
  const computedUnitPrice = totalClaimUnits > 0 ? effectivePrice / totalClaimUnits : Number.NaN;

  if (!Number.isFinite(computedUnitPrice)) {
    return null;
  }

  const difference = claimedUnitPrice - computedUnitPrice;
  const absoluteDifference = Math.abs(difference);
  const percentDifference = computedUnitPrice > 0 ? absoluteDifference / computedUnitPrice : 0;
  const tolerance = Math.max(
    SHELF_TAG_TOLERANCE_ABSOLUTE,
    computedUnitPrice * SHELF_TAG_TOLERANCE_PERCENT,
  );
  const status =
    absoluteDifference <= tolerance ? "close" : difference > 0 ? "high" : "low";

  return {
    status,
    unitMeta: claimedUnitMeta,
    claimedUnitPrice,
    computedUnitPrice,
    difference,
    absoluteDifference,
    percentDifference,
    tolerance,
  };
}

function buildTripPlan(metrics, targetPlan) {
  const purchases = Math.max(1, Math.ceil(targetPlan.baseAmount / metrics.totalBaseAmount));
  const purchasedBaseAmount = purchases * metrics.totalBaseAmount;

  return {
    purchases,
    tripCost: purchases * metrics.effectivePrice,
    purchasedAmount: purchasedBaseAmount / targetPlan.unitMeta.factor,
    surplusAmount: (purchasedBaseAmount - targetPlan.baseAmount) / targetPlan.unitMeta.factor,
  };
}

function getTripWinner(entries) {
  const ranked = entries
    .filter((entry) => entry.tripPlan)
    .sort((a, b) => {
      return (
        a.tripPlan.tripCost - b.tripPlan.tripCost ||
        a.tripPlan.surplusAmount - b.tripPlan.surplusAmount ||
        a.metrics.unitPrice - b.metrics.unitPrice
      );
    });

  return ranked[0] ?? null;
}

function updateCards(evaluated, winner, comparisonUnitMeta, targetPlan, tripWinner) {
  evaluated.forEach(({ index, item, metrics }) => {
    const card = getCard(index);
    if (!card) return;

    const label = item.name.trim() || `Option ${index + 1}`;
    const effectiveEl = card.querySelector(".effective-price");
    const unitPriceEl = card.querySelector(".unit-price");
    const matchPriceEl = card.querySelector(".match-price");
    const noteEl = card.querySelector(".metric-note");
    const tripMetric = card.querySelector(".trip-metric");
    const tripCostEl = card.querySelector(".trip-cost");

    card.classList.toggle("is-winner", winner?.index === index);
    card.classList.toggle("is-trip-winner", Boolean(targetPlan && tripWinner?.index === index));

    if (!metrics.complete) {
      effectiveEl.textContent = "—";
      unitPriceEl.textContent = "—";
      matchPriceEl.textContent = "—";
      tripCostEl.textContent = "—";
      tripMetric.classList.add("hidden");
      noteEl.textContent = "Fill in price, size, and unit to compare.";
      updateShelfTagFeedback(card, null);
      return;
    }

    effectiveEl.textContent = formatMoney(metrics.effectivePrice);
    updateShelfTagFeedback(card, metrics.shelfTagAudit);

    if (!metrics.sameFamily) {
      unitPriceEl.textContent = "Excluded";
      matchPriceEl.textContent = "—";
      tripCostEl.textContent = "—";
      tripMetric.classList.add("hidden");
      noteEl.textContent = `${capitalize(metrics.unitMeta.family)} item. Switch units or remove mismatched entries to compare it.`;
      return;
    }

    unitPriceEl.textContent = `${formatMoney(metrics.unitPrice)} / ${comparisonUnitMeta.shortLabel}`;

    const matchPrice = winner
      ? winner.metrics.unitPrice * metrics.totalComparisonAmount
      : metrics.effectivePrice;

    matchPriceEl.textContent = winner?.index === index ? "Already best" : formatMoney(matchPrice);

    const totalAmountLine = `${formatNumber(metrics.totalComparisonAmount)} ${comparisonUnitMeta.shortLabel}`;
    let noteText =
      winner?.index === index
        ? `${label} is the current best unit-price value. Total amount: ${totalAmountLine}.`
        : `Total amount: ${totalAmountLine}. Needs to drop to ${formatMoney(matchPrice)} to tie the unit-price winner.`;

    if (targetPlan) {
      const tripPlan = buildTripPlan(metrics, targetPlan);
      const targetLabel = formatMeasurement(targetPlan.amount, targetPlan.unitMeta.shortLabel);
      const surplusLabel = formatMeasurement(tripPlan.surplusAmount, targetPlan.unitMeta.shortLabel);

      tripMetric.classList.remove("hidden");
      tripCostEl.textContent = formatMoney(tripPlan.tripCost);
      noteText +=
        tripWinner?.index === index
          ? ` Cheapest way to reach ${targetLabel}: buy ${tripPlan.purchases} of this option for ${formatMoney(tripPlan.tripCost)}. Extra after target: ${surplusLabel}.`
          : ` To reach ${targetLabel}, buy ${tripPlan.purchases} of this option for ${formatMoney(tripPlan.tripCost)}. Extra after target: ${surplusLabel}.`;
    } else {
      tripCostEl.textContent = "—";
      tripMetric.classList.add("hidden");
    }

    noteEl.textContent = noteText;
  });
}

function updateShelfTagFeedback(card, audit) {
  const feedbackEl = card.querySelector(".shelf-tag-feedback");
  if (!feedbackEl) return;

  feedbackEl.classList.add("hidden");
  feedbackEl.classList.remove("is-close", "is-warning");

  if (!audit) {
    feedbackEl.textContent = "";
    return;
  }

  const claimLabel = `${formatMoney(audit.claimedUnitPrice)} / ${audit.unitMeta.shortLabel}`;
  const computedLabel = `${formatMoney(audit.computedUnitPrice)} / ${audit.unitMeta.shortLabel}`;
  let text = "";

  if (audit.status === "close") {
    feedbackEl.classList.add("is-close");
    text = `Shelf tag check: ${claimLabel} looks close to computed ${computedLabel}.`;
  } else if (audit.status === "high") {
    feedbackEl.classList.add("is-warning");
    text = `Shelf tag check: tag says ${claimLabel}, but the entered math lands at ${computedLabel}. That tag reads ${formatMoney(audit.absoluteDifference)} / ${audit.unitMeta.shortLabel} high (${formatPercent(audit.percentDifference)}).`;
  } else {
    feedbackEl.classList.add("is-warning");
    text = `Shelf tag check: tag says ${claimLabel}, but the entered math lands at ${computedLabel}. That tag reads ${formatMoney(audit.absoluteDifference)} / ${audit.unitMeta.shortLabel} low (${formatPercent(audit.percentDifference)}).`;
  }

  feedbackEl.textContent = text;
  feedbackEl.classList.remove("hidden");
}

function updateSummary(entries, winner, comparisonUnitMeta, excludedCount, targetPlan, tripWinner) {
  if (!winner) {
    elements.summaryEmpty.classList.remove("hidden");
    elements.summaryContent.classList.add("hidden");
    elements.summaryEmpty.textContent = excludedCount
      ? "You have complete items, but they do not share the same measurement family yet."
      : "Add at least one complete item to see the ranking.";
    elements.rankingList.innerHTML = "";
    elements.tripCard.classList.add("hidden");
    elements.winnerSplitExplainer.classList.add("hidden");
    return;
  }

  elements.summaryEmpty.classList.add("hidden");
  elements.summaryContent.classList.remove("hidden");

  const winnerName = winner.item.name.trim() || `Option ${winner.index + 1}`;
  elements.winnerName.textContent = winnerName;
  elements.winnerPriceLine.textContent = `${formatMoney(winner.metrics.unitPrice)} per ${comparisonUnitMeta.shortLabel}`;
  elements.winnerContext.textContent = buildWinnerContext(entries.length, excludedCount);

  if (targetPlan && tripWinner?.tripPlan) {
    const tripWinnerName = tripWinner.item.name.trim() || `Option ${tripWinner.index + 1}`;
    const targetLabel = formatMeasurement(targetPlan.amount, targetPlan.unitMeta.shortLabel);
    const surplusLabel = formatMeasurement(tripWinner.tripPlan.surplusAmount, targetPlan.unitMeta.shortLabel);

    elements.tripCard.classList.remove("hidden");
    elements.tripWinnerName.textContent = tripWinnerName;
    elements.tripPriceLine.textContent = `${formatMoney(tripWinner.tripPlan.tripCost)} total to reach ${targetLabel}`;
    elements.tripContext.textContent = `Buy ${tripWinner.tripPlan.purchases} of this option. Extra after target: ${surplusLabel}.`;
  } else {
    elements.tripCard.classList.add("hidden");
  }

  updateWinnerSplitExplainer(winner, tripWinner, comparisonUnitMeta, targetPlan);

  const targetLabel = targetPlan
    ? formatMeasurement(targetPlan.amount, targetPlan.unitMeta.shortLabel)
    : "";

  elements.rankingList.innerHTML = entries
    .map((entry, rank) => {
      const name = entry.item.name.trim() || `Option ${entry.index + 1}`;
      const comparisonCost = winner.metrics.unitPrice * entry.metrics.totalComparisonAmount;
      const extraCost = Math.max(0, entry.metrics.effectivePrice - comparisonCost);
      const unitMetaLine =
        rank === 0
          ? "Best unit price right now."
          : `${formatMoney(extraCost)} more than the unit-price winner for the same amount. Match price: ${formatMoney(comparisonCost)}.`;

      const tripMetaLine =
        targetPlan && entry.tripPlan && tripWinner?.tripPlan
          ? entry.index === tripWinner.index
            ? ` Cheapest checkout total for ${targetLabel}. ${entry.tripPlan.purchases} × entered option, ${formatMeasurement(entry.tripPlan.surplusAmount, targetPlan.unitMeta.shortLabel)} extra.`
            : ` ${formatMoney(entry.tripPlan.tripCost - tripWinner.tripPlan.tripCost)} more than the target winner to reach ${targetLabel}. Checkout: ${formatMoney(entry.tripPlan.tripCost)} (${entry.tripPlan.purchases} × entered option, ${formatMeasurement(entry.tripPlan.surplusAmount, targetPlan.unitMeta.shortLabel)} extra).`
          : "";

      return `
        <li>
          <div class="ranking-topline">
            <div>
              <span class="rank-pill">#${rank + 1}</span>
              <strong>${escapeHtml(name)}</strong>
            </div>
            <span class="ranking-price">${formatMoney(entry.metrics.unitPrice)} / ${comparisonUnitMeta.shortLabel}</span>
          </div>
          <small>${unitMetaLine}${tripMetaLine}</small>
        </li>
      `;
    })
    .join("");
}

function updateWinnerSplitExplainer(winner, tripWinner, comparisonUnitMeta, targetPlan) {
  if (!winner || !tripWinner?.tripPlan || !targetPlan || tripWinner.index === winner.index) {
    elements.winnerSplitExplainer.classList.add("hidden");
    return;
  }

  const winnerName = winner.item.name.trim() || `Option ${winner.index + 1}`;
  const tripWinnerName = tripWinner.item.name.trim() || `Option ${tripWinner.index + 1}`;
  const targetLabel = formatMeasurement(targetPlan.amount, targetPlan.unitMeta.shortLabel);
  const unitWinnerTripPlan = winner.tripPlan || buildTripPlan(winner.metrics, targetPlan);
  const tripSavings = Math.max(0, unitWinnerTripPlan.tripCost - tripWinner.tripPlan.tripCost);
  const unitWinnerExtra = formatMeasurement(unitWinnerTripPlan.surplusAmount, targetPlan.unitMeta.shortLabel);
  const checkoutWinnerExtra = formatMeasurement(tripWinner.tripPlan.surplusAmount, targetPlan.unitMeta.shortLabel);

  elements.winnerSplitHeading.textContent = `${winnerName} wins on ${comparisonUnitMeta.shortLabel}. ${tripWinnerName} wins at the register.`;
  elements.winnerSplitBody.textContent = `To get ${targetLabel}, ${tripWinnerName} costs ${formatMoney(tripWinner.tripPlan.tripCost)} at checkout (${tripWinner.tripPlan.purchases} package${tripWinner.tripPlan.purchases === 1 ? "" : "s"}, ${checkoutWinnerExtra} extra). ${winnerName} has the better unit price, but buying enough of it costs ${formatMoney(unitWinnerTripPlan.tripCost)} today (${unitWinnerTripPlan.purchases} package${unitWinnerTripPlan.purchases === 1 ? "" : "s"}, ${unitWinnerExtra} extra) — ${formatMoney(tripSavings)} more for this trip.`;
  elements.winnerSplitExplainer.classList.remove("hidden");
}

function updateShareBundle(winner, comparisonUnitMeta, targetPlan, tripWinner, suspiciousShelfEntries) {
  if (!winner || !comparisonUnitMeta) {
    currentShareBundleText = "";
    elements.shareBundle.classList.add("hidden");
    elements.shareBundleText.value = "";
    setShareBundleStatus(DEFAULT_SHARE_BUNDLE_STATUS);
    return;
  }

  currentShareBundleText = buildShareBundle(
    winner,
    comparisonUnitMeta,
    targetPlan,
    tripWinner,
    suspiciousShelfEntries,
  );
  elements.shareBundle.classList.remove("hidden");
  elements.shareBundleText.value = currentShareBundleText;
  elements.shareBundleText.rows = Math.max(5, currentShareBundleText.split("\n").length + 1);
  setShareBundleStatus(DEFAULT_SHARE_BUNDLE_STATUS);
}

function buildShareBundle(winner, comparisonUnitMeta, targetPlan, tripWinner, suspiciousShelfEntries) {
  const winnerName = winner.item.name.trim() || `Option ${winner.index + 1}`;
  const lines = [
    "Unit Price Checker verdict:",
    `Best unit-price pick: ${winnerName} at ${formatMoney(winner.metrics.unitPrice)} / ${comparisonUnitMeta.shortLabel}.`,
  ];

  if (targetPlan && tripWinner?.tripPlan) {
    const targetLabel = formatMeasurement(targetPlan.amount, targetPlan.unitMeta.shortLabel);
    const tripWinnerName = tripWinner.item.name.trim() || `Option ${tripWinner.index + 1}`;
    const packageLabel = tripWinner.tripPlan.purchases === 1 ? "package" : "packages";
    const extraLabel = tripWinner.tripPlan.surplusAmount > 0
      ? `, ${formatMeasurement(tripWinner.tripPlan.surplusAmount, targetPlan.unitMeta.shortLabel)} extra`
      : "";

    if (tripWinner.index === winner.index) {
      lines.push(
        `For ${targetLabel}, that same option is also the cheapest actual checkout: ${formatMoney(tripWinner.tripPlan.tripCost)} total (buy ${tripWinner.tripPlan.purchases} ${packageLabel}${extraLabel}).`,
      );
    } else {
      lines.push(
        `Cheapest actual checkout for ${targetLabel}: ${tripWinnerName} at ${formatMoney(tripWinner.tripPlan.tripCost)} total (buy ${tripWinner.tripPlan.purchases} ${packageLabel}${extraLabel}).`,
      );
    }
  }

  const shelfWarningLine = buildShareShelfWarningLine(suspiciousShelfEntries);
  if (shelfWarningLine) {
    lines.push(shelfWarningLine);
  }

  lines.push(`Exact comparison: ${buildShareUrl()}`);
  return lines.join("\n");
}

function buildShareShelfWarningLine(suspiciousShelfEntries) {
  if (!suspiciousShelfEntries.length) {
    return "";
  }

  if (suspiciousShelfEntries.length === 1) {
    const [entry] = suspiciousShelfEntries;
    const name = entry.item.name.trim() || `Option ${entry.index + 1}`;
    const audit = entry.metrics.shelfTagAudit;

    return `Shelf-tag warning: ${name} looks off — tag says ${formatMoney(audit.claimedUnitPrice)} / ${audit.unitMeta.shortLabel}, entered math lands at ${formatMoney(audit.computedUnitPrice)} / ${audit.unitMeta.shortLabel}.`;
  }

  const names = suspiciousShelfEntries.map((entry) => entry.item.name.trim() || `Option ${entry.index + 1}`);
  const previewNames = names.slice(0, 2).join(", ");
  const remainingCount = Math.max(0, names.length - 2);
  const nameTail = remainingCount ? `, +${remainingCount} more` : "";

  return `Shelf-tag warning: ${suspiciousShelfEntries.length} tags look off (${previewNames}${nameTail}).`;
}

function updateFamilyWarning(activeFamily, excludedCount) {
  if (!excludedCount) {
    elements.familyWarning.classList.add("hidden");
    elements.familyWarning.textContent = "";
    return;
  }

  elements.familyWarning.classList.remove("hidden");
  elements.familyWarning.textContent = `Only ${activeFamily} items are being ranked right now. ${excludedCount} completed option${excludedCount === 1 ? " is" : "s are"} excluded because the unit type does not match.`;
}

function updateShelfAuditNotice(auditedCount, suspiciousCount) {
  if (!elements.shelfAuditNotice) return;

  if (!auditedCount) {
    elements.shelfAuditNotice.classList.add("hidden");
    elements.shelfAuditNotice.classList.remove("success", "warning");
    elements.shelfAuditNotice.textContent = "";
    return;
  }

  elements.shelfAuditNotice.classList.remove("hidden", "success", "warning");

  if (suspiciousCount) {
    const consistentCount = auditedCount - suspiciousCount;
    elements.shelfAuditNotice.classList.add("warning");
    elements.shelfAuditNotice.textContent = `${suspiciousCount} shelf tag ${suspiciousCount === 1 ? "looks" : "look"} off versus the price, size, pack count, and coupon entered here.${consistentCount ? ` ${consistentCount} other checked tag${consistentCount === 1 ? " looks" : "s look"} normal within rounding.` : ""}`;
    return;
  }

  elements.shelfAuditNotice.classList.add("success");
  elements.shelfAuditNotice.textContent =
    auditedCount === 1
      ? "1 shelf tag checked. It looks normal within rounding."
      : `${auditedCount} shelf tags checked. All look normal within rounding.`;
}

function buildWinnerContext(comparableCount, excludedCount) {
  const compared = `${comparableCount} comparable option${comparableCount === 1 ? "" : "s"}`;
  if (!excludedCount) return `Based on ${compared}.`;
  return `Based on ${compared}. ${excludedCount} mismatched option${excludedCount === 1 ? " was" : "s were"} excluded.`;
}

function isCompleteItem(item) {
  return Boolean(UNITS_BY_VALUE[item.unit]) && toPositiveNumber(item.price) > 0 && toPositiveNumber(item.size) > 0;
}

function getCard(index) {
  return elements.cards.querySelector(`.item-card[data-index="${index}"]`);
}

function formatMoney(value) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const maximumFractionDigits = abs >= 1 ? 2 : abs >= 0.1 ? 3 : 4;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value);
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const maximumFractionDigits = abs >= 10 ? 1 : abs >= 1 ? 2 : 3;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: value < 0.1 ? 1 : 0,
    maximumFractionDigits: 1,
  }).format(value);
}

function formatMeasurement(value, unitLabel) {
  return `${formatNumber(value)} ${unitLabel}`;
}

function toPositiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Could not save state", error);
  }
}

function encodeStateForHash() {
  return btoa(encodeURIComponent(JSON.stringify(state)));
}

function syncHash() {
  const hasMeaningfulInput =
    String(state.targetAmount).trim() !== "" ||
    state.items.some((item) => {
      return [item.name, item.price, item.size, item.coupon, item.shelfTagPrice].some(
        (value) => String(value).trim() !== "",
      );
    });

  const nextUrl = hasMeaningfulInput
    ? `${window.location.pathname}#${encodeStateForHash()}`
    : window.location.pathname;

  window.history.replaceState({}, "", nextUrl);
}

function buildShareUrl() {
  const hash = encodeStateForHash();
  return `${window.location.origin}${window.location.pathname}#${hash}`;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
