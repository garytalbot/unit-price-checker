const STORAGE_KEY = "unit-price-checker-state-v1";
const ITEM_COUNT = 3;

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
  items: [
    {
      name: "Store brand oats",
      price: "4.29",
      size: "32",
      unit: "oz",
      packCount: "1",
      coupon: "0",
    },
    {
      name: "Name brand oats",
      price: "6.49",
      size: "42",
      unit: "oz",
      packCount: "1",
      coupon: "1.00",
    },
    {
      name: "Warehouse pack",
      price: "7.99",
      size: "2",
      unit: "lb",
      packCount: "1",
      coupon: "0",
    },
  ],
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const elements = {
  cards: document.querySelector("#cards"),
  template: document.querySelector("#item-template"),
  comparisonUnit: document.querySelector("#comparison-unit"),
  familyWarning: document.querySelector("#family-warning"),
  summaryEmpty: document.querySelector("#summary-empty"),
  summaryContent: document.querySelector("#summary-content"),
  winnerName: document.querySelector("#winner-name"),
  winnerPriceLine: document.querySelector("#winner-price-line"),
  winnerContext: document.querySelector("#winner-context"),
  rankingList: document.querySelector("#ranking-list"),
  loadSample: document.querySelector("#load-sample"),
  copyLink: document.querySelector("#copy-link"),
  resetForm: document.querySelector("#reset-form"),
};

let state = loadState();

renderCards();
applyStateToForm();
bindEvents();
update();

function createEmptyItem(defaultUnit = "oz") {
  return {
    name: "",
    price: "",
    size: "",
    unit: defaultUnit,
    packCount: "1",
    coupon: "",
  };
}

function createDefaultState() {
  return {
    comparisonUnit: "oz",
    items: Array.from({ length: ITEM_COUNT }, () => createEmptyItem()),
  };
}

function normalizeItem(item = {}) {
  const unit = UNITS_BY_VALUE[item.unit] ? item.unit : "oz";
  return {
    name: String(item.name ?? "").slice(0, 60),
    price: stringifyField(item.price),
    size: stringifyField(item.size),
    unit,
    packCount: stringifyField(item.packCount || "1") || "1",
    coupon: stringifyField(item.coupon),
  };
}

function normalizeState(input = {}) {
  const normalized = createDefaultState();
  const items = Array.isArray(input.items) ? input.items.slice(0, ITEM_COUNT) : [];
  normalized.items = Array.from({ length: ITEM_COUNT }, (_, index) => normalizeItem(items[index]));
  normalized.comparisonUnit = UNITS_BY_VALUE[input.comparisonUnit]
    ? input.comparisonUnit
    : normalized.items[0].unit;
  return normalized;
}

function stringifyField(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function loadState() {
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
  });
}

function bindEvents() {
  elements.cards.addEventListener("input", handleCardInput);
  elements.cards.addEventListener("change", handleCardInput);

  elements.comparisonUnit.addEventListener("change", (event) => {
    state.comparisonUnit = event.target.value;
    update();
  });

  elements.loadSample.addEventListener("click", () => {
    state = normalizeState(SAMPLE_STATE);
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
}

function handleCardInput(event) {
  const field = event.target.dataset.field;
  if (!field) return;

  const card = event.target.closest(".item-card");
  if (!card) return;

  const index = Number(card.dataset.index);
  state.items[index][field] = event.target.value;
  update();
}

function update() {
  const completeItems = state.items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => isCompleteItem(item));

  const activeFamily = syncComparisonUnitOptions(completeItems);
  const comparisonUnitMeta = UNITS_BY_VALUE[state.comparisonUnit];

  const evaluated = state.items.map((item, index) => ({
    index,
    item,
    metrics: evaluateItem(item, state.comparisonUnit),
  }));

  const comparableItems = evaluated.filter(
    ({ metrics }) => metrics.complete && metrics.sameFamily,
  );
  comparableItems.sort((a, b) => a.metrics.unitPrice - b.metrics.unitPrice);

  const winner = comparableItems[0] ?? null;
  const excludedCount = evaluated.filter(
    ({ metrics }) => metrics.complete && !metrics.sameFamily,
  ).length;

  updateFamilyWarning(activeFamily, excludedCount);
  updateCards(evaluated, winner, comparisonUnitMeta);
  updateSummary(comparableItems, winner, comparisonUnitMeta, excludedCount);
  persistState();
  syncHash();
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

  if (!sameFamily) {
    return {
      complete: true,
      sameFamily: false,
      effectivePrice,
      totalBaseAmount,
      unitMeta,
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
  };
}

function updateCards(evaluated, winner, comparisonUnitMeta) {
  evaluated.forEach(({ index, item, metrics }) => {
    const card = getCard(index);
    if (!card) return;

    const label = item.name.trim() || `Option ${index + 1}`;
    const effectiveEl = card.querySelector(".effective-price");
    const unitPriceEl = card.querySelector(".unit-price");
    const matchPriceEl = card.querySelector(".match-price");
    const noteEl = card.querySelector(".metric-note");

    card.classList.toggle("is-winner", winner?.index === index);

    if (!metrics.complete) {
      effectiveEl.textContent = "—";
      unitPriceEl.textContent = "—";
      matchPriceEl.textContent = "—";
      noteEl.textContent = "Fill in price, size, and unit to compare.";
      return;
    }

    effectiveEl.textContent = formatMoney(metrics.effectivePrice);

    if (!metrics.sameFamily) {
      unitPriceEl.textContent = "Excluded";
      matchPriceEl.textContent = "—";
      noteEl.textContent = `${capitalize(metrics.unitMeta.family)} item. Switch units or remove mismatched entries to compare it.`;
      return;
    }

    unitPriceEl.textContent = `${formatMoney(metrics.unitPrice)} / ${comparisonUnitMeta.shortLabel}`;

    const matchPrice = winner
      ? winner.metrics.unitPrice * metrics.totalComparisonAmount
      : metrics.effectivePrice;

    matchPriceEl.textContent = winner?.index === index ? "Already best" : formatMoney(matchPrice);

    const totalAmountLine = `${numberFormatter.format(metrics.totalComparisonAmount)} ${comparisonUnitMeta.shortLabel}`;
    if (winner?.index === index) {
      noteEl.textContent = `${label} is the current best value. Total amount: ${totalAmountLine}.`;
    } else {
      noteEl.textContent = `Total amount: ${totalAmountLine}. Needs to drop to ${formatMoney(matchPrice)} to tie the winner.`;
    }
  });
}

function updateSummary(comparableItems, winner, comparisonUnitMeta, excludedCount) {
  if (!winner) {
    elements.summaryEmpty.classList.remove("hidden");
    elements.summaryContent.classList.add("hidden");
    elements.summaryEmpty.textContent = excludedCount
      ? "You have complete items, but they do not share the same measurement family yet."
      : "Add at least one complete item to see the ranking.";
    elements.rankingList.innerHTML = "";
    return;
  }

  elements.summaryEmpty.classList.add("hidden");
  elements.summaryContent.classList.remove("hidden");

  const winnerName = winner.item.name.trim() || `Option ${winner.index + 1}`;
  elements.winnerName.textContent = winnerName;
  elements.winnerPriceLine.textContent = `${formatMoney(winner.metrics.unitPrice)} per ${comparisonUnitMeta.shortLabel}`;
  elements.winnerContext.textContent = buildWinnerContext(comparableItems.length, excludedCount);

  elements.rankingList.innerHTML = comparableItems
    .map((entry, rank) => {
      const name = entry.item.name.trim() || `Option ${entry.index + 1}`;
      const comparisonCost = winner.metrics.unitPrice * entry.metrics.totalComparisonAmount;
      const extraCost = Math.max(0, entry.metrics.effectivePrice - comparisonCost);
      const metaLine =
        rank === 0
          ? "Best value right now."
          : `${formatMoney(extraCost)} more than the winner for the same amount. Match price: ${formatMoney(comparisonCost)}.`;

      return `
        <li>
          <div class="ranking-topline">
            <div>
              <span class="rank-pill">#${rank + 1}</span>
              <strong>${escapeHtml(name)}</strong>
            </div>
            <span class="ranking-price">${formatMoney(entry.metrics.unitPrice)} / ${comparisonUnitMeta.shortLabel}</span>
          </div>
          <small>${metaLine}</small>
        </li>
      `;
    })
    .join("");
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
  const hasMeaningfulInput = state.items.some((item) => {
    return [item.name, item.price, item.size, item.coupon].some((value) => String(value).trim() !== "");
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
