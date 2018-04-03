const express = require('express');
const { LineBot } = require('bottender');
const { createServer } = require('bottender/express');

const exec = require('./event');

const store = {};

const { accessToken, channelSecret, PORT: port = 5000 } = process.env;

const bot = new LineBot({
  accessToken,
  channelSecret,
});


bot.onEvent(async (context) => {
  if (context.event.isText) {
    await exec(context, store);
  }
});

const server = createServer(bot);

server.use(express.static('./static'))
  .listen(port, () => {
    console.log(`server is running on ${port} port...`);
  });
