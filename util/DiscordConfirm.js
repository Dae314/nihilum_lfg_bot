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

		// has the interaction already been deferred? If not, defer the reply.
		if (!interaction.deferred) await interaction.deferReply({ephemeral: true});

		const messageObj = await interaction.editReply({ content: confirmText, components: [row], ephemeral: true });

		const filter = (buttonInteraction) => {
			return interaction.user.id === buttonInteraction.user.id;
		}

		const collector = await messageObj.createMessageComponentCollector({filter, max: 1, time: timeout});

		collector.on('collect', async buttonInteraction => {
			if(buttonInteraction.customId === 'confirmButton') {
				resolve({confirmed: true, interaction: interaction});
			}
		});

		collector.on("end", (_, reason) => {
			if (reason === 'time') {
				interaction.editReply({content: 'No response means no work! ╰(▔∀▔)╯', components: [], ephemeral: true});
				resolve({ confirmed: false, interaction: interaction });
			}
		});
	});
}
