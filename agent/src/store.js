// Tiny append-only JSON store — zero native dependencies.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export const HOME = path.join(os.homedir(), ".aiss");
const FILE = path.join(HOME, "db.json");

const EMPTY = { events: [], threats: [], scans: [], metrics: [], settings: {} };
let db = { ...EMPTY };
let dirty = false;

export function load() {
  fs.mkdirSync(HOME, { recursive: true });
  try {
    db = { ...EMPTY, ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
  } catch {
    db = JSON.parse(JSON.stringify(EMPTY));
  }
  return db;
}

export function data() {
  return db;
}

function trim(arr, max) {
  if (arr.length > max) arr.splice(0, arr.length - max);
}

export function push(table, row) {
  const item = { id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, at: new Date().toISOString(), ...row };
  db[table].push(item);
  trim(db[table], table === "metrics" ? 720 : 500);
  dirty = true;
  return item;
}

export function setSetting(k, v) {
  db.settings[k] = v;
  dirty = true;
}

export function save() {
  if (!dirty) return;
  dirty = false;
  fs.writeFileSync(FILE, JSON.stringify(db));
}

setInterval(() => save(), 4000).unref?.();
