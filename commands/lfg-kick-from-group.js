const { SlashCommandBuilder } = require('@discordjs/builders');
const DiscordConfirm = require('../util/DiscordConfirm.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-kick-from-group')
		.setDescription('Kick a user from your group (can only be run by group owner)')
		.addIntegerOption(option =>
			option.setName('group')
				.setDescription('The ID of the group that will be modified')
				.setRequired(true))
		.addUserOption(option =>
			option.setName('user')
				.setDescription('The user who will be kicked from the group')
				.setRequired(true)),
	async execute(interaction, db, client) {
		const ownerName = interaction.member.user.tag;
		const ownerID = interaction.member.user.id;
		let ownerEntry = await db.getUserbyUsername(ownerName);
		const groupID = interaction.options.getInteger('group');
		const groupEntry = await db.getGroup(groupID);
		const targetUserObj = interaction.options.getUser('user');
		let targetUserEntry = await db.getUserbyUsername(targetUserObj.tag);
		if(!ownerEntry) {
			await db.addUser(ownerName, ownerID);
			ownerEntry = await db.getUserbyUsername(ownerName);
		}
		if(!groupEntry) {
			await interaction.reply(`Sorry I couldn't find that group anywhere. ┐(￣ヘ￣;)┌`);
			return;
		}
		if(!targetUserEntry) {
			await db.addUser(targetUserObj.tag, targetUserObj.id);
			targetUserEntry = await db.getUserbyUsername(targetUserObj.tag);
		}
		const isOwner = await db.userIsGroupOwner(ownerEntry.id, groupEntry.id);
		if(!isOwner) {
			await interaction.reply(`You can't kick someone from a group you didn't make! ☆⌒(> _ <)`);
			return;
		}
		const targetIsOwner = await db.userIsGroupOwner(targetUserEntry.id, groupEntry.id);
		if(targetIsOwner) {
			await interaction.reply(`Woah woah hold up. You can't kick the group owner. YOU ARE THE GROUP OWNER! If you really want to leave, just use \`/lfg-leave-group group:${groupEntry.id}\``);
			return;
		}
		const inGroup = await db.userIsInGroup(targetUserEntry.id, groupEntry.id);
		if(!inGroup) {
			await interaction.reply(`Well the good news is... ${targetUserEntry.username} isn't in your group! So... (─‿‿─)`);
			return;
		}
		try {
			const userPrompt = await DiscordConfirm(interaction, `Are you sure you want to kick "${targetUserEntry.username}" from "${groupEntry.name}"?`);
			if(userPrompt.confirmed) {
				await db.rmMember(targetUserEntry.id, groupEntry.id);
				await interaction.editReply({content: `Bye ${targetUserEntry.username}!`, components: [], ephemeral: false});
			}
		} catch(err) {
			await interaction.reply(`Something went wrong when I tried to kick that user from your group ๐·°(⋟﹏⋞)°·๐ Please report this to your admins. ;-;`);
			console.log(err);
		}
	},
};
