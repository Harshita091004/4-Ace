const mongoose = require('mongoose');

const TwoFactorAuthSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    totpEnabled: { type: Boolean, default: false },
    totpSecret: String, // Encrypted TOTP secret
    emailOtpEnabled: { type: Boolean, default: false },
    backupCodes: [
      {
        code: String,
        used: { type: Boolean, default: false },
        usedAt: Date,
      },
    ],
    lastVerified: Date,
    verificationMethod: { type: String, enum: ['totp', 'email'], default: 'totp' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TwoFactorAuth', TwoFactorAuthSchema);
