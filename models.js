const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'chatHistory.db',
    logging: false // Disable logging
});

const Message = sequelize.define('Message', {
    role: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

const initializeDatabase = async () => {
    try {
        // Drop all tables if they exist
        await sequelize.drop();

        // Define models after dropping tables
        await Message.sync();

        console.log('Database initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

module.exports = { Message, initializeDatabase };
