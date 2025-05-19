const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('log')
    .setDescription('Rol değişikliklerinin loglarını gösterir')
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Log mesajlarının gönderileceği kanal')
        .setRequired(false)),
  
  async execute(interaction, client) {
    if (interaction.user.id !== client.config.ownerId) {
      return interaction.reply({
        content: '<a:zypcarp:1373337642548072458> Bu komutu sadece bot sahibi kullanabilir.',
        ephemeral: true
      });
    }
    
    const logChannel = interaction.options.getChannel('kanal');
    
    if (logChannel) {
      if (!logChannel.isTextBased()) {
        return interaction.reply({
          content: '<a:zypcarp:1373337642548072458> Log kanalı bir metin kanalı olmalıdır.',
          ephemeral: true
        });
      }
      
      client.db.set(`logChannel_${interaction.guild.id}`, logChannel.id);
      
      await interaction.reply({
        content: `<:tikicon:1373337779248955563> Log kanalı ${logChannel} olarak ayarlandı.`,
        ephemeral: false
      });
      return;
    }
    
    const logs = client.db.get(`roleLogs_${interaction.guild.id}`) || [];
    
    if (logs.length === 0) {
      return interaction.reply({
        content: 'Henüz hiç log kaydı bulunmuyor.',
        ephemeral: true
      });
    }
    
    const recentLogs = logs.slice(0, 10);
    
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Rol Değişikliği Logları')
      .setDescription('Son rol değişiklikleri aşağıda listelenmiştir:')
      .setTimestamp();
    
    recentLogs.forEach((log, index) => {
      const timeAgo = timeSince(log.timestamp);
      embed.addFields({
        name: `${index + 1}. ${log.username}`,
        value: `**Oyun:** ${log.game}\n**Rol:** ${log.role}\n**İşlem:** Rol ${log.action}\n**Zaman:** ${timeAgo} önce`
      });
    });
    
    await interaction.reply({ embeds: [embed] });
  }
};

function timeSince(date) {
  const seconds = Math.floor((Date.now() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} yıl`;
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} ay`;
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} gün`;
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} saat`;
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} dakika`;
  
  return `${Math.floor(seconds)} saniye`;
}