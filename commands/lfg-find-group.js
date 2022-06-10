const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const DiscordPagination = require('../util/DiscordPagination.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-find-group')
		.setDescription('Find a group to join')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('The type of group you want to see')
				.setRequired(true)
				.setAutocomplete(true)),
	async execute(interaction, db, client) {
		const typeStr = interaction.options.getString('type');
		const typeEntry = await db.getGroupTypebyName(typeStr);
		if(!typeEntry) {
			const validTypes = await db.getAllGroupTypes();
			let validTypesStr = '';
			for(const entry of validTypes) {
				validTypesStr = `${entry.name}, ${validTypesStr}`;
			}
			validTypesStr = validTypesStr.slice(0, -2);
			await interaction.reply({ content: `I've never heard of the game type "${typeStr}". Maybe try one of these: ${validTypesStr}`, ephemeral: true });
			return;
		}
		try {
			const results = await db.getAllGroupsbyType(typeEntry.id);
			let pageResults = [];
			for(const group of results) {
				const isFull = await db.groupIsFull(group.id);
				if(!isFull) {
					let members = await db.getGroupMembers(group.id);
					members = members.map(e => e.username);
					const membersStr = members.join(', ');
					const owner = await db.getUser(group.owner);
					pageResults.push(
						new MessageEmbed()
						.setTitle(group.name)
						.setAuthor({ name: owner.username })
						.addFields(
							{ name: 'members', value: membersStr },
							{ name: 'count', value: `${members.length}/${typeEntry.memberMax}`, inline: true },
							{ name: 'type', value: typeEntry.name, inline: true },
							{ name: 'id', value: `${group.id}`, inline: true },
						)
						.setTimestamp(group.createdAt)
					)
				}
			}
			if(pageResults.length > 0) {
				DiscordPagination(interaction, pageResults);
			} else {
				await interaction.reply({content: `There are no open "${typeEntry.name}" groups right now, sorry ☆⌒(> _ <)`})
			}
		} catch(err) {
			await interaction.reply({content: `Something went wrong finding your groups ๐·°(⋟﹏⋞)°·๐ Please report this to your admins. ;-;`, ephemeral: true});
			console.log(err);
		}
	},
};
