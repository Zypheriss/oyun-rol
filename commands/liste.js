const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('Eklenen oyun-rol eşleşmelerini listeler'),
  
  async execute(interaction, client) {
    if (interaction.user.id !== client.config.ownerId) {
      return interaction.reply({
        content: '<a:zypcarp:1373337642548072458> Bu komutu sadece bot sahibi kullanabilir.',
        ephemeral: true
      });
    }
    
    const gameRoles = client.db.get(`gameRoles_${interaction.guild.id}`) || [];
    
    if (gameRoles.length === 0) {
      return interaction.reply({
        content: '<:zypheris:1373909607964999763> Henüz hiç oyun-rol eşleşmesi eklenmemiş.',
        ephemeral:  false
      });
    }
    
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Oyun-Rol Eşleşmeleri')
      .setDescription('Aşağıda eklenen tüm oyun-rol eşleşmeleri listelenmiştir:')
      .setTimestamp();
    
    gameRoles.forEach((gr, index) => {
      const role = interaction.guild.roles.cache.get(gr.roleId);
      const roleName = role ? role.name : 'Silinmiş Rol';
      
      embed.addFields({
        name: `${index + 1}. ${gr.game}`,
        value: `**Rol:** ${roleName}`
      });
    });
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('delete_game_role')
          .setLabel('Sil')
          .setStyle(ButtonStyle.Danger)
      );
    
    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  },
  
  async handleDeleteButton(interaction, client) {
    if (interaction.user.id !== client.config.ownerId) {
      return interaction.reply({
        content: '<a:zypcarp:1373337642548072458> Bu işlemi sadece bot sahibi yapabilir.',
        ephemeral: true
      });
    }
    
    const gameRoles = client.db.get(`gameRoles_${interaction.guild.id}`) || [];
    
    if (gameRoles.length === 0) {
      return interaction.update({
        content: 'Silinecek eşleşme kalmadı.',
        embeds: [],
        components: []
      });
    }
    
    const options = gameRoles.map((gr, index) => {
      const role = interaction.guild.roles.cache.get(gr.roleId);
      const roleName = role ? role.name : 'Silinmiş Rol';
      
      return {
        label: `${gr.game} > ${roleName}`,
        description: `ID: ${index}`,
        value: index.toString()
      };
    });
    
    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('delete_select')
          .setPlaceholder('Silmek istediğiniz eşleşmeyi seçin')
          .addOptions(options)
      );
    
    await interaction.update({
      content: 'Lütfen silmek istediğiniz oyun-rol eşleşmesini seçin:',
      embeds: [],
      components: [row]
    });
  },
  
  async handleSelectMenu(interaction, client) {
    if (interaction.user.id !== client.config.ownerId) {
      return interaction.reply({
        content: '<a:zypcarp:1373337642548072458> Bu işlemi sadece bot sahibi yapabilir.',
        ephemeral: true
      });
    }
    
    const selectedIndex = parseInt(interaction.values[0]);
    const gameRoles = client.db.get(`gameRoles_${interaction.guild.id}`) || [];
    
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= gameRoles.length) {
      return interaction.update({
        content: '<a:zypcarp:1373337642548072458> Geçersiz seçim.',
        components: []
      });
    }
    
    const selectedGameRole = gameRoles[selectedIndex];
    const role = interaction.guild.roles.cache.get(selectedGameRole.roleId);
    const roleName = role ? role.name : 'Silinmiş Rol';
    
    gameRoles.splice(selectedIndex, 1);
    client.db.set(`gameRoles_${interaction.guild.id}`, gameRoles);
    
    await interaction.update({
      content: `<:tikicon:1373337779248955563> "${selectedGameRole.game}" oyunu için "${roleName}" rolü eşleşmesi başarıyla silindi.`,
      embeds: [],
      components: []
    });
  }
};