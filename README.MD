# Telegram ASTROAKUMA Bot

This is a simple Telegram bot written in JavaScript that fetches Astrology data based on the user's location and birth data.

## Dependencies

The bot uses the following npm packages:

- dotenv: To load environment variables from a .env file.
- request: To make HTTP requests to the OpenWeatherMap API.
- node-telegram-bot-api: To interact with the Telegram Bot API.
- swisseph: For fetching Astrological Data.

## Environment Variables

The bot requires the following environment variables:

- TELEGRAM_API_KEY: Your Telegram Bot API key.
- OPENWEATHERMAP_API_KEY: Your OpenWeatherMap API key.

These should be placed in a .env file in the root directory of the project.

## Usage

The bot is currently set to run in polling mode. To start the bot, simply run the following command in your terminal:

```bash
npm run start

## Functionality
The bot fetches the Astro Data of a user based on their zipcode and country code using the OpenWeatherMap API and Swiss Ephermis API.
