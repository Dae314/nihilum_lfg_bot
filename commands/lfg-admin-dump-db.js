const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageAttachment } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-admin-dump-db')
		.setDescription('Admin command: dump the database'),
	async execute(interaction, db, client) {
		const isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
		if(!isAdmin) {
			await interaction.reply({content: `No way you just tried to run an admin command without being an admin, you naughty user you! (╬ Ò ‸ Ó)`, ephemeral: true});
			return
		}
		try {
			const buffer = Buffer.from(`
${JSON.stringify(await db.getAllUsers())}
${JSON.stringify(await db.getAllGroupTypes())}
${JSON.stringify(await db.getAllGroups())}
${JSON.stringify(await db.getAllMembers())}`,
				'utf-8');
			const attachment = new MessageAttachment(buffer, 'database.txt');
			await interaction.reply({content: `DB Dump:`, files: [attachment], ephemeral: true});
		} catch(err) {
			await interaction.reply({content: `Something went wrong dumping the database ๐·°(⋟﹏⋞)°·๐ Check the console log.`, ephemeral: true});
			console.log(err);
		}
	},
};
