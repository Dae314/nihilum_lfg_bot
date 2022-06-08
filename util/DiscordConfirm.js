const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = function DiscordConfirm(interaction, confirmText, timeout=15000) {
	return new Promise(async resolve => {
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
			resolve({ confirmed: false, interaction: interaction });
		}, timeout);

		const filter = (buttonInteraction) => {
			return interaction.user.id === buttonInteraction.user.id;
		}

		const collector = interaction.channel.createMessageComponentCollector({filter, max: 1, time: timeout});

		collector.on('collect', async buttonInteraction => {
			if(buttonInteraction.customId === 'confirmButton') {
				clearTimeout(confirmTimeout);
				resolve({confirmed: true, interaction: interaction});
			}
		});
	});
}
