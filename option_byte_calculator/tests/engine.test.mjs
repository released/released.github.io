import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  bitValue,
  buildBitTooltip,
  collectWarnings,
  combineValues,
  describeFields,
  formatHex,
  parseHex,
  setBit,
  splitValue,
} from "../assets/option-engine.js";


async function loadCatalog(name) {
  const url = new URL(`../data/${name}-profiles.json`, import.meta.url);
  return JSON.parse(await readFile(url, "utf8"));
}


const rl78 = await loadCatalog("rl78");
const rh850 = await loadCatalog("rh850");


test("profile catalogs contain every audited model", () => {
  assert.equal(rl78.schema_version, 1);
  assert.equal(rl78.family, "RL78");
  assert.equal(rl78.model_order.length, 37);
  assert.deepEqual(
    rl78.model_order,
    [
      "RL78/D1A", "RL78/F12", "RL78/F13,F14", "RL78/F15", "RL78/F22,F25",
      "RL78/F23,F24", "RL78/G10", "RL78/G11", "RL78/G12", "RL78/G13",
      "RL78/G13A", "RL78/G14", "RL78/G15", "RL78/G16", "RL78/G1A",
      "RL78/G1C", "RL78/G1D", "RL78/G1F", "RL78/G1G", "RL78/G1H",
      "RL78/G1M,G1N", "RL78/G1P", "RL78/G22", "RL78/G23", "RL78/G24",
      "RL78/H1D", "RL78/I1A", "RL78/I1B", "RL78/I1C", "RL78/I1C (512 KB)",
      "RL78/I1D", "RL78/I1E", "RL78/L12", "RL78/L13", "RL78/L1A",
      "RL78/L1C", "RL78/L23",
    ],
  );
  assert.equal(rh850.schema_version, 1);
  assert.equal(rh850.family, "RH850");
  assert.equal(rh850.model_order.length, 4);
});


test("hex parsing requires complete words", () => {
  assert.equal(parseHex("0xFF_F7 F9", 6, "C0C1C2"), 0xFFF7F9n);
  assert.equal(parseHex("FA27FFCF", 8, "OPBT0"), 0xFA27FFCFn);
  assert.throws(() => parseHex("F7", 6, "C0C1C2"), /恰好為 6/);
  assert.throws(() => parseHex("ZZ27FFCF", 8, "OPBT0"), /非十六進位/);
});


test("RL78 C0C1C2 preserves MSB linker order", () => {
  const split = splitValue(0xFFF7F9n, ["C0", "C1", "C2"], 8);
  assert.deepEqual(split, { C0: 0xFFn, C1: 0xF7n, C2: 0xF9n });
  assert.equal(combineValues(split, ["C0", "C1", "C2"], 8), 0xFFF7F9n);
});


test("RH850 bit31 and bit0 stay in numeric word order", () => {
  let value = 0n;
  value = setBit(value, 31, true);
  value = setBit(value, 0, true);
  assert.equal(value, 0x80000001n);
  assert.equal(bitValue(value, 31), 1);
  assert.equal(bitValue(value, 30), 0);
  assert.equal(bitValue(value, 0), 1);
  assert.equal(formatHex(value, 8), "80000001");
});


test("all shipping/manual defaults pass validation", () => {
  [rl78, rh850].forEach((catalog) => {
    catalog.model_order.forEach((modelName) => {
      const profile = catalog.profiles[modelName];
      Object.entries(profile.bytes).forEach(([wordId, wordProfile]) => {
        assert.deepEqual(
          collectWarnings(BigInt(wordProfile.default), wordProfile),
          [],
          `${modelName} ${wordId}`,
        );
      });
    });
  });
});


test("every fixed-bit mismatch is reported", () => {
  [rl78, rh850].forEach((catalog) => {
    catalog.model_order.forEach((modelName) => {
      const profile = catalog.profiles[modelName];
      Object.entries(profile.bytes).forEach(([wordId, wordProfile]) => {
        Object.keys(wordProfile.fixed_bits ?? {}).forEach((bit) => {
          const invalid = BigInt(wordProfile.default) ^ (1n << BigInt(bit));
          assert.ok(
            collectWarnings(invalid, wordProfile).length > 0,
            `${modelName} ${wordId} bit${bit}`,
          );
        });
      });
    });
  });
});


test("F1KM unsupported bits remain reserved and undecoded", () => {
  const expected = {
    "RH850/F1KM-S4": { OPBT0: [15, 3, 2], OPBT1: [3, 1, 0] },
    "RH850/F1KM-S2": { OPBT0: [15, 14, 13, 3, 2], OPBT1: [3, 1, 0] },
    "RH850/F1KM-S1": { OPBT0: [15, 14, 13, 12, 3, 2], OPBT1: [3, 1, 0] },
  };

  Object.entries(expected).forEach(([modelName, words]) => {
    Object.entries(words).forEach(([wordId, bits]) => {
      const profile = rh850.profiles[modelName].bytes[wordId];
      const decodedBits = new Set();
      profile.fields.forEach((field) => {
        (field.kind === "group" ? field.bits : [field.bit]).forEach((bit) => decodedBits.add(bit));
      });
      bits.forEach((bit) => {
        assert.equal(profile.fixed_bits[String(bit)], 1);
        assert.equal(profile.bit_labels[String(bit)], "Reserved (write 1)");
        assert.equal(decodedBits.has(bit), false);
      });
    });
  });
});


test("field decoder resolves combined manual tables", () => {
  const profile = rl78.profiles["RL78/F13,F14"].bytes.C1;
  const decoded = describeFields(0x22n, profile);
  assert.ok(decoded.some((field) => field.name === "LVD_CONFIGURATION"));
  assert.ok(decoded.every((field) => field.description));
  assert.match(buildBitTooltip(profile, 7), /^Model: RL78\/F13,F14 \| CHAPTER 29/);
});


test("warning engine retains every desktop rule type", () => {
  const profile = {
    address: "TEST",
    bit_labels: {},
    fixed_bits: { "7": 1 },
    fields: [
      {
        kind: "group",
        bits: [2, 1],
        name: "MODE",
        values: { "0": "zero", "2": "two" },
        warn_unknown: true,
      },
    ],
    warnings: [
      { kind: "bit_values", values: { "0": 1 }, message: "bit-values warning" },
      { kind: "allowed_patterns", mask: 12, allowed: [0, 4, 8] },
      {
        kind: "conditional_allowed",
        if: { "3": 1 },
        bits: [2, 1],
        allowed: [2],
        message: "conditional warning",
      },
    ],
  };

  assert.match(collectWarnings(0x00n, profile).join(" "), /bit7 should be 1/);
  assert.match(collectWarnings(0x86n, profile).join(" "), /MODE value 11 is prohibited/);
  assert.match(collectWarnings(0x81n, profile).join(" "), /bit-values warning/);
  assert.match(collectWarnings(0x8Cn, profile).join(" "), /pattern 0x0C not allowed/);
  assert.match(collectWarnings(0x88n, profile).join(" "), /conditional warning/);
});
