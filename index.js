const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { readdirSync } = require('fs');
const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');
const config = require('./config.json');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});
client.commands = new Collection();
client.events = new Collection();
client.config = config;
const db = require('croxydb');
client.db = db;
commandHandler(client);
eventHandler(client);
client.login(config.token).catch(err => {
  console.error('Bot giriş hatası:', err);
  process.exit(1);
});