require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const messagesRouter = require('./routes/messages');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/messages', messagesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start the server', error);
    process.exit(1);
  }
}

start();
