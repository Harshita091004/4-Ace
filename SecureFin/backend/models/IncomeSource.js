const mongoose = require('mongoose');

const IncomeSourceSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    sourceType: { type: String, enum: ['scholarship', 'part-time-job', 'freelance', 'internship', 'business', 'other'], required: true },
    sourceName: { type: String, required: true }, // e.g., "College Scholarship", "Freelance Writing"
    monthlyAmount: { type: Number, required: true },
    frequency: { type: String, enum: ['monthly', 'quarterly', 'annually', 'irregular'], default: 'monthly' },
    nextPaymentDate: Date,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IncomeSource', IncomeSourceSchema);
