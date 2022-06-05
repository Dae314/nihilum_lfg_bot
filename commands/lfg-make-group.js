const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-make-group')
		.setDescription('Make a new group owned by you')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('The game mode for your group')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The name for your group')
				.setRequired(false)),
	async execute(interaction, db) {
		const username = interaction.member.user.tag;
		const typeStr = interaction.options.getString('type');
		let nameStr = interaction.options.getString('name');
		const typeEntry = await db.getGroupTypebyName(typeStr);
		let userEntry = await db.getUserbyUsername(username);
		if(!typeEntry) {
			const validTypes = await db.getAllGroupTypes();
			let validTypesStr = '';
			for(const entry of validTypes) {
				validTypesStr = `${entry.name}, ${validTypesStr}`;
			}
			validTypesStr = validTypesStr.slice(0, -2);
			await interaction.reply({ content: `I've never heard of the game type "${typeStr}". Maybe try one of these: ${validTypesStr}`, ephemeral: true });
			return;
		}
		if(!nameStr) {
			const adjectives = [
				'awesome', 'amazing', 'stupendeous', 'boring',
				'adorable', 'beautiful', 'charming', 'colorful',
				'terrific', 'dirty', 'slimey', 'absurd', 'brave',
				'cheesy', 'comical', 'eccentric', 'fanatical',
				'laughable', 'lively', 'loony', 'merry', 'nutty',
				'passionate', 'speedy', 'quiet', 'sadistic', 'wacky',
				'weird', 'delicious', 'scummy', 'yabai', 'attractive',
				'throbbing', 'moist', 'seiso', 'depressing',
			];
			const adjIdx = Math.floor(Math.random() * adjectives.length);
			const nouns = [
				'group', 'harem', 'army', 'herd', 'neighbors', 'horde',
				'legion', 'mob', 'swarm', 'throng', 'squad', 'tribe',
				'guild', 'society', 'commune', 'club', 'flock', 'pack',
				'teammates',
			];
			const nounIdx = Math.floor(Math.random() * nouns.length);
			nameStr = `${username}'s ${adjectives[adjIdx]} ${nouns[nounIdx]}`;
		}
		if(!userEntry) {
			await db.addUser(username);
			userEntry = await db.getUserbyUsername(username);
		}
		try {
			await db.addGroup(userEntry.id, typeEntry.id, nameStr);
			await interaction.reply(`Your group "${nameStr}" is ready to go!`);
		} catch(err) {
			await interaction.reply(`I'm sorry I couldn't make your group ๐·°(⋟﹏⋞)°·๐ Please report this to your admins.`);
		}
	},
};
