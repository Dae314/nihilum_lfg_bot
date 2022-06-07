const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = async function DiscordConfirm(interaction, confirmText, confirmCallback) {
	const row = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('confirmButton')
				.setLabel('Confirm')
				.setStyle('DANGER'),
		);

	await interaction.reply({ content: confirmText, components: [row], ephemeral: true });

	const filter = (buttonInteraction) => {
		return interaction.user.id === buttonInteraction.user.id;
	}

	const collector = interaction.channel.createMessageComponentCollector({filter, max: 1, time: 15000});

	collector.on('collect', async interaction => {
		if(interaction.customId === 'confirmButton') {
			await confirmCallback(interaction);
		}
	});
}
