const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'test' ? false : console.log,
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const Message = require('./message')(sequelize);
const Reply = require('./reply')(sequelize);

Message.hasMany(Reply, {
  as: 'replies',
  foreignKey: 'message_id',
  onDelete: 'CASCADE',
});

Reply.belongsTo(Message, {
  as: 'message',
  foreignKey: 'message_id',
});

module.exports = {
  sequelize,
  Message,
  Reply,
};
