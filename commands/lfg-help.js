const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-help')
		.setDescription('Learn how to use this bot'),
	async execute(interaction, db, client) {
		const helpDoc = new MessageEmbed()
			.setTitle('Do you want to...')
			.addFields(
				{ name: 'Find a group with open positions', value: '\`/lfg-find-group type:<type name>\`' },
				{ name: 'Request to join a group', value: '\`/lfg-join-group group:<group ID>\`' },
				{ name: 'Make a group', value: '\`/lfg-make-group type:<type name> [name:<optional group name>]\`' },
				{ name: 'Leave a group', value: '\`/lfg-leave-group group:<group ID>\`' },
				{ name: 'Add someone in this server to a group (group owner only)', value: '\`/lfg-add-to-group group:<group ID> user:<discord user>\`' },
				{ name: 'Add someone outside this server to a group (group owner only)', value: '\`/lfg-add-to-group-filler group:<group ID> user:<username>\`' },
				{ name: 'Kick someone in this server from a group (group owner only)', value: '\`/lfg-kick-from-group group:<group ID> user:<discord user>\`' },
				{ name: 'Kick someone outside this server from a group (group owner only)', value: '\`/lfg-kick-from-group-filler group:<group ID> user:<username>\`' },
				{ name: 'See what types of groups there are', value: '\`/lfg-show-group-types\`' },
				{ name: 'See what groups I\'m in', value: '\`/lfg-my-groups\`' },
			);
		try {
			await interaction.reply({ embeds: [helpDoc] });
		} catch(err) {
			await interaction.reply({content: `Something went wrong showing the help doc ๐·°(⋟﹏⋞)°·๐ Please report this to your admins. ;-;`, ephemeral: true});
			console.log(err);
		}
	},
};
