module.exports = {
  name: 'presenceUpdate',
  async execute(oldPresence, newPresence, client) {
    if (newPresence.user.bot) return;
    
    const userId = newPresence.userId;
    const guild = newPresence.guild;
    const gameRoles = client.db.get(`gameRoles_${guild.id}`) || [];
    
    if (gameRoles.length === 0) return;
    
    const activities = newPresence.activities || [];
    const playingGames = activities
      .filter(activity => activity.type === 0) 
      .map(activity => activity.name.toLowerCase());
    for (const gameRole of gameRoles) {
      const roleName = gameRole.game.toLowerCase();
      const roleId = gameRole.roleId;
      const role = guild.roles.cache.get(roleId);
      if (!role) continue;
      
      const member = await guild.members.fetch(userId).catch(() => null);
      if (!member) continue;
      
      const hasRole = member.roles.cache.has(roleId);
      const isPlayingGame = playingGames.includes(roleName) || 
                           playingGames.some(game => game.includes(roleName))
      if (isPlayingGame && !hasRole) {
        await member.roles.add(roleId).catch(console.error);
        await logRoleChange(client, guild, member, role, roleName, 'verildi');
      } 
      else if (!isPlayingGame && hasRole) {
        await member.roles.remove(roleId).catch(console.error);
        await logRoleChange(client, guild, member, role, roleName, 'alındı');
      }
    }
  }
};
async function logRoleChange(client, guild, member, role, gameName, action) {
  const logChannelId = client.db.get(`logChannel_${guild.id}`);
  if (!logChannelId) return;
  
  const logChannel = guild.channels.cache.get(logChannelId);
  if (!logChannel) return;
  
  const { EmbedBuilder } = require('discord.js');
  
  const embed = new EmbedBuilder()
    .setColor(action === 'verildi' ? '#00FF00' : '#FF0000')
    .setTitle(`Rol ${action.charAt(0).toUpperCase() + action.slice(1)}`)
    .setDescription(`**${member.user.username}** kullanıcısına **${gameName}** oynadığı için **${role.name}** rolü ${action}.`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp()
    .setFooter({ text: `ID: ${member.id}` });
  
  await logChannel.send({ embeds: [embed] }).catch(console.error);
  const logs = client.db.get(`roleLogs_${guild.id}`) || [];
  logs.unshift({
    userId: member.id,
    username: member.user.username,
    game: gameName,
    role: role.name,
    action: action,
    timestamp: Date.now()
  });
  if (logs.length > 100) logs.pop();
  
  client.db.set(`roleLogs_${guild.id}`, logs);
}