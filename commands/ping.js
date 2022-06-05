const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction, db) {
		const result = await db.getAllUsers();
		await interaction.reply(JSON.stringify(result));
	},
};
