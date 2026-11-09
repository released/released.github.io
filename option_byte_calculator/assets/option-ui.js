import {
  bitValue,
  buildBitTooltip,
  collectWarnings,
  combineValues,
  describeFields,
  fieldCombinations,
  formatBinary,
  formatHex,
  hexDigitsFor,
  parseHex,
  setBit,
  splitValue,
} from "./option-engine.js";


const body = document.body;
const family = body.dataset.family;
const profileSource = body.dataset.profiles;

const elements = {
  modelSelect: document.querySelector("#model-select"),
  reference: document.querySelector("#model-reference"),
  hexInputs: document.querySelector("#hex-inputs"),
  resetButton: document.querySelector("#reset-defaults"),
  copyButton: document.querySelector("#copy-values"),
  status: document.querySelector("#input-status"),
  tabs: document.querySelector("#word-tabs"),
  panel: document.querySelector("#word-panel"),
  summary: document.querySelector("#word-summary"),
  warnings: document.querySelector("#warning-list"),
  notes: document.querySelector("#model-notes"),
};

let catalog;
let currentProfile;
let values = {};
let activeWord;
let wordInputs = new Map();
let combinedInput = null;
let inputErrors = new Map();
let actionMessage = "";


function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}


function wordIds() {
  return Object.keys(currentProfile.bytes);
}


function profileFor(wordId) {
  return currentProfile.bytes[wordId];
}


function groupedText(text, groupSize = 4) {
  const groups = [];
  for (let index = 0; index < text.length; index += groupSize) {
    groups.push(text.slice(index, index + groupSize));
  }
  return groups.join(" ");
}


function setActionMessage(message) {
  actionMessage = message;
  renderStatus();
}


function setInputError(input, message) {
  if (message) {
    inputErrors.set(input, message);
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
  } else {
    inputErrors.delete(input);
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
  }
  actionMessage = "";
  renderStatus();
}


function renderStatus() {
  const messages = [...new Set(inputErrors.values())];
  elements.status.classList.toggle("error", messages.length > 0);
  elements.status.classList.toggle("success", messages.length === 0 && Boolean(actionMessage));
  elements.status.textContent = messages.join(" ") || actionMessage;
}


function createHexControl(label, digits, onValue, primary = false) {
  const wrapper = element("label", `hex-control${primary ? " primary" : ""}`);
  const labelText = element("span", "hex-label", label);
  const input = element("input", "hex-input");
  input.type = "text";
  input.inputMode = "text";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.maxLength = digits + 2;
  input.placeholder = "F".repeat(digits);
  input.setAttribute("aria-label", `${label} hexadecimal value`);

  input.addEventListener("input", () => {
    try {
      const parsed = parseHex(input.value, digits, label);
      setInputError(input, "");
      onValue(parsed);
      render({ preserveFocusedInput: true });
    } catch (error) {
      setInputError(input, error.message);
    }
  });
  input.addEventListener("blur", () => render());

  wrapper.append(labelText, input);
  return { wrapper, input };
}


function buildHexInputs() {
  elements.hexInputs.replaceChildren();
  wordInputs = new Map();
  combinedInput = null;
  inputErrors = new Map();

  if (family === "RL78") {
    const userIds = ["C0", "C1", "C2"];
    const combined = createHexControl(
      "C0C1C2（MSB → LSB）",
      6,
      (parsed) => {
        const split = splitValue(parsed, userIds, 8);
        userIds.forEach((id) => {
          values[id] = split[id];
        });
      },
      true,
    );
    combinedInput = combined.input;
    elements.hexInputs.append(combined.wrapper);
  }

  wordIds().forEach((wordId) => {
    const wordProfile = profileFor(wordId);
    const digits = hexDigitsFor(wordProfile);
    const control = createHexControl(wordId, digits, (parsed) => {
      values[wordId] = parsed;
    });
    control.input.dataset.word = wordId;
    wordInputs.set(wordId, control.input);
    elements.hexInputs.append(control.wrapper);
  });
}


function renderInputs(preserveFocusedInput = false) {
  const focused = preserveFocusedInput ? document.activeElement : null;

  if (combinedInput && combinedInput !== focused) {
    const combined = combineValues(values, ["C0", "C1", "C2"], 8);
    combinedInput.value = formatHex(combined, 6);
  }

  wordInputs.forEach((input, wordId) => {
    if (input !== focused) {
      input.value = formatHex(values[wordId], hexDigitsFor(profileFor(wordId)));
    }
  });
}


function buildTabs() {
  elements.tabs.replaceChildren();
  wordIds().forEach((wordId) => {
    const button = element("button", "word-tab", wordId);
    button.type = "button";
    button.dataset.word = wordId;
    button.addEventListener("click", () => {
      activeWord = wordId;
      render();
    });
    elements.tabs.append(button);
  });
}


function createBitCard(wordId, wordProfile, bit) {
  const expected = wordProfile.fixed_bits?.[String(bit)];
  const isFixed = expected !== undefined;
  const current = bitValue(values[wordId], bit);
  const mismatch = isFixed && current !== Number(expected);
  const label = wordProfile.bit_labels?.[String(bit)] ?? `Bit${bit}`;

  const card = element(
    "label",
    `bit-card${isFixed ? " fixed" : ""}${mismatch ? " mismatch" : ""}`,
  );
  card.title = buildBitTooltip(wordProfile, bit);

  const heading = element("span", "bit-heading");
  heading.append(
    element("span", "bit-number", `bit${bit}`),
    element("span", `bit-state state-${current}`, String(current)),
  );

  const checkbox = element("input", "bit-checkbox");
  checkbox.type = "checkbox";
  checkbox.checked = current === 1;
  checkbox.disabled = isFixed;
  checkbox.setAttribute("aria-label", `${wordId} bit${bit} ${label}`);
  checkbox.addEventListener("change", () => {
    values[wordId] = setBit(values[wordId], bit, checkbox.checked);
    actionMessage = "";
    render();
  });

  const name = element("span", "bit-name", label);
  card.append(heading, checkbox, name);
  if (isFixed) {
    card.append(element("span", "fixed-badge", `Fixed ${expected}`));
  }
  return card;
}


function createBitBanks(wordId, wordProfile) {
  const width = Number(wordProfile.width ?? 8);
  const container = element("div", "bit-banks");

  for (let high = width - 1; high >= 0; high -= 8) {
    const low = Math.max(0, high - 7);
    const bank = element("section", "bit-bank");
    bank.append(element("h3", "bit-bank-title", `bits ${high}:${low}`));
    const grid = element("div", "bit-grid");
    for (let bit = high; bit >= low; bit -= 1) {
      grid.append(createBitCard(wordId, wordProfile, bit));
    }
    bank.append(grid);
    container.append(bank);
  }
  return container;
}


function createCurrentFieldTable(wordProfile, wordValue) {
  const decoded = describeFields(wordValue, wordProfile);
  if (!decoded.length) {
    return element("p", "empty-note", "此 word 沒有可調整欄位；所有位元皆依手冊固定。 ");
  }

  const wrapper = element("div", "table-scroll");
  const table = element("table", "decode-table");
  const head = element("thead");
  const headRow = element("tr");
  ["欄位", "Bits", "目前值", "解碼行為"].forEach((text) => headRow.append(element("th", "", text)));
  head.append(headRow);
  const tbody = element("tbody");
  decoded.forEach((field) => {
    const row = element("tr");
    row.append(
      element("td", "field-name", field.name),
      element("td", "mono", field.bits),
      element("td", "mono", field.binary),
      element("td", "", field.description || "—"),
    );
    tbody.append(row);
  });
  table.append(head, tbody);
  wrapper.append(table);
  return wrapper;
}


function createCombinationDetails(wordProfile) {
  const details = element("details", "combination-details");
  details.append(element("summary", "", "查看完整欄位組合表"));
  const fields = wordProfile.fields ?? [];
  if (!fields.length) {
    details.append(element("p", "empty-note", "沒有可調整的欄位組合。"));
    return details;
  }

  fields.forEach((field) => {
    const block = element("section", "combination-field");
    const bitText = field.kind === "group" ? `bits ${field.bits.join(",")}` : `bit${field.bit}`;
    block.append(element("h4", "", `${field.name} · ${bitText}`));
    const table = element("table", "combination-table");
    const tbody = element("tbody");
    fieldCombinations(field).forEach((entry) => {
      const row = element("tr");
      row.append(element("th", "mono", entry.binary), element("td", "", entry.description));
      tbody.append(row);
    });
    if (field.unknown) {
      const row = element("tr", "unknown-row");
      row.append(element("th", "", "其他"), element("td", "", field.unknown));
      tbody.append(row);
    }
    table.append(tbody);
    block.append(table);
    details.append(block);
  });
  return details;
}


function renderPanel() {
  const wordId = activeWord;
  const wordProfile = profileFor(wordId);
  const width = Number(wordProfile.width ?? 8);
  const digits = hexDigitsFor(wordProfile);
  const wordValue = values[wordId];
  const panel = element("article", "option-panel");

  const header = element("header", "panel-header");
  const heading = element("div");
  heading.append(
    element("p", "eyebrow", wordProfile.address),
    element("h2", "", wordProfile.title),
  );
  const hex = element("div", "panel-value");
  hex.append(
    element("span", "panel-value-label", `${width}-bit value`),
    element("strong", "mono", formatHex(wordValue, digits, true)),
  );
  header.append(heading, hex);
  panel.append(header, createBitBanks(wordId, wordProfile));

  const decodeSection = element("section", "decode-section");
  decodeSection.append(
    element("h3", "section-title", "目前欄位解碼"),
    createCurrentFieldTable(wordProfile, wordValue),
    createCombinationDetails(wordProfile),
  );

  if ((wordProfile.notes ?? []).length) {
    const noteSection = element("section", "word-notes");
    noteSection.append(element("h3", "section-title", "手冊備註"));
    const list = element("ul");
    wordProfile.notes.forEach((note) => list.append(element("li", "", note)));
    noteSection.append(list);
    decodeSection.append(noteSection);
  }

  panel.append(decodeSection);
  elements.panel.replaceChildren(panel);
}


function renderTabs() {
  elements.tabs.querySelectorAll(".word-tab").forEach((button) => {
    const selected = button.dataset.word === activeWord;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
}


function renderSummary() {
  elements.summary.replaceChildren();
  wordIds().forEach((wordId) => {
    const wordProfile = profileFor(wordId);
    const width = Number(wordProfile.width ?? 8);
    const digits = hexDigitsFor(wordProfile);
    const value = values[wordId];
    const card = element("button", `summary-card${activeWord === wordId ? " active" : ""}`);
    card.type = "button";
    card.addEventListener("click", () => {
      activeWord = wordId;
      render();
      elements.panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    card.append(
      element("span", "summary-name", wordId),
      element("strong", "summary-hex mono", formatHex(value, digits, true)),
      element("span", "summary-binary mono", groupedText(formatBinary(value, width))),
    );
    if (width === 32) {
      card.append(element("span", "summary-bytes mono", groupedText(formatHex(value, 8), 2)));
    }
    elements.summary.append(card);
  });
}


function renderWarningsAndNotes() {
  const allWarnings = [];
  wordIds().forEach((wordId) => {
    collectWarnings(values[wordId], profileFor(wordId)).forEach((warning) => {
      allWarnings.push({ wordId, warning });
    });
  });

  elements.warnings.replaceChildren();
  if (!allWarnings.length) {
    elements.warnings.className = "warning-list valid";
    elements.warnings.append(element("p", "", "目前數值未發現固定位元或禁止組合錯誤。"));
  } else {
    elements.warnings.className = "warning-list invalid";
    const list = element("ul");
    allWarnings.forEach(({ wordId, warning }) => {
      const item = element("li");
      item.append(element("strong", "", `${wordId}: `), document.createTextNode(warning));
      list.append(item);
    });
    elements.warnings.append(list);
  }

  elements.notes.replaceChildren();
  const notes = currentProfile.notes ?? [];
  if (notes.length) {
    const list = element("ul");
    notes.forEach((note) => list.append(element("li", "", note)));
    elements.notes.append(list);
  } else {
    elements.notes.append(element("p", "empty-note", "此型號沒有額外備註。"));
  }
}


function renderReference() {
  elements.reference.replaceChildren();
  const source = element("span", "reference-source", currentProfile.manual);
  const chapter = element("span", "reference-chapter", currentProfile.chapter);
  elements.reference.append(source, chapter);
}


function render(options = {}) {
  if (!currentProfile) {
    return;
  }
  renderReference();
  renderInputs(Boolean(options.preserveFocusedInput));
  renderTabs();
  renderPanel();
  renderSummary();
  renderWarningsAndNotes();
  renderStatus();
}


function resetDefaults() {
  values = {};
  wordIds().forEach((wordId) => {
    values[wordId] = BigInt(profileFor(wordId).default);
  });
  inputErrors = new Map();
  document.querySelectorAll(".hex-input.invalid").forEach((input) => {
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
  });
  setActionMessage("已恢復手冊預設／shipping value。 ");
  render();
}


function selectModel(modelName) {
  currentProfile = catalog.profiles[modelName];
  if (!currentProfile) {
    throw new Error(`Unsupported model: ${modelName}`);
  }
  values = {};
  wordIds().forEach((wordId) => {
    values[wordId] = BigInt(profileFor(wordId).default);
  });
  activeWord = wordIds()[0];
  actionMessage = "";
  buildHexInputs();
  buildTabs();
  render();

  const url = new URL(window.location.href);
  url.searchParams.set("model", modelName);
  window.history.replaceState({}, "", url);
}


function copyTextFallback(text) {
  const textarea = element("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}


async function copyValues() {
  const parts = [];
  if (family === "RL78") {
    const combined = combineValues(values, ["C0", "C1", "C2"], 8);
    parts.push(`C0C1C2=${formatHex(combined, 6, true)}`);
    wordIds()
      .filter((id) => !["C0", "C1", "C2"].includes(id))
      .forEach((id) => parts.push(`${id}=${formatHex(values[id], hexDigitsFor(profileFor(id)), true)}`));
  } else {
    wordIds().forEach((id) => {
      parts.push(`${id}=${formatHex(values[id], hexDigitsFor(profileFor(id)), true)}`);
    });
  }
  const text = parts.join(" ");

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      copyTextFallback(text);
    }
    setActionMessage(`已複製：${text}`);
  } catch (error) {
    setActionMessage(`複製失敗：${error.message}`);
  }
}


async function initialize() {
  try {
    const response = await fetch(profileSource, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    catalog = await response.json();
    if (catalog.schema_version !== 1 || catalog.family !== family) {
      throw new Error("Profile schema or family mismatch.");
    }

    catalog.model_order.forEach((modelName) => {
      const option = element("option", "", modelName);
      option.value = modelName;
      elements.modelSelect.append(option);
    });

    elements.modelSelect.addEventListener("change", () => selectModel(elements.modelSelect.value));
    elements.resetButton.addEventListener("click", resetDefaults);
    elements.copyButton.addEventListener("click", copyValues);

    const requestedModel = new URL(window.location.href).searchParams.get("model");
    const initialModel = catalog.profiles[requestedModel] ? requestedModel : catalog.model_order[0];
    elements.modelSelect.value = initialModel;
    selectModel(initialModel);
  } catch (error) {
    elements.status.className = "input-status error";
    elements.status.textContent = `無法載入 Option Byte profiles：${error.message}`;
    elements.modelSelect.disabled = true;
    elements.resetButton.disabled = true;
    elements.copyButton.disabled = true;
  }
}


initialize();
