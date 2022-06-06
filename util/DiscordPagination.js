const paginationEmbed = require('discordjs-button-pagination');
const { MessageButton } = require('discord.js');

module.exports = function DiscordPagination(interaction, pages) {
	const buttonList = [
		new MessageButton()
			.setCustomId('prevButton')
			.setLabel('Previous')
			.setStyle('DANGER'),
		new MessageButton()
			.setCustomId('nextButton')
			.setLabel('Next')
			.setStyle('SUCCESS'),
	]
	paginationEmbed(interaction, pages, buttonList);
}
