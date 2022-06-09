const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const DiscordConfirm = require('../util/DiscordConfirm.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-admin-delete-group-type')
		.setDescription('Admin command: delete a group type and all associated groups')
		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('The group type ID')
				.setRequired(true)),
	async execute(interaction, db, client) {
		const isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
		const groupTypeID = interaction.options.getInteger('id');
		if(!isAdmin) {
			await interaction.reply(`No way you just tried to run an admin command without being an admin, you naughty user you! (╬ Ò ‸ Ó)`);
			return;
		}
		const groupTypeEntry = await db.getGroupType(groupTypeID);
		if(!groupTypeEntry) {
			await interaction.reply({content: `Sorry I couldn't find that group type anywhere. ┐(￣ヘ￣;)┌`, ephemeral: true});
			return;
		}
		try {
			const userPrompt = await DiscordConfirm(interaction, `Are you sure you want to delete "${groupTypeEntry.name}" and all associated groups?`);
			if(userPrompt.confirmed) {
				const groups = await db.getAllGroupsbyType(groupTypeEntry.id);
				// delete all groups of that type
				for(const group of groups) {
					const members = await db.getGroupMembers(group.id);
					for(const member of members) {
						await db.rmMember(member.id, group.id);
					}
					await db.rmGroup(group.id);
				}
				await db.rmGroupType(groupTypeEntry.id);
				await userPrompt.interaction.editReply({content: `I deleted the group type named "${groupTypeEntry.name}" Hope you don't regret that.`, components: [], ephemeral: true});
			}
		} catch(err) {
			await interaction.editReply({content: `I wasn't able to delete that group type ๐·°(⋟﹏⋞)°·๐ Check the console log.`, content: [], ephemeral: true});
			console.log(err);
		}
	},
};
