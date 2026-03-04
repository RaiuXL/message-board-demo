require('dotenv').config();
const { sequelize } = require('./models');
const { createApp } = require('./app');

const app = createApp();
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
