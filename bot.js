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

    // Calculate the birthchart
    const birthchart = swisseph.swe_houses(jd, coordinates.latitude, coordinates.longitude, 'P');

    // convert the birthchart to a readable format
    const readableBirthchart = {
        house: birthchart.house.map((house, index) => {
            // convert the house degree from string to int16
            const houseDegree = parseInt(house);
            return `House ${index + 1}: ${houseDegree}\n`;
        }),
        ascendant: birthchart.ascendant,
        mc: birthchart.mc,
        armc: birthchart.armc,
        vertex: birthchart.vertex,
        equatorialAscendant: birthchart.equatorialAscendant,
        kochCoAscendant: birthchart.kochCoAscendant,
        munkaseyCoAscendant: birthchart.munkaseyCoAscendant,
        munkaseyPolarAscendant: birthchart.munkaseyPolarAscendant
    };

    // get planet positions

    const botText = `${readableBirthchart.house}\n\nAscendant:\n${readableBirthchart.ascendant}\n\nMC:\n${readableBirthchart.mc}\n\nARMC:\n${readableBirthchart.armc}\n\nVertex:\n${readableBirthchart.vertex}\n\nEquatorial Ascendant:\n${readableBirthchart.equatorialAscendant}\n\nKoch Co-Ascendant:\n${readableBirthchart.kochCoAscendant}\n\nMunkasey Co-Ascendant:\n${readableBirthchart.munkaseyCoAscendant}\n\nMunkasey Polar Ascendant:\n${readableBirthchart.munkaseyPolarAscendant}`;
    console.log("got astrodata")

    return botText;
}


//Telegram Bot Actions
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    console.log(msg.text);

    if (!users[chatId]) {
        users[chatId] = {};
        bot.sendMessage(chatId, 'Please enter your birthdate (YYYY-MM-DD):');
    } else if (!users[chatId].birthdate) {
        users[chatId].birthdate = msg.text;
        bot.sendMessage(chatId, 'Please enter your birthtime (HH:MM):');
    } else if (!users[chatId].birthtime) {
        users[chatId].birthtime = msg.text;
        bot.sendMessage(chatId, 'Please enter your Zipcode:');
    } else if (!users[chatId].zipcode) {
        users[chatId].zipcode = msg.text;
        bot.sendMessage(chatId, 'Please enter your ContryCode:');
    } else if (!users[chatId].countrycode) {
        users[chatId].countrycode = msg.text;


        try {
            // Get the coordinates of the birthcity
            const coordinates = await getCoordinates(chatId);

            // Get the astrology reading
            const birthchart = await getAstroData(users[chatId].birthdate, users[chatId].birthtime, coordinates);

            // Send the birthchart to the user
            bot.sendMessage(chatId, birthchart);
        } catch (error) {
            console.error("error");
            // Handle the error here or send an error message to the user
        }

    }
})

bot.on(msg => msg.text === '/birthchart', async (msg) => {
    users[chatId].countrycode = msg.text;

    try {
        // Get the coordinates of the birthcity
        const coordinates = await getCoordinates(chatId);

        // Get the astrology reading
        const birthchart = await getAstroData(users[chatId].birthdate, users[chatId].birthtime, coordinates);

        // Send the birthchart to the user
        bot.sendMessage(chatId, birthchart);
    } catch (error) {
        console.error("error");
        // Handle the error here or send an error message to the user
    }

});
