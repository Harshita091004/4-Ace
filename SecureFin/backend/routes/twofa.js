const express = require('express');
const router = express.Router();
const TwoFactorAuth = require('../models/TwoFactorAuth');
const crypto = require('crypto');

// Middleware - Auth
const authenticateUser = (req, res, next) => {
  const userId = req.headers['user-id'] || req.query.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  next();
};

router.use(authenticateUser);

// Generate backup codes
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push({
      code: `${code.slice(0, 4)}-${code.slice(4)}`,
      used: false,
    });
  }
  return codes;
}

// Simulate TOTP secret generation (in production, use 'speakeasy' library)
function generateTotpSecret() {
  const secret = crypto.randomBytes(15).toString('base64');
  return secret;
}

// Simulate TOTP verification (in production, use 'speakeasy' library)
function verifyTotp(secret, token) {
  // In production: use speakeasy.totp.verify()
  // For demo: accept any 6-digit token
  return /^\d{6}$/.test(token);
}

// Enable 2FA with TOTP
router.post('/enable-totp', async (req, res) => {
  try {
    let twoFa = await TwoFactorAuth.findOne({ userId: req.userId });

    if (!twoFa) {
      twoFa = new TwoFactorAuth({
        userId: req.userId,
      });
    }

    const secret = generateTotpSecret();
    const backupCodes = generateBackupCodes(10);

    twoFa.totpSecret = secret;
    twoFa.totpEnabled = true;
    twoFa.backupCodes = backupCodes;
    twoFa.verificationMethod = 'totp';

    await twoFa.save();

    res.status(201).json({
      message: 'TOTP 2FA enabled. Scan QR code or enter secret manually.',
      secret,
      backupCodes: backupCodes.map((b) => b.code),
      qrCodeUrl: `otpauth://totp/SecureFin:${req.userId}?secret=${secret}&issuer=SecureFin`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enable Email OTP 2FA
router.post('/enable-email-otp', async (req, res) => {
  try {
    let twoFa = await TwoFactorAuth.findOne({ userId: req.userId });

    if (!twoFa) {
      twoFa = new TwoFactorAuth({
        userId: req.userId,
      });
    }

    twoFa.emailOtpEnabled = true;
    twoFa.verificationMethod = 'email';

    await twoFa.save();

    // In production: send email with OTP
    const demoOtp = '123456';

    res.status(201).json({
      message: 'Email OTP 2FA enabled. OTP sent to registered email.',
      demoOtp, // Remove in production
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify TOTP token
router.post('/verify-totp', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const twoFa = await TwoFactorAuth.findOne({ userId: req.userId });

    if (!twoFa || !twoFa.totpEnabled) {
      return res.status(400).json({ error: 'TOTP not enabled' });
    }

    const isValid = verifyTotp(twoFa.totpSecret, token);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    twoFa.lastVerified = new Date();
    await twoFa.save();

    res.json({
      message: 'Token verified successfully',
      verified: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Email OTP
router.post('/verify-email-otp', async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ error: 'OTP required' });
    }

    // In production: verify OTP against sent value
    // For demo: accept any 6-digit OTP
    if (!/^\d{6}$/.test(otp)) {
      return res.status(401).json({ error: 'Invalid OTP format' });
    }

    const twoFa = await TwoFactorAuth.findOne({ userId: req.userId });

    if (!twoFa || !twoFa.emailOtpEnabled) {
      return res.status(400).json({ error: 'Email OTP not enabled' });
    }

    twoFa.lastVerified = new Date();
    await twoFa.save();

    res.json({
      message: 'OTP verified successfully',
      verified: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Use backup code
router.post('/use-backup-code', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Backup code required' });
    }

    const twoFa = await TwoFactorAuth.findOne({ userId: req.userId });

    if (!twoFa) {
      return res.status(400).json({ error: '2FA not configured' });
    }

    const backupCode = twoFa.backupCodes.find((b) => b.code === code && !b.used);

    if (!backupCode) {
      return res.status(401).json({ error: 'Invalid or already used backup code' });
    }

    backupCode.used = true;
    backupCode.usedAt = new Date();
    twoFa.lastVerified = new Date();

    await twoFa.save();

    res.json({
      message: 'Backup code used successfully',
      codesRemaining: twoFa.backupCodes.filter((b) => !b.used).length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get 2FA status
router.get('/status', async (req, res) => {
  try {
    const twoFa = await TwoFactorAuth.findOne({ userId: req.userId });

    if (!twoFa) {
      return res.json({
        totpEnabled: false,
        emailOtpEnabled: false,
        backupCodesRemaining: 0,
      });
    }

    res.json({
      totpEnabled: twoFa.totpEnabled,
      emailOtpEnabled: twoFa.emailOtpEnabled,
      verificationMethod: twoFa.verificationMethod,
      lastVerified: twoFa.lastVerified,
      backupCodesRemaining: twoFa.backupCodes.filter((b) => !b.used).length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disable 2FA
router.post('/disable', async (req, res) => {
  try {
    const twoFa = await TwoFactorAuth.findOne({ userId: req.userId });

    if (!twoFa) {
      return res.status(400).json({ error: '2FA not enabled' });
    }

    twoFa.totpEnabled = false;
    twoFa.emailOtpEnabled = false;
    twoFa.totpSecret = null;
    twoFa.backupCodes = [];

    await twoFa.save();

    res.json({
      message: '2FA disabled successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
