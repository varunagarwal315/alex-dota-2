'use strict';

const Koa = require('koa');
const Router = require('koa-router');
const respond = require('koa-respond');
const bodyparser = require('koa-bodyparser');
const helmet = require('koa-helmet');
const dota = require('./dota');

const app = new Koa();
const router = new Router();


router.get('/', async (ctx, next) => {
  console.log('First middleware');
  await next();
});

app
  .use(bodyparser())
  .use(respond())
  .use(helmet())
  .use(router.routes())
  .use(router.allowedMethods());

app
  .use(dota.routes())
  .use(dota.allowedMethods({ throw: true }));

app.use(ctx => {
  if (ctx.request.url.indexOf('api') !== -1) {
    ctx.send(404, 'Invalid API call');

  } else {
    ctx.send(404, 'Page not found');
  };
});

app.listen(3000, () => console.log('start'));
