// Simple in-memory store for expenses keyed by userId
const store = new Map();

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = {
  addExpense(userId, expense) {
    const id = makeId();
    const item = Object.assign({}, expense, { _id: id });
    if (!store.has(String(userId))) store.set(String(userId), []);
    store.get(String(userId)).push(item);
    return item;
  },
  getExpenses(userId) {
    return store.get(String(userId)) || [];
  },
  clearUser(userId) {
    store.delete(String(userId));
  },
  // debug: return entire store
  dump() {
    const obj = {};
    for (const [k, v] of store.entries()) obj[k] = v.slice();
    return obj;
  }
};
