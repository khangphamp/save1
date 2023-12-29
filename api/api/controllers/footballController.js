const axios = require('axios');
const RedisClient = require('../../utilities/redisClient');
const { isEmpty } = require('../../utilities/isEmpty');

const footballApiUrl = process.env.FOOTBALL_API_URL;
const footballApiKey = process.env.FOOTBALL_API_KEY;
const footballInstance = axios.create({
  baseURL: footballApiUrl,
  headers: {
    'X-RapidAPI-Key': footballApiKey,
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
  }
});

async function getFixtures(req, res) {
  try {
    const { date, live, from, to, status, round, league } = req.query;
    let key = 'fixture';
    if (date) {
      key += `-date-${date?.toString()}`;
    }
    if (live) {
      key += `-live-${live}`;
    }
    if (from) {
      key += `-from-${from}`;
    }
    if (to) {
      key += `-to-${to}`;
    }
    if (status) {
      key += `-status-${status}`;
    }
    if (league) {
      key += `-league-${league}`;
    }
    if (round) {
      key += `-round-${round}`;
    }
    const resValue = await RedisClient.get(key);
    if (resValue) {
      return res.json(JSON.parse(resValue));
    }
    const response = await footballInstance.get('/fixtures', {
      params: { ...req.query },
    });
    if (isEmpty(response.data.errors))
      await RedisClient.set(key, JSON.stringify(response.data), {
        EX: 15,
        NX: true,
      });

    return res.json(response.data);
  } catch (error) {
    return res.json(error);
  }
}

async function getFixtureRounds(req, res) {
  try {
    const { league, season, current } = req.query;
    let key = 'fixture';
    if (league) {
      key += `-league-${league?.toString()}`;
    }
    if (season) {
      key += `-season-${season}`;
    }
    if (current) {
      key += `-current-${current}`;
    }

    const resValue = await RedisClient.get(key);
    if (resValue) {
      return res.json(JSON.parse(resValue));
    }
    const response = await footballInstance.get('/fixtures/rounds', {
      params: { ...req.query },
    });
    if (isEmpty(response?.data?.errors))
      await RedisClient.set(key, JSON.stringify(response.data), {
        EX: 86400,
        NX: true,
      });
    return res.json(response.data);
  } catch (error) {
    return res.json(error);
  }
}

async function getLeagues(req, res) {
  try {
    const rand = Math.random();
    const { season, id, country, type, last } = req.query;
    let key = 'leagues';
    if (id) {
      key += '-' + id;
    }
    if (season) {
      key += '-' + season;
    }
    if (country) {
      key += '-' + country;
    }
    if (type) {
      key += '-' + type;
    }
    if (last) {
      key += '-' + last;
    }
    const resValue = await RedisClient.get(key);

    if (resValue) {
      return res.json(JSON.parse(resValue));
    }
    const response = await footballInstance.get('/leagues', {
      params: req.query,
    });
    if (isEmpty(response?.data?.errors))
      await RedisClient.set(key, JSON.stringify(response.data), {
        EX: 3600,
        NX: true,
      });
    return res.json(response.data);
  } catch (error) {
    return res.json(error);
  }
}

async function getStandings(req, res) {
  try {
    const rand = Math.random();

    const { season, league, team } = req.query;
    let key = 'standings';
    if (league) {
      key += '-' + league;
    }
    if (season) {
      key += '-' + season;
    }
    if (team) {
      key += '-' + team;
    }
    const resValue = await RedisClient.get(key);

    if (resValue) {
      return res.json(JSON.parse(resValue));
    }
    const response = await footballInstance.get('/standings', {
      params: req.query,
    });
    if (response.data.errors.length0) {
    }
    if (isEmpty(response?.data?.errors))
      await RedisClient.set(key, JSON.stringify(response.data), {
        EX: 3600,
        NX: true,
      });

    return res.json(response.data);
  } catch (error) {
    return res.json(error);
  }
}

async function getOddsPrePlay(req, res) {
  try {
    const { season, league, date, page, bookmaker, bet, fixture } = req.query;
    let key = 'odds-pre';
    if (league) {
      key += '-' + league;
    }
    if (season) {
      key += '-' + season;
    }
    if (fixture) {
      key += '-' + fixture;
    }
    if (date) {
      key += '-' + date;
    }
    if (bookmaker) {
      key += '-' + bookmaker;
    }
    if (bet) {
      key += '-' + bet;
    }
    if (page) {
      key += '-' + page;
    }

    const resValue = await RedisClient.get(key);
    if (resValue) {
      return res.json(JSON.parse(resValue));
    }
    const response = await footballInstance.get('/odds', {
      params: req.query,
    });
    if (isEmpty(response?.data?.errors))
      await RedisClient.set(key, JSON.stringify(response.data), {
        EX: 10000,
        NX: true,
      });
    return res.json(response.data);
  } catch (error) {
    return res.json(error);
  }
}
async function getOddsBets(req, res) {
  try {
    const { id } = req.query;
    let key = 'odds-bets';
    if (id) {
      key += '-' + id;
    }
    const resValue = await RedisClient.get(key);
    if (resValue) {
      return res.json(JSON.parse(resValue));
    }
    const response = await footballInstance.get('/odds/bets', {
      params: req.query,
    });
    if (isEmpty(response?.data?.errors))
      await RedisClient.set(key, JSON.stringify(response.data), {
        EX: 86400,
        NX: true,
      });
    return res.json(response.data);
  } catch (error) {
    return res.json(error);
  }
}
async function getOddsBookmakers(req, res) {
  try {
    const { id } = req.query;
    let key = 'odds-bookmakers';
    if (id) {
      key += '-' + id;
    }
    const resValue = await RedisClient.get(key);
    if (resValue) {
      return res.json(JSON.parse(resValue));
    }
    const response = await footballInstance.get('/odds/bookmakers', {
      params: req.query,
    });
    if (isEmpty(response?.data?.errors))
      await RedisClient.set(key, JSON.stringify(response.data), {
        EX: 86400,
        NX: true,
      });
    return res.json(response.data);
  } catch (error) {
    return res.json(error);
  }
}

async function getOddsLive(req, res) {
  try {
    const { bet } = req.query;
    let key = 'odds-live';
    if (bet) {
      key += '-' + bet;
    }
    const resValue = await RedisClient.get(key);
    if (resValue) {
      return res.json(JSON.parse(resValue));
    }
    const response = await footballInstance.get('/odds/live', {
      params: req.query,
    });
    if (isEmpty(response?.data?.errors))
      await RedisClient.set(key, JSON.stringify(response.data), {
        EX: 5,
        NX: true,
      });
    return res.json(response.data);
  } catch (error) {
    return res.json(error);
  }
}

async function getOddsLiveBets(req, res) {
  try {
    const { id } = req.query;
    let key = 'odds-live-bets';
    if (id) {
      key += '-' + id;
    }
    const resValue = await RedisClient.get(key);
    if (resValue) {
      return res.json(JSON.parse(resValue));
    }
    const response = await footballInstance.get('/odds/live/bets', {
      params: req.query,
    });
    if (isEmpty(response?.data?.errors))
      await RedisClient.set(key, JSON.stringify(response.data), {
        EX: 60,
        NX: true,
      });
    return res.json(response.data);
  } catch (error) {
    return res.json(error);
  }
}

async function getTopScorers(req, res) {
  try {
    const { league, season } = req.query;
    let key = 'topscorers';
    if (league) {
      key += '-' + league;
    }
    if (season) {
      key += '-' + season;
    }
    const resValue = await RedisClient.get(key);
    if (resValue) {
      return res.json(JSON.parse(resValue));
    }
    const response = await footballInstance.get('/players/topscorers', {
      params: req.query,
    });
    if (isEmpty(response?.data?.errors))
      await RedisClient.set(key, JSON.stringify(response.data), {
        EX: 84000,
        NX: true,
      });
    return res.json(response.data);
  } catch (error) {
    return res.json(error);
  }
}

module.exports = {
  getFixtures,
  getLeagues,
  getStandings,
  getOddsPrePlay,
  getOddsBets,
  getOddsBookmakers,
  getOddsLive,
  getOddsLiveBets,
  getTopScorers,
  getFixtureRounds,
};
