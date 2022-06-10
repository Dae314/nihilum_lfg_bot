const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-admin-help')
		.setDescription('Learn about the bot\'s admin commands'),
	async execute(interaction, db, client) {
		const isAdmin = interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
		if(!isAdmin) {
			await interaction.reply({content: `No way you just tried to run an admin command without being an admin, you naughty user you! (╬ Ò ‸ Ó)`, ephemeral: true});
			return;
		}
		const helpDoc = new MessageEmbed()
			.setTitle('Do you want to...')
			.addFields(
				{ name: 'Add a new group type', value: '\`/lfg-admin-add-group-type name:<type name> max:<max members>\`' },
				{ name: 'Delete a group type', value: '\`/lfg-admin-delete-group-type id:<group type ID>\`' },
				{ name: 'Modify max members of a group type', value: '\`/lfg-admin-mod-group-type id:<group type ID> max:<new max members (must be > current max)>\`' },
				{ name: 'Delete a group', value: '\`/lfg-admin-delete-group group:<group ID>\`' },
				{ name: 'Delete a group member', value: '\`/lfg-admin-delete-group-member group:<group ID> user:<user ID>\`' },
				{ name: 'Delete a user', value: '\`/lfg-admin-delete-user user:<user ID>\`' },
				{ name: 'Dump the database (get IDs for other commands)', value: '\`/lfg-admin-dump-db\`' },
			);
		try {
			await interaction.reply({ embeds: [helpDoc], ephemeral: true });
		} catch(err) {
			await interaction.reply({content: `Something went wrong showing the help doc ๐·°(⋟﹏⋞)°·๐ Please report this to your admins. ;-;`, ephemeral: true});
			console.log(err);
		}
	},
};
