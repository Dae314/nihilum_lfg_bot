const { SlashCommandBuilder } = require('@discordjs/builders');
const DiscordConfirm = require('../util/DiscordConfirm.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-kick-from-group-filler')
		.setDescription('Kick a filler (non-server member) from your group (can only be run by group owner)')
		.addIntegerOption(option =>
			option.setName('group')
				.setDescription('The ID of the group that will be modified')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('user')
				.setDescription('The username of the filler who will be kicked')
				.setRequired(true)),
	async execute(interaction, db, client) {
		const ownerName = interaction.member.user.tag;
		const ownerID = interaction.member.user.id;
		let ownerEntry = await db.getUserbyUsername(ownerName);
		const groupID = interaction.options.getInteger('group');
		const groupEntry = await db.getGroup(groupID);
		const targetUsername = interaction.options.getString('user').toLowerCase();
		let targetUserEntry = await db.getUserbyUsername(targetUsername);
		if(!ownerEntry) {
			await db.addUser(ownerName, ownerID);
			ownerEntry = await db.getUserbyUsername(ownerName);
		}
		if(!groupEntry) {
			await interaction.reply({content: `Sorry I couldn't find that group anywhere. ┐(￣ヘ￣;)┌`, ephemeral: true});
			return;
		}
		if(!targetUserEntry) {
			await db.addUser(targetUsername, 'filler');
			targetUserEntry = await db.getUserbyUsername(targetUsername);
		}
		const isOwner = await db.userIsGroupOwner(ownerEntry.id, groupEntry.id);
		if(!isOwner) {
			await interaction.reply({content: `You can't kick someone from a group you didn't make! ☆⌒(> _ <)`, ephemeral: true});
			return;
		}
		const inGroup = await db.userIsInGroup(targetUserEntry.id, groupEntry.id);
		if(!inGroup) {
			await interaction.reply({content: `Well the good news is... ${targetUserEntry.username} isn't in your group! So... (─‿‿─)`, ephemeral: true});
			return;
		}
		try {
			const userPrompt = await DiscordConfirm(interaction, `Are you sure you want to kick "${targetUserEntry.username}" from "${groupEntry.name}"?`);
			if(userPrompt.confirmed) {
				await db.rmMember(targetUserEntry.id, groupEntry.id);
				await interaction.editReply({content: `Bye ${targetUserEntry.username}!`, components: [], ephemeral: true});
			}
		} catch(err) {
			await interaction.reply({content: `Something went wrong when I tried to kick that user from your group ๐·°(⋟﹏⋞)°·๐ Please report this to your admins. ;-;`, ephemeral: true});
			console.log(err);
		}
	},
};
