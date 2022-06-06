// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents } = require('discord.js');
const Database = require('./database.js');
const dotenv = require('dotenv');
dotenv.config();
const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Create database connection
const db = new Database('./data/groups.db');

// debugging function to test various database functions
async function testDB(db) {
	db.resetDatabase();
	await db.loadTestData();
	// await new Promise(r => setTimeout(r, 1000));
	// console.log(await db.getAllGroupTypes());
	// await db.updateGroupTypeMemberMax(1, 50);
	// console.log(await db.getAllGroupTypes());
	// db.resetDatabase();
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

// add commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	if (interaction.commandName === 'autocomplete') {
		const focusedOption = interaction.options.getFocused(true);
		let choices;

		switch(focusedOption.name) {
			case 'type':
				const validTypes = await db.getAllGroupTypes();
				choices = validTypes.map(e => e.name);
				break;
			default:
				await interaction.respond([]);
				return;
		}

		const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
		await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
	} else {
		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction, db);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'I broke something, sorry ●︿● you should probably tell the Admins.', ephemeral: true });
		}
	}
});

// debugging function call
testDB(db);

// Login to Discord with your client's token
client.login(token);
