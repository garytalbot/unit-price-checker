const STORAGE_KEY = "unit-price-checker-state-v1";
const ITEM_COUNT = 3;
const SHELF_TAG_TOLERANCE_PERCENT = 0.02;
const SHELF_TAG_TOLERANCE_ABSOLUTE = 0.005;

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

const elements = {
  cards: document.querySelector("#cards"),
  template: document.querySelector("#item-template"),
  comparisonUnit: document.querySelector("#comparison-unit"),
  targetAmount: document.querySelector("#target-amount"),
  targetUnit: document.querySelector("#target-unit"),
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

  if (field === "unit") {
    syncShelfTagUnitSelect(card, state.items[index]);
  }

  update();
}

function update() {
  const completeItems = state.items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => isCompleteItem(item));

  const activeFamily = syncComparisonUnitOptions(completeItems);
  syncTargetUnitOptions(activeFamily);

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
  const suspiciousShelfAudits = shelfAudits.filter(
    ({ metrics }) => metrics.shelfTagAudit.status !== "close",
  ).length;

  updateFamilyWarning(activeFamily, excludedCount);
  updateShelfAuditNotice(shelfAudits.length, suspiciousShelfAudits);
  updateCards(evaluated, winner, comparisonUnitMeta, targetPlan, tripWinner);
  updateSummary(entries, winner, comparisonUnitMeta, excludedCount, targetPlan, tripWinner);
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
