const { Telegraf } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN; // Your Telegram Bot API token
const apiUrl = 'http://localhost:3000/chat'; // Your chatbot API endpoint

// Create a new bot instance
const bot = new Telegraf(token);

// Map to store ongoing chat sessions
const activeChats = new Map();

// Start command handler
bot.start((ctx) => {
    ctx.reply('Welcome to SastaBot9! I\'m here to assist you with hotel bookings.');
    activeChats.set(ctx.chat.id, []);
});

// Help command handler
bot.help((ctx) => {
    ctx.reply('You can ask me about available rooms or book a room. How can I help you today?');
});

// Handle incoming text messages
bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id;
    const userMessage = ctx.message.text;

    try {
        // Check if there's an existing chat session for this chat ID
        if (!activeChats.has(chatId)) {
            activeChats.set(chatId, []);
        }

        // Add the user message to the chat history
        activeChats.get(chatId).push({ role: 'user', content: userMessage });

        // Make a request to your chatbot API
        const response = await axios.post(apiUrl, { message: userMessage });
        const botReply = response.data.message;

        if (botReply && botReply.trim().length > 0) {
            // Add the bot reply to the chat history
            activeChats.get(chatId).push({ role: 'assistant', content: botReply });

            // Send the response back to the user
            ctx.reply(botReply);
        } else {
            ctx.reply('Sorry, I didn\'t understand that. Could you please rephrase?');
        }
    } catch (error) {
        console.error('Error sending message to chatbot API:', error.message);
        ctx.reply('Sorry, I am unable to respond right now.');
    }
});

// Handle errors
bot.catch((error) => {
    console.error('Error in bot:', error);
    // Optionally, you can handle specific types of errors or log them to an external service
});

// Launch the bot
bot.launch().then(() => {
    console.log('Telegram bot is running...');
});
