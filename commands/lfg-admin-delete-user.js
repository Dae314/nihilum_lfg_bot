const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const DiscordConfirm = require('../util/DiscordConfirm.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-admin-delete-user')
		.setDescription('Admin command: delete a user as well as all of their associated groups and memberships')
		.addIntegerOption(option =>
			option.setName('user')
				.setDescription('The ID of the user who will be deleted')
				.setRequired(true)),
	async execute(interaction, db, client) {
		const isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
		const userID = interaction.options.getInteger('user');
		const userEntry = await db.getUser(userID);
		if(!isAdmin) {
			await interaction.reply({content: `No way you just tried to run an admin command without being an admin, you naughty user you! (╬ Ò ‸ Ó)`, ephemeral: true});
			return;
		}
		if(!userEntry) {
			await interaction.reply({content: `Sorry I couldn't find that user anywhere. ┐(￣ヘ￣;)┌`, ephemeral: true});
			return;
		}
		try {
			const userPrompt = await DiscordConfirm(interaction, `Are you sure you want to delete "${userEntry.username}"? All of their groups and memberships will also be deleted.`);
			if(userPrompt.confirmed) {
				const ownedGroups = await db.getUserOwnedGroups(userEntry.id);
				// first delete all groups that the user owns
				for(const group of ownedGroups) {
					const members = await db.getGroupMembers(group.id);
					for(const member of members) {
						await db.rmMember(member.id, group.id);
					}
					await db.rmGroup(group.id);
				}
				// then terminate all remaining memberships
				const memberGroups = await db.getUserGroupMembership(userEntry.id);
				for(const group of memberGroups) {
					await db.rmMember(userEntry.id, group.id);
				}
				// finally, delete the user
				await db.rmUser(userEntry.id);
				
				await userPrompt.interaction.editReply({content: `That user is gone now!`, components: [], ephemeral: true});
			}
		} catch(err) {
			await interaction.editReply({content: `I wasn't able to delete that user ๐·°(⋟﹏⋞)°·๐ Check the console log.`, content: [], ephemeral: true});
			console.log(err);
		}
	},
};
