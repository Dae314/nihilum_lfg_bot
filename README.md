# Nihilum LFG Bot
<sup>version: 1.0.0</sup>

Discord LFG bot for Nihilum guilds in AFK Arena

## Getting Started

This project uses Discord.js https://discord.js.org/#/

### Prerequisites

To compile, you must have NodeJS >=16.15.1 installed.

### Deployment

1. Clone a copy of the repository
	1. `cd /project/directory`
	1. `git clone https://github.com/Dae314/nihilum_lfg_bot.git`
1. Install the necessary packages
	1. `cd /project/directory/nihilum_lfg_bot`
	1. `npm install`
1. Setup the variables in a `.env` file
1. Add the bot to your Discord server
	1. Go to the My Apps page under the "Applications" section on the Discord Developer console
	1. Click on your bot application, and open the OAuth2 page
	1. Open Discord's OAuth2 URL generator
		1. Select the `bot` and `applications.commands` options.
		1. Once you select the `bot` option, a list of permissions will appear
		1. Select `Read Messages/View Channels`, `Send Messages`, and `Read Message History`
		1. Copy the link that is generated and paste it into your browser
	1. Follow Discord's prompts to add the bot to your server
1. Register your commands to the server specified in .env
	1. `npm run deploy`
1. Start the bot for development
	1. `npm run start`
1. Start the bot for production
	1. If necessary, install pm2
		1. `npm install --global pm2`
	1. Start the bot with pm2
		1. `pm2 start index.js --name "nihilum-lfg-bot"`
	1. Check the console logs
		1. `pm2 monit`
	1. Stop the bot
		1. `pm2 stop "nihilum-lfg-bot"`
	1. Restart the bot
		1. `pm2 restart "nihilum-lfg-bot"`
	1. Start pm2 at boot
		1. `pm2 startup`
		1. Run the command that pm2 generates
		1. Save your currently running list to start at boot (note, the bot must be running when you run this)
			1. `pm2 save`
	1. Disable pm2 at boot
		1. `pm2 unstartup`

## Built With

* [Discord.js](https://discord.js.org/#/)
* [sqlite](https://www.npmjs.com/package/sqlite3)

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/Dae314/nihilum_lfg_bot/tags). 

## Authors

* **Dae314** - *Maintainer* - [Dae314](https://github.com/Dae314)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* PurpleBooth - for the [README.md](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2) template
