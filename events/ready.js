const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
    client.user.setPresence({
      activities: [{ 
        name: 'zyphersin Çırağı',
        type: ActivityType.Watching
      }],
      status: 'dnd'
    });
    
    console.log('Bot hazır ve çalışıyor!');
  }
};