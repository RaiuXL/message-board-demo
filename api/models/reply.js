const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Reply',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      author_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      message_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
    },
    {
      tableName: 'replies',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
};
