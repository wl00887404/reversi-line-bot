const { ConsoleBot } = require("bottender");
const exec = require("./event");

const bot = new ConsoleBot();

const store = {};

bot.onEvent(async (context) => {
  context._session = {
    // eslint-disable-line
    type: "room",
    group: {
      id: "wl00887404",
    },
    user: {
      id: "wl00887404",
      displayName: "振志",
    },
  };
  context.sendImage = context.sendText; // eslint-disable-line

  if (context.event.isText) {
    await exec(context, store);
  }
});

bot.createRuntime();
