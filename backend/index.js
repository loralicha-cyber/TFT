import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
const port = 3000;

const riotAPIKey = process.env.RIOT_API_KEY;
const baseAccountURL = 'https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id';
const baseSummonerURL = 'https://europe.api.riotgames.com/tft/summoner/v1/summoners/by-puuid';
const baseLeagueURL = 'https://europe.api.riotgames.com/tft/league/v1/entries/by-summoner';

const players = [
  { gameName: 'xπto', tagLine: 'BURGO' },
  { gameName: 'chamicruzcampo', tagLine: 'EUW' },
  { gameName: 'pansit', tagLine: 'AMS' },
  { gameName: 'Deimos', tagLine: 'Uzhas' },
  { gameName: 'McLoren', tagLine: 'EUW' },
  { gameName: 'AGATHOR IS BACK', tagLine: 'EUW' },
  { gameName: 'Huevo Frito', tagLine: '6049' },
  { gameName: 'DeVr0sT', tagLine: 'EUW' }
];

app.get('/api/players', async (req, res) => {
  const results = [];

  for (const player of players) {
    try {
      const accountRes = await axios.get(\`\${baseAccountURL}/\${encodeURIComponent(player.gameName)}/\${player.tagLine}?api_key=\${riotAPIKey}\`);
      const puuid = accountRes.data.puuid;

      const summonerRes = await axios.get(\`\${baseSummonerURL}/\${puuid}?api_key=\${riotAPIKey}\`);
      const summonerId = summonerRes.data.id;

      const leagueRes = await axios.get(\`\${baseLeagueURL}/\${summonerId}?api_key=\${riotAPIKey}\`);
      const rankedData = leagueRes.data.find(entry => entry.queueType === 'RANKED_TFT');

      if (rankedData) {
        results.push({
          name: player.gameName,
          tag: player.tagLine,
          tier: rankedData.tier,
          rank: rankedData.rank,
          lp: rankedData.leaguePoints,
          wins: rankedData.wins,
          losses: rankedData.losses
        });
      }
    } catch (err) {
      console.error(\`Error con \${player.gameName}#\${player.tagLine}:\`, err.response?.data || err.message);
    }
  }

  results.sort((a, b) => {
    const tiers = ['IRON','BRONZE','SILVER','GOLD','PLATINUM','EMERALD','DIAMOND','MASTER','GRANDMASTER','CHALLENGER'];
    const tierA = tiers.indexOf(a.tier.toUpperCase());
    const tierB = tiers.indexOf(b.tier.toUpperCase());

    if (tierA !== tierB) return tierB - tierA;
    if (a.rank !== b.rank) return a.rank.charCodeAt(0) - b.rank.charCodeAt(0);
    return b.lp - a.lp;
  });

  res.json(results);
});

app.listen(port, () => {
  console.log(\`Backend corriendo en http://localhost:\${port}\`);
});
