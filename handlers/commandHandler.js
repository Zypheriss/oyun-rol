const { REST, Routes } = require('discord.js');
const { readdirSync } = require('fs');
const path = require('path');

module.exports = async (client) => {
  const commandsArray = [];
  const commandsPath = path.join(__dirname, '../commands');
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      commandsArray.push(command.data.toJSON());
      console.log(`${command.data.name} komutu yüklendi.`);
    } else {
      console.warn(`${file} dosyasında data veya execute eksik.`);
    }
  }
  const rest = new REST({ version: '10' }).setToken(client.config.token);

  try {
    console.log('Slash komutları kaydediliyor...');
    await rest.put(
      Routes.applicationCommands(client.config.clientId),
      { body: commandsArray }
    );
    
    console.log('Slash komutları başarıyla kaydedildi!');
  } catch (error) {
    console.error('Komutları kaydederken hata oluştu:', error);
  }
};