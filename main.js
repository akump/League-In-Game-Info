require('dotenv').config();
const fetch = require('node-fetch');
const AsciiTable = require('ascii-table');

const NA_URL = 'https://na1.api.riotgames.com';
const apiKey = process.env.API_KEY;

const SUMMONER_BY_NAME_URL = `${NA_URL}/lol/summoner/v4/summoners/by-name/`;
const ACITVE_GAME_BY_SUMMONER_URL = `${NA_URL}/lol/spectator/v4/active-games/by-summoner/`;
const RANK_INFO_URL = `${NA_URL}/lol/league/v4/entries/by-summoner/`;

const executeFetch = async function (api, input = '') {
    let res = await fetch(`${api}${encodeURIComponent(input)}`, {
        headers: {
            'X-Riot-Token': apiKey
        }
    });
    let json = await res.json();
    return json;
};

const getSummonerByName = async function (summonerName) {
    let ret = await executeFetch(SUMMONER_BY_NAME_URL, summonerName);
    return ret;
};

const getActiveGames = async function (summonerObj) {
    let ret = await executeFetch(ACITVE_GAME_BY_SUMMONER_URL, summonerObj.id);
    return ret;
};

const getRankInfo = async function (summonerObj) {
    let ret = await executeFetch(RANK_INFO_URL, summonerObj.id);
    return ret;
};


const getInGameInfo = async function (summonerName) {
    let userSummoner = await getSummonerByName(summonerName);

    try {
        let activeGame = await getActiveGames(userSummoner);

        let allSummoners = await Promise.all(activeGame.participants.map(summoner => getSummonerByName(summoner.summonerName)));

        /* 
        * Riot Game's API only allows 20 request every second. In order to get all the info required, we need more than 20 requests. 
        * So we shall wait one second and then continue. 
        */
        setTimeout( async () => {
            let allSummonersRanks = await Promise.all(allSummoners.map(summoner => getRankInfo(summoner)));

            let soloqInfo = allSummonersRanks.map(rankQueues => {
                for (queue of rankQueues) {
                    if (queue.queueType === 'RANKED_SOLO_5x5') {
                        return {
                            summonerName: queue.summonerName,
                            rank: `${queue.tier} ${queue.rank} ${queue.leaguePoints} lp`
                        }
                    }
                }
            })
    
            let table = new AsciiTable(`${userSummoner.name}'s Live Game`);
            table.setHeading('Blue Team', '', '', 'Red Team');
    
            for (let i = 0; i < 5; i++) {
                let summonerBlue = soloqInfo[i];
                let summonerRed = soloqInfo[i + 5];
                table.addRow(summonerBlue.summonerName, summonerBlue.rank, '    ', summonerRed.summonerName, summonerRed.rank);
            }
    
            console.log(table.toString());
          }, 1000);
          
    } catch (e) {
        console.log(`Error: ${e}`);
    }

};

getInGameInfo('BUZZLIGHTYEAR99');