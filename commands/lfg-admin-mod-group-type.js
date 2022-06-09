const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-admin-mod-group-type')
		.setDescription('Admin command: modify maximum members for a group type')
		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('The ID of the group type to be modified')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('max')
				.setDescription('The new max number of members for this type')
				.setRequired(true)),
	async execute(interaction, db, client) {
		const isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
		const groupTypeID = interaction.options.getInteger('id');
		const newMemberMax = interaction.options.getInteger('max');
		if(!isAdmin) {
			await interaction.reply(`No way you just tried to run an admin command without being an admin, you naughty user you! (╬ Ò ‸ Ó)`);
			return;
		}
		const groupTypeEntry = await db.getGroupType(groupTypeID);
		if(!groupTypeEntry) {
			await interaction.reply({content: `Sorry I couldn't find that group type anywhere. ┐(￣ヘ￣;)┌`, ephemeral: true});
			return;
		}
		if(newMemberMax <= groupTypeEntry.memberMax) {
			await interaction.reply({content: `No can do! New maximum for "${groupTypeEntry.name}" must be greater than ${groupTypeEntry.memberMax}`, ephemeral: true});
			return;
		}
		try {
			await db.updateGroupTypeMemberMax(groupTypeEntry.id, newMemberMax);
			await interaction.reply({content: `Group type "${groupTypeEntry.name} now fits up to ${newMemberMax} members! Nifty!`, components: [], ephemeral: true});
		} catch(err) {
			await interaction.reply({content: `I wasn't able to modify that group type ๐·°(⋟﹏⋞)°·๐ Check the console log.`, content: [], ephemeral: true});
			console.log(err);
		}
	},
};
