require('dotenv').config()
const fetch = require('node-fetch');

const NA_URL = 'https://na1.api.riotgames.com';

const SUMMONER_BY_NAME_URL = `${NA_URL}/lol/summoner/v4/summoners/by-name/`;
const ACITVE_GAME_BY_SUMMONER_URL = `${NA_URL}/lol/spectator/v4/active-games/by-summoner/`
const RANK_INFO_URL = `${NA_URL}/lol/league/v4/entries/by-summoner/`;

const apiKey = process.env.API_KEY;

const getSummonerByName = async function (summonerName) {
    let res = await fetch(`${SUMMONER_BY_NAME_URL}${encodeURIComponent(summonerName)}`, {
        headers: {
            'X-Riot-Token': apiKey
        }
    });
    let json = await res.json();
    return json;
};

const getActiveGames = async function (summonerObj) {
    let res = await fetch(`${ACITVE_GAME_BY_SUMMONER_URL}${encodeURIComponent(summonerObj.id)}`, {
        headers: {
            'X-Riot-Token': apiKey
        }
    });
    let json = await res.json();
    return json;
};

const getRankInfo = async function (summonerObj) {
    let res = await fetch(`${RANK_INFO_URL}${encodeURIComponent(summonerObj.id)}`, {
        headers: {
            'X-Riot-Token': apiKey
        }
    });
    let json = await res.json();
    return json;
};

const getInGameInfo = async function (summonerName) {
    let userSummoner = await getSummonerByName(summonerName);

    try {
        let allPlayers = await getActiveGames(userSummoner);
        for (let summoner of allPlayers.participants) {
            let account = await getSummonerByName(summoner.summonerName);
            let [leagueRank] = await getRankInfo(account);
            console.log(`${leagueRank.summonerName}: ${leagueRank.tier} ${leagueRank.rank} ${leagueRank.leaguePoints} lp`);
        }
    } catch {
        console.log('Not in game');
    }

};

getInGameInfo('Enemy slicer');