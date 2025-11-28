const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    creditorName: String, // e.g., "Education Loan", "Personal Loan"
    debtType: { type: String, enum: ['education-loan', 'personal-loan', 'credit-card', 'other'], required: true },
    totalAmount: { type: Number, required: true },
    amountRemaining: { type: Number, required: true },
    monthlyPayment: { type: Number },
    interestRate: { type: Number }, // percentage
    dueDate: Date,
    maturityDate: Date,
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    paymentHistory: [
      {
        amount: Number,
        paidOn: Date,
        status: { type: String, enum: ['on-time', 'late', 'missed'], default: 'on-time' },
      },
    ],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Debt', DebtSchema);
