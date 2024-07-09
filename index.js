const express = require('express');
const OpenAI = require('openai');
const { Message, initializeDatabase } = require('./models');
const { getRoomOptions, bookRoom } = require("./booking");
const fs = require('fs').promises;
require('dotenv').config();

// Initialize Express app
const app = express();

// Initialize OpenAI instance
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize database
initializeDatabase();

// Function to load chat history from the database
const loadChatHistory = async () => {
    try {
        const messages = await Message.findAll({
            attributes: ['role', 'content'],
            order: [['createdAt', 'ASC']]
        });
        return messages.map(msg => ({ role: msg.role, content: msg.content }));
    } catch (error) {
        console.error('Error loading chat history:', error);
        return [];
    }
};

// Function to save a message to the database
const saveMessage = async (role, content) => {
    try {
        // Ensure content is a string
        // const contentString = content === 'string' ? content : JSON.stringify(content);
        await Message.create({ role, content: content.toString() });
    } catch (error) {
        console.error('Error saving message:', error);
    }
};

// Function to load system prompt from file
const loadSystemPrompt = async () => {
    try {
        const data = await fs.readFile('systemprompt.txt', 'utf-8');
        return data.trim(); // Trim to remove any extra whitespace
    } catch (error) {
        console.error('Error loading system prompt:', error);
        return ''; // Return empty string if there's an error
    }
};

// Function to load tools from tools.txt
const loadTools = async () => {
    try {
        const data = await fs.readFile('tools.json', 'utf-8');
        return JSON.parse(data); // Assuming tools.txt contains JSON formatted tools data
    } catch (error) {
        console.error('Error loading tools:', error);
        return {}; // Return empty object if there's an error
    }
};

// Function to interact with OpenAI API
const getOpenAIResponse = async (message) => {
    try {
        // Save user message to database
        await saveMessage('user', message);

        // Load chat history, system prompt, and tools
        const chatHistory = await loadChatHistory();
        const systemPrompt = await loadSystemPrompt();
        const tools = await loadTools();

        // Construct messages array
        const messages = [
            { role: 'system', content: systemPrompt },
            ...chatHistory,
            { role: 'user', content: message },
        ];

        // Get response from OpenAI
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            tools,
            tool_choice: 'auto'
        });

        // Process OpenAI response
        const reply = response.choices[0].message;
        messages.push(reply);

        // Check for tool calls in response
        const toolCalls = reply.tool_calls;
        if (toolCalls && toolCalls.length > 0) {
            const toolCall = toolCalls[0];
            const toolFunctionName = toolCall.function.name;
            const toolArguments = JSON.parse(toolCall.function.arguments);

            // Execute corresponding function based on toolFunctionName
            let toolResponse;
            switch (toolFunctionName) {
                case 'bookRoom':
                    toolResponse = await bookRoom(toolArguments);
                    break;
                case 'getRoomOptions':
                    toolResponse = await getRoomOptions(toolArguments);
                    break;
                default:
                    toolResponse = 'Error: Unknown function';
                    break;
            }

            // Add tool response to messages
            messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                name: toolFunctionName,
                content: JSON.stringify(toolResponse) 
            });

            // Re-invoke OpenAI API with updated messages
            const updatedResponse = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages
            });

            // Save assistant response to database
            await saveMessage('assistant', updatedResponse.choices[0].message.content);

            return updatedResponse.choices[0].message.content; // Return assistant's response
        }

        // Save assistant response to database
        await saveMessage('assistant', reply.content);

        return reply.content; // Return regular AI response
    } catch (error) {
        console.error('Error getting response from OpenAI:', error);
        return 'Sorry, I am unable to respond right now.';
    }
};

// Endpoint to receive messages from client
app.post('/chat', async (req, res) => {
    const { message } = req.body;

    try {
        const botReply = await getOpenAIResponse(message);
        res.json({ message: botReply });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
