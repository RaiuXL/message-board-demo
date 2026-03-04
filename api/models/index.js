const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'mysql';
const logging = process.env.NODE_ENV === 'test' ? false : console.log;
const define = {
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

const sequelizeOptions =
  dialect === 'sqlite'
    ? {
        dialect,
        storage: process.env.DB_STORAGE || ':memory:',
        logging,
        define,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
        dialect,
        logging,
        define,
      };

const sequelize =
  dialect === 'sqlite'
    ? new Sequelize(sequelizeOptions)
    : new Sequelize(
        process.env.DB_NAME || 'message_board',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '',
        sequelizeOptions
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
