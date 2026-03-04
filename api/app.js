const express = require('express');
const cors = require('cors');
const messagesRouter = require('./routes/messages');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/messages', messagesRouter);

  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    });
  });

  app.get('/test', (req, res) => {
    res.send('API working');
  });

  return app;
}

module.exports = { createApp };
