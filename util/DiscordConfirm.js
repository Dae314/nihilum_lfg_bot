const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = async function DiscordConfirm(interaction, confirmText, confirmCallback, timeout=15000) {
	const row = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('confirmButton')
				.setLabel('Confirm')
				.setStyle('DANGER'),
		);

	await interaction.reply({ content: confirmText, components: [row], ephemeral: true });
	const confirmTimeout = setTimeout(async () => {
		await interaction.editReply({content: 'No response means no work! ╰(▔∀▔)╯', components: [], ephemeral: true});
	}, timeout);

	const filter = (buttonInteraction) => {
		return interaction.user.id === buttonInteraction.user.id;
	}

	const collector = interaction.channel.createMessageComponentCollector({filter, max: 1, time: timeout});

	collector.on('collect', async interaction => {
		if(interaction.customId === 'confirmButton') {
			clearTimeout(confirmTimeout);
			await confirmCallback(interaction);
		}
	});
}
