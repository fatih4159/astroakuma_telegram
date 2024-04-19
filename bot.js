require('dotenv').config();
const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const swisseph = require('swisseph');
const telegram_api_key = process.env.TELEGRAM_API_KEY;
const openweathermap_api_key = process.env.OPENWEATHERMAP_API_KEY;
const users = {};
const bot = new TelegramBot(telegram_api_key, {polling: true});

// fetching coordinates using OpenWeatherMap API
async function getCoordinates(chatId) {
    console.log("getting coordinates")
    return new Promise((resolve, reject) => {
        const url = `http://api.openweathermap.org/geo/1.0/zip?zip=${users[chatId].zipcode},${users[chatId].countrycode}&appid=${openweathermap_api_key}`;

        request(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                const data = JSON.parse(body);
                console.log(data);
                const latitude = data.lat;
                const longitude = data.lon;
                resolve({ latitude, longitude });
            }
        });
    });
}

// fetching astrodata from Swiss Ephemeris API
async function getAstroData(birthdate, birthtime, coordinates) {
    // Convert the birthdate and birthtime to Julian Day
    console.log("getting astrodata")

    const jd = swisseph.swe_julday(
        Number(birthdate.split('-')[0]),
        Number(birthdate.split('-')[1]),
        Number(birthdate.split('-')[2]),
        Number(birthtime.split(':')[0]),
        1,
        (err, result) => {
            if (err) {
                console.error(err);
            } else {
                console.log(result);
            }
        }
    );

    // calculate the birthchart with planet, sign (with degree) and its house

    const botText = `Your birthdate is ${users[chatId].birthdate} and your birthtime is ${users [chatId].birthtime}.`;

    const astroData = swisseph.swe_calc_ut(jd, coordinates.latitude, coordinates.longitude, swisseph.SEFLG_SWIEPHOSE, swisseph.SEFLG_SIDEREAL);

    for (let i = 0; i < swisseph.SE_NPLANETS; i++) {
        const planet = swisseph.swe_get_planet_name(i);

        const house = swisseph.swe_get_house(astroData[i].house);
        const sign = swisseph.swe_get_sign(astroData[i].sign);
        const degree = swisseph.swe_deg(astroDataData[i].angle);

        botText += `\n${planet}: ${degree}° ${sign} in house ${house}`;
    }

    // send the astrodata to the user
    bot.sendMessage(chatId, botText);
    users[chatId] = {};
    console.log("got astrodata")

    return botText;
}

// start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    users[chatId] = {};
    bot.sendMessage(chatId, 'Welcome to the Astrology Bot! Please enter your birthdate in the format YYYY-MM-DD.');
});

// birthdate command
bot.onText(/^\d{4}-\d{2}-\d{2}$/, (msg) => {
    const chatId = msg.chat.id;
    users[chatId].birthdate = msg.text;
    bot.sendMessage(chatId, 'Please enter your birthtime in the format HH:MM.');
});

// birthtime command
bot.onText(/^\d{2}:\d{2}$/, (msg) => {
    const chatId = msg.chat.id;
    users[chatId].birthtime = msg.text;
    bot.sendMessage(chatId, 'Please enter your zip code.');
});

// zip code command
bot.onText(/^\d{5}$/, (msg) => {
    const chatId = msg.chat.id;
    users[chatId].zipcode = msg.text;
    bot.sendMessage(chatId, 'Please enter your country code.');
});

// country code command
bot.onText(/^[A-Z]{2}$/, (msg) => {
    const chatId = msg.chat.id;
    users[chatId].countrycode = msg.text;
    getCoordinates(chatId)
        .then((coordinates) => getAstroData(users[chatId].birthdate, users[chatId].birthtime, coordinates))
        .then((botText) => bot.sendMessage(chatId, botText))
        .catch((error) => bot.sendMessage(chatId, 'Sorry, there was an error. Please try again.'));
});
