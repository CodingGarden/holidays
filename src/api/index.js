const express = require('express');
const axios = require('axios');

const router = express.Router();

const {
  GOOGLE_API_KEY: apiKey
} = process.env;

let byMonth;

async function getHolidays(country = 'en.usa') {
  const API_URL = `https://www.googleapis.com/calendar/v3/calendars/${country}%23holiday%40group.v.calendar.google.com/events?key=${apiKey}`;
  const { data } = await axios.get(API_URL);
  byMonth = {};
  data.items.forEach((item) => {
    const [year, month, day] = item.start.date.split('-');
    const holiday = {
      name: item.summary,
      description: item.description || '',
      start: item.start.date,
      end: item.end.date,
    };
    byMonth[+year] = byMonth[+year] || {};
    byMonth[+year][+month] = byMonth[+year][+month] || {};
    byMonth[+year][+month][+day] = byMonth[+year][+month][+day] || [];
    byMonth[+year][+month][+day].push(holiday);
  });
  return byMonth;
}

router.get('/', async (req, res, next) => {
  try {
    if (!byMonth) {
      await getHolidays();
    }
    res.json(byMonth);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
