const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectWithFallback() {
  const mongoUri = process.env.MONGODB_URI;
  try {
    if (mongoUri) {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
      return;
    }
    throw new Error('MONGODB_URI not set');
  } catch (err) {
    console.warn('Failed to connect to provided MongoDB URI:', err.message);
    console.warn('Falling back to in-memory MongoDB (mongodb-memory-server) for development/testing.');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to in-memory MongoDB');

      // Graceful shutdown for in-memory server
      const shutdown = async () => {
        await mongoose.disconnect();
        await mongod.stop();
        process.exit(0);
      };
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    } catch (memErr) {
      console.error('In-memory MongoDB failed to start:', memErr);
    }
  }
}

connectWithFallback();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/fraud', require('./routes/fraud'));
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/literacy', require('./routes/literacy'));
app.use('/api/debt', require('./routes/debt'));
app.use('/api/income', require('./routes/income'));
app.use('/api/prediction', require('./routes/prediction'));
app.use('/api/2fa', require('./routes/twofa'));
app.use('/api/i18n', require('./routes/i18n'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`SecureFin Backend running on port ${PORT}`);
});
