const bots = require("./config/robots.json").bots;

const GenericBot = require("./bot/genericBot")

for (let i = 0; i < bots.length; i++) {
  startBot(bots[i]);
}

async function startBot(botConfig) {
  let bot = new GenericBot(botConfig);
  if (botConfig.respondToMentions) {
    console.log("starting inboxLoop for bot " + botConfig.name);
    bot.inboxLoop();
  }
  
  bot.startBot();
}
