const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const DiscordPagination = require('../util/DiscordPagination.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-show-group-types')
		.setDescription('Show registered group types'),
	async execute(interaction, db, client) {
		try {
			const results = await db.getAllGroupTypes();
			let pageResults = [];
			for(const entry of results) {
				let groups = await db.getAllGroupsbyType(entry.id);
				pageResults.push(
					new MessageEmbed()
					.setTitle(entry.name)
					.addFields(
						{ name: 'Member Max', value: `${entry.memberMax}`, inline: true, },
						{ name: 'id', value: `${entry.id}`, inline: true, },
						{ name: 'groups', value: `${groups.length}`, inline: true, },
					)
				)
			}
			DiscordPagination(interaction, pageResults);
		} catch(err) {
			await interaction.reply({content: `Something went wrong finding the group types ๐·°(⋟﹏⋞)°·๐ Please report this to your admins. ;-;`, ephemeral: true});
			console.log(err);
		}
	},
};
