const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const DiscordConfirm = require('../util/DiscordConfirm.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-admin-delete-group')
		.setDescription('Admin command: delete a group')
		.addIntegerOption(option =>
			option.setName('group')
				.setDescription('The ID of the group that will be deleted')
				.setRequired(true)),
	async execute(interaction, db, client) {
		const isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
		const groupID = interaction.options.getInteger('group');
		const groupEntry = await db.getGroup(groupID);
		if(!isAdmin) {
			await interaction.reply(`No way you just tried to run an admin command without being an admin, you naughty user you! (╬ Ò ‸ Ó)`);
			return;
		}
		if(!groupEntry) {
			await interaction.reply({content: `Sorry I couldn't find that group anywhere. ┐(￣ヘ￣;)┌`, ephemeral: true});
			return;
		}
		try {
			const userPrompt = await DiscordConfirm(interaction, `Are you sure you want to delete "${groupEntry.name}"?`);
			if(userPrompt.confirmed) {
				const members = await db.getGroupMembers(groupEntry.id);
				for(const member of members) {
					await db.rmMember(member.id, groupEntry.id);
				}
				await db.rmGroup(groupEntry.id);
				await userPrompt.interaction.editReply({content: `That group is gone now!`, components: [], ephemeral: true});
			}
		} catch(err) {
			await interaction.editReply({content: `I wasn't able to delete that group ๐·°(⋟﹏⋞)°·๐ Check the console log.`, content: [], ephemeral: true});
			console.log(err);
		}
	},
};
