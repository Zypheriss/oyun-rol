const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ekle')
    .setDescription('Oyun ve rol eşleştirmesi ekler')
    .addStringOption(option =>
      option.setName('oyun')
        .setDescription('Takip edilecek oyun adı')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('rol')
        .setDescription('Oyun oynayanlara verilecek rol')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  
  async execute(interaction, client) {
    if (interaction.user.id !== client.config.ownerId) {
      return interaction.reply({
        content: '<a:zypcarp:1373337642548072458> Bu komutu sadece bot sahibi kullanabilir.',
        ephemeral: true
      });
    }
    
    const game = interaction.options.getString('oyun');
    const role = interaction.options.getRole('rol');
    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({
        content: '<a:zypcarp:1373337642548072458> Seçilen rol, botun rolünden daha yüksek bir pozisyonda. Bot bu rolü veremez.',
        ephemeral: false
      });
    }
    const gameRoles = client.db.get(`gameRoles_${interaction.guild.id}`) || [];
    if (gameRoles.some(gr => gr.game.toLowerCase() === game.toLowerCase())) {
      return interaction.reply({
        content: `<a:zypcarp:1373337642548072458> "${game}" oyunu zaten listeye eklenmiş.`,
        ephemeral: false
      });
    }
    gameRoles.push({
      game: game,
      roleId: role.id
    });
    
    client.db.set(`gameRoles_${interaction.guild.id}`, gameRoles);
    
    await interaction.reply({
      content: `<:tikicon:1373337779248955563> "${game}" oyunu için "${role.name}" rolü başarıyla eklendi.`,
      ephemeral: false
    });
  }
};