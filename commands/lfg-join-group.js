const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-join-group')
		.setDescription('Request the group owner to admit you into a group')
		.addIntegerOption(option =>
			option.setName('group')
				.setDescription('The ID of the group that will be modified')
				.setRequired(true)),
	async execute(interaction, db, client) {
		const username = interaction.member.user.tag;
		const userID = interaction.member.user.id;
		let userEntry = await db.getUserbyUsername(username);
		const groupID = interaction.options.getInteger('group');
		const groupEntry = await db.getGroup(groupID);
		const ownerEntry = await db.getUser(groupEntry.owner);
		let ownerDiscordObj;
		try {
			ownerDiscordObj = await client.users.fetch(ownerEntry.discordID);
		} catch(err) {
			if(err.httpStatus === 404) {
				await interaction.reply(`Hmm... I couldn't find ${ownerEntry.username}, try messaging them directly.`);
				return;
			} else {
				await interaction.reply(`Something went wrong when I tried to look up ${ownerEntry.username} ๐·°(⋟﹏⋞)°·๐ Please report this to your admins. ;-;`);
				console.log(err);
			}
		}
		if(!userEntry) {
			await db.addUser(username, userID);
			userEntry = await db.getUserbyUsername(username);
		}
		if(!groupEntry) {
			await interaction.reply(`Sorry I couldn't find that group anywhere. ┐(￣ヘ￣;)┌`);
			return;
		}
		const isFull = await db.groupIsFull(groupEntry.id);
		if(isFull) {
			await interaction.reply(`Sorry, there's no more space in this group! (｡•́︿•̀｡)`);
			return;
		}
		const inGroup = await db.userIsInGroup(userEntry.id, groupEntry.id);
		if(inGroup) {
			await interaction.reply(`Wait a second... you're already in that group! (╬ Ò﹏Ó)`);
			return;
		}
		try {
			await ownerDiscordObj.send(`Hey there! ${userEntry.username} would like to join your group named "${groupEntry.name}"! If you want to let them join, use \`/lfg-add-to-group group:${groupEntry.id} user:@${userEntry.username}\``);
			await interaction.reply(`I messaged ${ownerEntry.username} for you! Please follow up with them.`);
		} catch(err) {
			await interaction.reply(`Something went wrong when I tried to message ${ownerEntry.username} ๐·°(⋟﹏⋞)°·๐ Please report this to your admins. ;-;`);
			console.log(err);
		}
	},
};
