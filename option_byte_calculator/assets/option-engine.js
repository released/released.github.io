const HEX_PATTERN = /^[0-9A-F]+$/;


export function normalizeHex(text) {
  let normalized = String(text ?? "").trim().replace(/[\s_]/g, "").toUpperCase();
  if (normalized.startsWith("0X")) {
    normalized = normalized.slice(2);
  }
  return normalized;
}


export function parseHex(text, exactDigits, label = "HEX") {
  const normalized = normalizeHex(text);
  if (normalized.length !== exactDigits) {
    throw new Error(`${label} 必須恰好為 ${exactDigits} 個十六進位數字。`);
  }
  if (!HEX_PATTERN.test(normalized)) {
    throw new Error(`${label} 包含非十六進位字元。`);
  }
  return BigInt(`0x${normalized}`);
}


export function hexDigitsFor(profile) {
  const width = Number(profile.width ?? 8);
  return Math.max(2, Math.ceil(width / 4));
}


export function formatHex(value, digits, withPrefix = false) {
  const text = BigInt(value).toString(16).toUpperCase().padStart(digits, "0");
  return withPrefix ? `0x${text}` : text;
}


export function formatBinary(value, width) {
  return BigInt(value).toString(2).padStart(width, "0");
}


export function bitValue(value, bit) {
  return Number((BigInt(value) >> BigInt(bit)) & 1n);
}


export function setBit(value, bit, enabled) {
  const mask = 1n << BigInt(bit);
  return enabled ? BigInt(value) | mask : BigInt(value) & ~mask;
}


export function groupValue(value, bits) {
  return bits.reduce(
    (result, bit) => (result << 1n) | BigInt(bitValue(value, bit)),
    0n,
  );
}


export function splitValue(value, ids, bitsPerWord = 8) {
  const width = BigInt(bitsPerWord);
  const mask = (1n << width) - 1n;
  const result = {};
  ids.forEach((id, index) => {
    const shift = BigInt((ids.length - index - 1) * bitsPerWord);
    result[id] = (BigInt(value) >> shift) & mask;
  });
  return result;
}


export function combineValues(values, ids, bitsPerWord = 8) {
  const width = BigInt(bitsPerWord);
  return ids.reduce((result, id) => (result << width) | BigInt(values[id]), 0n);
}


function mappedValue(values, value, fallback = "") {
  const key = BigInt(value).toString();
  return Object.prototype.hasOwnProperty.call(values ?? {}, key) ? values[key] : fallback;
}


export function describeFields(value, profile) {
  return (profile.fields ?? []).map((field) => {
    if (field.kind === "bit") {
      const rawValue = BigInt(bitValue(value, field.bit));
      return {
        name: field.name,
        bits: `bit${field.bit}`,
        binary: rawValue.toString(),
        value: rawValue,
        description: mappedValue(field.values, rawValue),
      };
    }

    const rawValue = groupValue(value, field.bits);
    return {
      name: field.name,
      bits: `bits ${field.bits.join(",")}`,
      binary: formatBinary(rawValue, field.bits.length),
      value: rawValue,
      description: mappedValue(field.values, rawValue, field.unknown ?? ""),
    };
  });
}


function matchesBitValues(value, expectedValues) {
  return Object.entries(expectedValues ?? {}).every(
    ([bit, expected]) => bitValue(value, Number(bit)) === Number(expected),
  );
}


export function collectWarnings(value, profile) {
  const warnings = [];
  const address = profile.address;

  Object.entries(profile.fixed_bits ?? {}).forEach(([bit, expected]) => {
    const current = bitValue(value, Number(bit));
    if (current !== Number(expected)) {
      warnings.push(`${address} bit${bit} should be ${expected}.`);
    }
  });

  (profile.fields ?? []).forEach((field) => {
    if (field.kind !== "group" || !field.warn_unknown) {
      return;
    }
    const rawValue = groupValue(value, field.bits);
    if (!Object.prototype.hasOwnProperty.call(field.values ?? {}, rawValue.toString())) {
      warnings.push(
        `${address} ${field.name} value ${formatBinary(rawValue, field.bits.length)} is prohibited.`,
      );
    }
  });

  (profile.warnings ?? []).forEach((rule) => {
    if (rule.kind === "bit_values" && matchesBitValues(value, rule.values)) {
      warnings.push(rule.message);
      return;
    }

    if (rule.kind === "allowed_patterns") {
      const pattern = BigInt(value) & BigInt(rule.mask);
      const allowed = (rule.allowed ?? []).map((item) => BigInt(item));
      if (!allowed.includes(pattern)) {
        const allowedText = allowed
          .slice()
          .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0))
          .map((item) => formatHex(item, 2, true))
          .join(", ");
        warnings.push(
          `${address} pattern ${formatHex(pattern, 2, true)} not allowed (allowed: ${allowedText}).`,
        );
      }
      return;
    }

    if (rule.kind === "conditional_allowed" && matchesBitValues(value, rule.if)) {
      const rawValue = groupValue(value, rule.bits);
      const allowed = (rule.allowed ?? []).map((item) => BigInt(item));
      if (!allowed.includes(rawValue)) {
        warnings.push(rule.message);
      }
    }
  });

  return warnings;
}


export function fieldCombinations(field) {
  const width = field.kind === "group" ? field.bits.length : 1;
  return Object.entries(field.values ?? {})
    .map(([key, description]) => ({
      value: BigInt(key),
      binary: formatBinary(BigInt(key), width),
      description,
    }))
    .sort((left, right) => (left.value < right.value ? -1 : left.value > right.value ? 1 : 0));
}


export function fieldsForBit(profile, bit) {
  return (profile.fields ?? []).filter((field) => {
    if (field.kind === "bit") {
      return Number(field.bit) === Number(bit);
    }
    return (field.bits ?? []).map(Number).includes(Number(bit));
  });
}


export function buildBitTooltip(profile, bit) {
  const lines = [];
  if (profile.tooltip_prefix) {
    lines.push(profile.tooltip_prefix);
  }
  const label = profile.bit_labels?.[String(bit)] ?? `Bit${bit}`;
  lines.push(label);

  if (Object.prototype.hasOwnProperty.call(profile.fixed_bits ?? {}, String(bit))) {
    lines.push(`Fixed value: ${profile.fixed_bits[String(bit)]}`);
  }

  fieldsForBit(profile, bit).forEach((field) => {
    const suffix = field.kind === "group" ? ` (bits ${field.bits.join(",")})` : "";
    lines.push(`Field: ${field.name}${suffix}`);
    fieldCombinations(field).forEach((entry) => {
      lines.push(`${entry.binary} -> ${entry.description}`);
    });
    if (field.unknown) {
      lines.push(`Other values: ${field.unknown}`);
    }
  });

  const extra = profile.bit_tooltips?.[String(bit)];
  if (extra) {
    lines.push(extra);
  }
  return lines.join("\n");
}
