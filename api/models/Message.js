const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Message = sequelize.define("Message", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  author_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Message;