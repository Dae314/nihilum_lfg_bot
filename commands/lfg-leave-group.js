const { SlashCommandBuilder } = require('@discordjs/builders');
const DiscordConfirm = require('../util/DiscordConfirm.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-leave-group')
		.setDescription('Leave a group that you are in')
		.addIntegerOption(option =>
			option.setName('group')
				.setDescription('The ID of the group that you will leave')
				.setRequired(true)),
	async execute(interaction, db, client) {
		const username = interaction.member.user.tag;
		let userEntry = await db.getUserbyUsername(username);
		const groupID = interaction.options.getInteger('group');
		const groupEntry = await db.getGroup(groupID);
		const ownerEntry = await db.getUser(groupEntry.owner);
		if(!userEntry) {
			await db.addUser(username, userID);
			userEntry = await db.getUserbyUsername(username);
		}
		if(!groupEntry) {
			await interaction.reply(`Sorry I couldn't find that group anywhere. ┐(￣ヘ￣;)┌`);
			return;
		}
		const inGroup = await db.userIsInGroup(userEntry.id, groupEntry.id);
		if(!inGroup) {
			await interaction.reply(`Good news! You're not in the group you're trying to leave, so I don't have to do anything! ╰(▔∀▔)╯`);
			return;
		}
		const isOwner = await db.userIsGroupOwner(userEntry.id, groupEntry.id);
		try {
			if(isOwner) {
				await DiscordConfirm(interaction,
					`Are you sure you want to leave "${groupEntry.name}"? Since you're the group owner, the whole group will be disbanded.`,
					async (buttonInteraction) => {
						const members = await db.getGroupMembers(groupEntry.id);
						for(const member of members) {
							await db.rmMember(member.id, groupEntry.id);
						}
						await db.rmGroup(groupEntry.id);
						await buttonInteraction.update({ content: 'Your group was successfully closed!', components: [], ephemeral: true });
					}
				);
			} else {
				await DiscordConfirm(interaction,
					`Are you sure you want to leave "${groupEntry.name}"?`,
					async (buttonInteraction) => {
						await db.rmMember(userEntry.id, groupEntry.id);
						await buttonInteraction.update({ content: 'You have left the group!', components: [], ephemeral: true });
					}
				);
			}
		} catch(err) {
			await interaction.reply(`Something went wrong leaving the group ๐·°(⋟﹏⋞)°·๐ Please report this to your admins. ;-;`);
			console.log(err);
		}
	},
};
