const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const DiscordPagination = require('../util/DiscordPagination.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-my-groups')
		.setDescription('Show groups that you are a part of'),
	async execute(interaction, db, client) {
		const username = interaction.member.user.tag;
		let userEntry = await db.getUserbyUsername(username);
		if(!userEntry) {
			await db.addUser(username);
			userEntry = await db.getUserbyUsername(username);
		}
		try {
			const results = await db.getUserGroupMembership(userEntry.id);
			const types = await db.getAllGroupTypes();
			let pageResults = [];
			for(const group of results) {
				let members = await db.getGroupMembers(group.id);
				members = members.map(e => e.username);
				const membersStr = members.join(', ');
				const owner = await db.getUser(group.owner);
				const typeEntry = types.find(e => e.id === group.type);
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
			if(pageResults.length === 0) {
				await interaction.reply(`Looks like you're not in any groups. Go find some with \`/lfg-find-group\`!`);
			} else {
				DiscordPagination(interaction, pageResults);
			}
		} catch(err) {
			await interaction.reply(`Something went wrong finding your groups ๐·°(⋟﹏⋞)°·๐ Please report this to your admins. ;-;`);
			console.log(err);
		}
	},
};
