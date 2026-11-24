import test from "node:test";
import assert from "node:assert/strict";
import {
  emptySellForm,
  firstInvalidStep,
  formatPrice,
  parsePrice,
  validateStep,
} from "../src/utils/sellForm.ts";

const filled = {
  ...emptySellForm,
  photos: ["data:image/jpeg;base64,abc"],
  title: "Red city bike",
  category: "Category 1",
  condition: "Good",
  price: "125",
};

test("parsePrice accepts normal and Dutch notation", () => {
  assert.equal(parsePrice("25"), 25);
  assert.equal(parsePrice("25.50"), 25.5);
  assert.equal(parsePrice("25,50"), 25.5);
  assert.equal(parsePrice(" 1 000 "), 1000);
});

test("parsePrice rejects invalid input", () => {
  assert.equal(parsePrice(""), null);
  assert.equal(parsePrice("abc"), null);
  assert.equal(parsePrice("-5"), null);
  assert.equal(parsePrice("2.555"), null);
});

test("formatPrice", () => {
  assert.equal(formatPrice(25), "€ 25");
  assert.equal(formatPrice(25.5), "€ 25.50");
});

test("step 1 needs a photo", () => {
  assert.ok(validateStep(1, emptySellForm).photos);
  assert.deepEqual(validateStep(1, filled), {});
});

test("step 2 needs title, category and condition", () => {
  const errors = validateStep(2, emptySellForm);
  assert.ok(errors.title);
  assert.ok(errors.category);
  assert.ok(errors.condition);
  assert.deepEqual(validateStep(2, filled), {});
  assert.ok(validateStep(2, { ...filled, title: "x".repeat(61) }).title);
});

test("step 3 checks the price", () => {
  assert.ok(validateStep(3, { ...filled, price: "" }).price);
  assert.ok(validateStep(3, { ...filled, price: "0" }).price);
  assert.ok(validateStep(3, { ...filled, price: "abc" }).price);
  assert.ok(validateStep(3, { ...filled, price: "200000" }).price);
  assert.deepEqual(validateStep(3, filled), {});
});

test("firstInvalidStep finds the first step to fix", () => {
  assert.equal(firstInvalidStep(emptySellForm), 1);
  assert.equal(firstInvalidStep({ ...filled, price: "" }), 3);
  assert.equal(firstInvalidStep(filled), null);
});
