const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const DiscordConfirm = require('../util/DiscordConfirm.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-admin-delete-group-member')
		.setDescription('Admin command: delete a group member')
		.addIntegerOption(option =>
			option.setName('group')
				.setDescription('The ID of the group that will be modified')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('user')
				.setDescription('The ID of the user that will be removed')
				.setRequired(true)),
	async execute(interaction, db, client) {
		const isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
		const groupID = interaction.options.getInteger('group');
		const groupEntry = await db.getGroup(groupID);
		const userID = interaction.options.getInteger('user');
		const userEntry = await db.getUser(userID);
		if(!isAdmin) {
			await interaction.reply({content: `No way you just tried to run an admin command without being an admin, you naughty user you! (╬ Ò ‸ Ó)`, ephemeral: true});
			return;
		}
		if(!groupEntry) {
			await interaction.reply({content: `Sorry I couldn't find that group anywhere. ┐(￣ヘ￣;)┌`, ephemeral: true});
			return;
		}
		if(!userEntry) {
			await interaction.reply({content: `Sorry I couldn't find that user anywhere. ┐(￣ヘ￣;)┌`, ephemeral: true});
			return;
		}
		const inGroup = await db.userIsInGroup(userEntry.id, groupEntry.id);
		if(!inGroup) {
			await interaction.reply({content: `Well the good news is... ${userEntry.username} isn't in that group! So... (─‿‿─)`, ephemeral: true});
			return;
		}
		const isOwner = await db.userIsGroupOwner(userEntry.id, groupEntry.id);
		try {
			if(isOwner) {
				const userPrompt = await DiscordConfirm(interaction, `Are you sure you want to kick "${userEntry.username}" from "${groupEntry.name}"? They're the owner, so the whole group will get deleted.`);
				if(userPrompt.confirmed) {
					const members = await db.getGroupMembers(groupEntry.id);
					for(const member of members) {
						await db.rmMember(member.id, groupEntry.id);
					}
					await db.rmGroup(groupEntry.id);
					await userPrompt.interaction.editReply({content: `The group named "${groupEntry.name}" was expunged!`, components: [], ephemeral: true});
				}
			} else {
				const userPrompt = await DiscordConfirm(interaction, `Are you sure you want to kick "${userEntry.username}" from "${groupEntry.name}"?`);
				if(userPrompt.confirmed) {
					await db.rmMember(userEntry.id, groupEntry.id);
					await userPrompt.interaction.editReply({content: `${userEntry.username} was expunged from "${groupEntry.name}"!`, components: [], ephemeral: true});
				}
			}
		} catch(err) {
			await interaction.editReply({content: `I wasn't able to delete that group ๐·°(⋟﹏⋞)°·๐ Check the console log.`, content: [], ephemeral: true});
			console.log(err);
		}
	},
};
