const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-add-to-group-filler')
		.setDescription('Add a filler (non-server member) to your group (can only be run by group owner)')
		.addIntegerOption(option =>
			option.setName('group')
				.setDescription('The ID of the group that will be modified')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('user')
				.setDescription('The username to add to the group')
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
			await interaction.reply(`Sorry I couldn't find that group anywhere. ┐(￣ヘ￣;)┌`);
			return;
		}
		if(!targetUserEntry) {
			await db.addUser(targetUsername, 'filler');
			targetUserEntry = await db.getUserbyUsername(targetUsername);
		}
		const isOwner = await db.userIsGroupOwner(ownerEntry.id, groupEntry.id);
		if(!isOwner) {
			await interaction.reply(`You can't add someone to a group you didn't make! ☆⌒(> _ <)`);
			return;
		}
		const isFull = await db.groupIsFull(groupEntry.id);
		if(isFull) {
			await interaction.reply(`Sorry, there's no more space in this group! (｡•́︿•̀｡)`);
			return;
		}
		const inGroup = await db.userIsInGroup(targetUserEntry.id, groupEntry.id);
		if(inGroup) {
			await interaction.reply(`You can't add someone to the same group twice! Unless they're a clone... (O_O;)`);
			return;
		}
		try {
			await db.addMember(targetUserEntry.id, groupEntry.id);
			await interaction.reply(`Bam! ${targetUserEntry.username} is now in "${groupEntry.name}"!`);
		} catch(err) {
			await interaction.reply(`Something went wrong when I tried to add that user to your group ๐·°(⋟﹏⋞)°·๐ Please report this to your admins. ;-;`);
			console.log(err);
		}
	},
};
