module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.user.id !== client.config.ownerId) {
      return interaction.reply({
        content: '<a:zypcarp:1373337642548072458> Bu komutu sadece bot sahibi kullanabilir.',
        ephemeral: true
      });
    }
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`${interaction.commandName} komutu bulunamadı.`);
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`${interaction.commandName} komutunu çalıştırırken hata:`, error);
        
        const replyOptions = {
          content: 'Bu komut çalıştırılırken bir hata oluştu!',
          ephemeral: true
        };
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(replyOptions);
        } else {
          await interaction.reply(replyOptions);
        }
      }
    } 
    else if (interaction.isButton()) {
      if (interaction.customId === 'delete_game_role') {
        const listCommand = client.commands.get('list');
        if (listCommand && listCommand.handleDeleteButton) {
          await listCommand.handleDeleteButton(interaction, client);
        }
      }
    }
    else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'delete_select') {
        const listCommand = client.commands.get('list');
        if (listCommand && listCommand.handleSelectMenu) {
          await listCommand.handleSelectMenu(interaction, client);
        }
      }
    }
  }
};