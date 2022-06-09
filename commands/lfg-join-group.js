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
				await interaction.reply({content: `Hmm... I couldn't find ${ownerEntry.username}, try messaging them directly.`, ephemeral: true});
				return;
			} else {
				await interaction.reply({content: `Something went wrong when I tried to look up ${ownerEntry.username} ๐·°(⋟﹏⋞)°·๐ Please report this to your admins. ;-;`, ephemeral: true});
				console.log(err);
			}
		}
		if(!userEntry) {
			await db.addUser(username, userID);
			userEntry = await db.getUserbyUsername(username);
		}
		if(!groupEntry) {
			await interaction.reply({content: `Sorry I couldn't find that group anywhere. ┐(￣ヘ￣;)┌`, ephemeral: true});
			return;
		}
		const isFull = await db.groupIsFull(groupEntry.id);
		if(isFull) {
			await interaction.reply({content: `Sorry, there's no more space in this group! (｡•́︿•̀｡)`, ephemeral: true});
			return;
		}
		const inGroup = await db.userIsInGroup(userEntry.id, groupEntry.id);
		if(inGroup) {
			await interaction.reply({content: `Wait a second... you're already in that group! (╬ Ò﹏Ó)`, ephemeral: true});
			return;
		}
		try {
			await ownerDiscordObj.send(`Hey there! ${userEntry.username} would like to join your group named "${groupEntry.name}"! If you want to let them join, use \`/lfg-add-to-group group:${groupEntry.id} user:@${userEntry.username}\``);
			await interaction.reply({content: `I messaged ${ownerEntry.username} for you! Please follow up with them.`, ephemeral: true});
		} catch(err) {
			await interaction.reply({content: `Something went wrong when I tried to message ${ownerEntry.username} ๐·°(⋟﹏⋞)°·๐ Please report this to your admins. ;-;`, ephemeral: true});
			console.log(err);
		}
	},
};
