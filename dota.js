'use strict';

const Router = require('koa-router');
const request = require('request-promise');
const heroList = require('./hero');
const router = new Router({ prefix: '/dota' });

router.get('/', async ctx => {
  let num;
  let id = ctx.query.id;
  if (id) {
    num = id.toString().length > 1 ? Math.floor(parseInt(id)/10) : parseInt(id);
  } else {
    num = 0;
  }
  console.log(num);
  let opts = {
    uri: 'https://api.opendota.com/api/players/108296670/matches?limit=15',
    json: true
  };
  let data;
  let match;
  try {
    data = await request(opts);
  } catch (e) {
    console.log(e);
  };
  let { match_id, player_slot } = data[num];
  let matchOpts = {
    uri: `https://api.opendota.com/api/matches/${match_id}`,
    json: true
  };
  try {
    match = await request(matchOpts);
  } catch (e) {

  };
  let players = match.players;
  let buddy = players.filter(player => player.player_slot === player_slot);
  let {
    assists,
    deaths,
    kills,
    hero_damage,
    building_damage,
    win,
    hero_id
  } = buddy[0];

  let sortByDamage = players.sort((a, b) => b.hero_damage - a.hero_damage);
  let damageDescMap = sortByDamage.map(a => a.hero_damage);
  let damageRank = parseInt(damageDescMap.indexOf(hero_damage)) + 1;
  console.log('damage rank ' + damageRank);


  let hero = heroList.filter(hero => hero.id === hero_id);
  let kda = (kills + assists) / deaths;
  let carry = win === 0 ? 'just fed' : kda > 2 && damageRank < 3 ? 'played well' : 'got carried';
  let winWord = win === 1 ? 'won' : 'lost';
  let damageWord = `, the ${convertToText(damageRank)} highest in the game.`

  let kdaComments = kda > 2 ? 'seems good' : 'is quite poor';
  let damageComments = damageRank > 2 ? 'His hero damage is quite low.' : ''

  console.log(hero[0].localized_name);
  const reply = `Juzer ${winWord} as ${hero[0].localized_name}` +
  ` with a K D A of ${kills} ${deaths} ${assists}.` +
  ` He has a hero damage of ${hero_damage}` +
  ` the ${convertToText(damageRank)} highest in the game.` +
  ` ${damageComments}` +
  ` His K D A ${kdaComments}.` +
  ` Looks like he ${carry}`;
  ctx.send(200, reply);
});


function convertToText(num) {
  let param;
  switch (num) {
    case 1:
      param = '';
      break;
    case 2:
      param = '2nd';
      break;
    case 3:
      param = '3rd';
      break;
    default:
      param = `${num}th`;
  }
  return param;
}
module.exports = router;
