const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = async function DiscordPagination(interaction, pages, timeout=120000) {
	const row = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('prevButton')
				.setLabel('Previous')
				.setStyle('DANGER'),
			new MessageButton()
				.setCustomId('nextButton')
				.setLabel('Next')
				.setStyle('SUCCESS'),
		);

	let visibleItem = 0;

	let page = pages[visibleItem].setFooter({ text: `${visibleItem + 1}/${pages.length}`});
	await interaction.reply({ embeds: [page], components: [row] });
		
	let interactTimeout = setTimeout(async () => {
		await interaction.editReply({components: []});
	}, timeout);

	const filter = (buttonInteraction) => {
		return interaction.user.id === buttonInteraction.user.id;
	}

	const collector = interaction.channel.createMessageComponentCollector({filter, time: timeout});

	collector.on('collect', async buttonInteraction => {
		if(buttonInteraction.customId === 'prevButton') {
			await buttonInteraction.deferUpdate();
			clearTimeout(interactTimeout);
			collector.resetTimer();
			interactTimeout = setTimeout(async () => {
				await interaction.editReply({components: []});
			}, timeout);
			if(--visibleItem < 0) visibleItem = pages.length - 1;
			let page = pages[visibleItem].setFooter({ text: `${visibleItem + 1}/${pages.length}`});
			await buttonInteraction.editReply({ embeds: [page], components: [row], ephemeral: true});
		} else if(buttonInteraction.customId === 'nextButton') {
			await buttonInteraction.deferUpdate();
			clearTimeout(interactTimeout);
			collector.resetTimer();
			interactTimeout = setTimeout(async () => {
				await interaction.editReply({components: []});
			}, timeout);
			if(++visibleItem >= pages.length) visibleItem = 0;
			let page = pages[visibleItem].setFooter({ text: `${visibleItem + 1}/${pages.length}`});
			await buttonInteraction.editReply({ embeds: [page], components: [row], ephemeral: true});
		}
	});
}
