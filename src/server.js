const bots = require("./config/robots.json").bots;

const GenericBot = require("./bot/genericBot")

for (let i = 0; i < bots.length; i++) {
  startBot(bots[i]);
}

async function startBot(botConfig) {
  let bot = new GenericBot(botConfig);
  if (botConfig.respondToMentions) {
    bot.inboxLoop();
  }
  
  bot.startBot();
}
