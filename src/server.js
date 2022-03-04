// set development if node_env => undefined
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const GenericBot = require("./bot/genericBot")

const bots = require("./config/robots.json").bots;

bots.forEach(startBot);

async function startBot(botConfig) {
  let bot = new GenericBot(botConfig);
  if (botConfig.respondToMentions) {
    bot.inboxLoop();
  }
  
  bot.startBot();
}
