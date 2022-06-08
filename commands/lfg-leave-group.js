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
				const userPrompt = await DiscordConfirm(interaction, `Are you sure you want to leave "${groupEntry.name}"? Since you're the group owner, the whole group will be disbanded.`);
				if(userPrompt.confirmed) {
					const members = await db.getGroupMembers(groupEntry.id);
					for(const member of members) {
						await db.rmMember(member.id, groupEntry.id);
					}
					await db.rmGroup(groupEntry.id);
					await userPrompt.interaction.editReply({ content: 'Your group was successfully closed!', components: [], ephemeral: true });
				}
			} else {
				const userPrompt = await DiscordConfirm(interaction, `Are you sure you want to leave "${groupEntry.name}"?`);
				if(userPrompt.confirmed) {
					await db.rmMember(userEntry.id, groupEntry.id);
					await userPrompt.interaction.editReply({ content: 'You have left the group!', components: [], ephemeral: true });
				}
			}
		} catch(err) {
			await interaction.editReply({content: `Something went wrong leaving the group ๐·°(⋟﹏⋞)°·๐ Please report this to your admins. ;-;`, components: [], ephemeral: true});
			console.log(err);
		}
	},
};
