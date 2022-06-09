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

	//has the interaction already been deferred? If not, defer the reply.
	if (!interaction.deferred) await interaction.deferReply();

	let visibleItem = 0;

	let page = pages[visibleItem].setFooter({ text: `${visibleItem + 1}/${pages.length}`});
	const messageObj = await interaction.editReply({ embeds: [page], components: [row], fetchReply: true, });

	const filter = (buttonInteraction) => {
		return interaction.user.id === buttonInteraction.user.id;
	}

	const collector = await messageObj.createMessageComponentCollector({filter, time: timeout});

	collector.on('collect', async buttonInteraction => {
		switch(buttonInteraction.customId) {
			case 'prevButton':
				if(--visibleItem < 0) visibleItem = pages.length - 1;
				break;
			case 'nextButton':
				if(++visibleItem >= pages.length) visibleItem = 0;
				break;
			defualt:
				console.log('Invalid button press detected.');
		}
		const page = pages[visibleItem].setFooter({ text: `${visibleItem + 1}/${pages.length}`});
		if(!buttonInteraction.deferred) await buttonInteraction.deferUpdate();
		collector.resetTimer();
		await buttonInteraction.editReply({ embeds: [page], components: [row], ephemeral: true});
	});

	collector.on("end", (_, reason) => {
		if (reason !== "messageDelete") {
			messageObj.edit({components: [],});
		}
	});

	return messageObj;
}
