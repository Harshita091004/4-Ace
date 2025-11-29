/**
 * Test script to verify in-memory store and updated prediction logic
 * Tests: storing expenses, retrieving them, and running predictions based on 5-7 transactions
 */

const inmemoryStore = require('./backend/inmemoryStore');
const ExpenseAnalyzer = require('./backend/ai/expenseAnalyzer');

console.log('\n=== TEST: In-Memory Store + Prediction Logic ===\n');

// Test data: 10 expenses for a test user
const testUserId = 'test-user-001';
const testExpenses = [
  { date: new Date('2025-11-29'), amount: 250, category: 'food', description: 'Lunch', paymentMethod: 'Card' },
  { date: new Date('2025-11-28'), amount: 180, category: 'food', description: 'Dinner', paymentMethod: 'UPI' },
  { date: new Date('2025-11-27'), amount: 200, category: 'shopping', description: 'Groceries', paymentMethod: 'Card' },
  { date: new Date('2025-11-26'), amount: 500, category: 'transport', description: 'Uber to airport', paymentMethod: 'Card' },
  { date: new Date('2025-11-25'), amount: 120, category: 'food', description: 'Coffee', paymentMethod: 'Cash' },
  { date: new Date('2025-11-24'), amount: 1500, category: 'utilities', description: 'Electricity bill', paymentMethod: 'Bank' },
  { date: new Date('2025-11-23'), amount: 350, category: 'entertainment', description: 'Movie tickets', paymentMethod: 'Card' },
  { date: new Date('2025-11-22'), amount: 200, category: 'food', description: 'Breakfast', paymentMethod: 'UPI' },
  { date: new Date('2025-11-21'), amount: 450, category: 'shopping', description: 'Clothes', paymentMethod: 'Card' },
  { date: new Date('2025-11-20'), amount: 160, category: 'food', description: 'Snacks', paymentMethod: 'Cash' },
];

console.log('📝 Adding 10 test expenses to in-memory store...\n');

testExpenses.forEach((expense, idx) => {
  inmemoryStore.addExpense(testUserId, expense);
  console.log(`  ✓ Added: ${expense.date.toISOString().split('T')[0]} - ${expense.category} - ₹${expense.amount}`);
});

console.log('\n✅ All expenses added successfully.\n');

// Retrieve and verify
console.log('📊 Retrieving expenses from store...\n');
const storedExpenses = inmemoryStore.getExpenses(testUserId);
console.log(`Total stored: ${storedExpenses.length} expenses\n`);

// Test prediction with new logic
console.log('🔮 Running prediction based on past 5-7 transactions...\n');

// Sort by date (most recent first) like the endpoint does
const sortedExpenses = storedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

const analyzer = new ExpenseAnalyzer();
const prediction = analyzer.predictFutureSpending(sortedExpenses);

console.log(`Next Transaction Predicted: ₹${prediction.nextTransactionPredicted}`);
console.log(`Confidence Level: ${prediction.confidence}`);
console.log(`Confidence Score: ${prediction.confidenceScore}%`);
console.log(`Based on Transactions: ${prediction.basedOnTransactions}`);
console.log(`\nAccuracy Note: ${prediction.accuracyNote}\n`);

console.log('Category-wise Predictions:');
prediction.categoryPredictions.forEach(cat => {
  console.log(`  • ${cat.category}: ₹${cat.averageTransaction} (${cat.percentage}% of total)`);
});

// Test anomaly detection
console.log('\n🚨 Running anomaly detection...\n');
const anomalies = analyzer.detectAnomalies(sortedExpenses);
if (anomalies.length > 0) {
  console.log(`Found ${anomalies.length} anomalies:\n`);
  anomalies.forEach(anom => {
    console.log(`  🚩 ${anom.message}`);
  });
} else {
  console.log('No anomalies detected.');
}

// Test recommendations
console.log('\n💡 Top Recommendations:\n');
const recommendations = analyzer.generateRecommendations(sortedExpenses);
recommendations.slice(0, 3).forEach((rec, idx) => {
  console.log(`  ${idx + 1}. ${rec.message}`);
});

console.log('\n=== TEST COMPLETE ===\n');
