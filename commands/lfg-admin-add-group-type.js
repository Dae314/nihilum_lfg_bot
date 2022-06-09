const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-admin-add-group-type')
		.setDescription('Admin command: add a new group type')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The name for the new type')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('max')
				.setDescription('The max number of members for this type')
				.setRequired(true)),
	async execute(interaction, db, client) {
		const isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
		const name = interaction.options.getString('name');
		const memberMax = interaction.options.getInteger('max');
		if(!isAdmin) {
			await interaction.reply(`No way you just tried to run an admin command without being an admin, you naughty user you! (╬ Ò ‸ Ó)`);
			return;
		}
		const groupTypeEntry = await db.getGroupTypebyName(name);
		if(groupTypeEntry) {
			await interaction.reply({content: `That group type already exists!`, ephemeral: true});
			return;
		}
		if(memberMax < 2) {
			await interaction.reply({content: `Oi, groups types gotta be at least 2 members ya hear!`, ephemeral: true});
			return;
		}
		try {
			await db.addGroupType(name, memberMax);
			await interaction.reply({content: `New group type "${name}" added!`, components: [], ephemeral: true});
		} catch(err) {
			await interaction.reply({content: `I wasn't able to add that group type ๐·°(⋟﹏⋞)°·๐ Check the console log.`, content: [], ephemeral: true});
			console.log(err);
		}
	},
};
