import * as dotenv from 'dotenv';
import {
	Client,
	GatewayIntentBits,
	Partials,
	ApplicationCommandType,
	ApplicationCommandOptionType
} from 'discord.js';

dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages
	],
	partials: [
		Partials.User,
		Partials.Channel,
		Partials.GuildMember,
		Partials.Message,
		Partials.Reaction
	]
}); // Discord Object

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`); // Logging
	const registerObject = {
		clone: {
			name: 'clone',
			description: 'Clone the current channels messages to another server using a webhook',
			type: ApplicationCommandType.ChatInput,
			options: [
				{
					name: 'webhook_url',
					description: 'The webhook url to send the messages to (Don\' worry the command with only be visible to you)',
					required: true,
					type: ApplicationCommandOptionType.String
				}
			]
		}
	};
	let promises = [];
	promises.push(client.application?.commands?.create(registerObject['clone']));
	Promise.all(promises).then(reolvedPromises => {
		process.kill(process.pid, 'SIGTERM');
	});
});

client.login(process.env['TOKEN']);
