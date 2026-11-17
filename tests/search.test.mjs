import test from "node:test";
import assert from "node:assert/strict";
import { matchesCategory, matchesQuery } from "../src/utils/search.ts";

const bike = {
  title: "Red city bike",
  description: "Gazelle frame, new tyres and a working light.",
  category: "Bikes",
  city: "Utrecht",
};

test("empty query matches every product", () => {
  assert.equal(matchesQuery(bike, ""), true);
  assert.equal(matchesQuery(bike, "   "), true);
});

test("finds words in the title", () => {
  assert.equal(matchesQuery(bike, "bike"), true);
  assert.equal(matchesQuery(bike, "RED"), true);
});

test("finds words in the description", () => {
  assert.equal(matchesQuery(bike, "gazelle"), true);
  assert.equal(matchesQuery(bike, "tyres"), true);
});

test("every word must match somewhere", () => {
  assert.equal(matchesQuery(bike, "red gazelle"), true);
  assert.equal(matchesQuery(bike, "blue bike"), false);
});

test("ignores accents", () => {
  assert.equal(matchesQuery({ ...bike, title: "Café table" }, "cafe"), true);
});

test("works when description is missing", () => {
  assert.equal(matchesQuery({ ...bike, description: undefined }, "bike"), true);
  assert.equal(matchesQuery({ ...bike, description: undefined }, "gazelle"), false);
});

test("category filter", () => {
  assert.equal(matchesCategory(bike, ""), true);
  assert.equal(matchesCategory(bike, "bikes"), true);
  assert.equal(matchesCategory(bike, "Furniture"), false);
});
