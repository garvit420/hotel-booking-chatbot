# Hotel Booking ChatBot (SastaBot9)

SastaBot9 is a chatbot powered by the OpenAI API, designed to assist customers with hotel bookings through chat. It integrates a Telegram bot for easy interaction, allowing users to inquire about available rooms or book directly from their Telegram app.

## Project Setup

Follow these steps to get SastaBot9 up and running on your local machine.

### Cloning the Repository

First, clone the repository to your local machine:

```sh
git clone https://github.com/garvit420/hotel-booking-chatbot.git
cd hotel-booking-chatbot
```

### Installing Dependencies

Install the necessary dependencies for both the root project and the Telegram bot.

- For the root directory:

```sh
npm install
```

- For the Telegram bot directory:

```sh
cd telegram-bot
npm install
cd ..
```

### Setting Up Environment Variables

You need to set up environment variables for both the OpenAI API key in the root directory and the Telegram bot token in the `telegram-bot` folder.

- **OpenAI API Key**: Sign up at [OpenAI](https://openai.com/) to get your API key. Create a [`.env`] file in the root directory and add your OpenAI API


```env
OPENAI_API_KEY="your_openai_api_key_here"
PORT=3000
```

- **Telegram Bot Token**: Create a bot with [BotFather](https://t.me/botfather) on Telegram to get your bot token. Create a `.env` file in the `telegram-bot` directory and add your Telegram bot token:

```env
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"
```

### Running the Servers

Start the servers to get the chatbot running. First, run the main server:

```sh
node index.js
```

Then, in a new terminal window, navigate to the `telegram-bot` folder and run the Telegram bot:

```sh
cd telegram-bot
node bot.js
```

### Starting a Conversation

Open your Telegram app, search for your bot by the username you set up with BotFather, and start a conversation!

## Testing the Bot Without UI

You can test the bot functionality without using the Telegram UI by making API calls directly to the `/chat` endpoint.

Example POST request:

```sh
curl -X POST http://localhost:3000/chat \
-H "Content-Type: application/json" \
-d '{"message": "Hello, I would like to book a hotel room."}'
```

This will send a message to your chatbot, and you should receive a response based on the bot's logic and integration with the OpenAI API.