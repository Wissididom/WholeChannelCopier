import * as dotenv from "dotenv";
import { Client, GatewayIntentBits, Partials, WebhookClient } from "discord.js";

dotenv.config();

const INCLUDE_BOTS =
  process.env["INCLUDE_BOTS"].toLowerCase() == "true" ? true : false;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
  ],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`); // Logging
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    await interaction.deferReply({ ephemeral: true });
    let webhookUrl = interaction.options.getString("webhook_url") ?? null;
    switch (interaction.commandName) {
      case "clone":
        await interaction.editReply({
          content: `Channel Content is now getting sent to your provided webhook url...`,
        });
        console.log(
          `[WholeChannelCloner] /clone webhook_url:redacted executed!`,
        );
        if (interaction.channel) {
          let messages = [];
          let message = await interaction.channel.messages
            .fetch({ limit: 1, after: "0" })
            .then((messagePage) =>
              messagePage.size === 1 ? messagePage.at(0) : null,
            );
          if (message.author.bot) {
            if (INCLUDE_BOTS) messages.push(message);
          } else {
            messages.push(message);
          }
          while (message && messages.length < 50) {
            await interaction.channel.messages
              .fetch({ limit: 100, after: message.id })
              .then((messagePage) => {
                messagePage.forEach((msg) => {
                  if (message.author.bot) {
                    if (INCLUDE_BOTS) messages.push(msg);
                  } else {
                    messages.push(msg);
                  }
                  messages.push(msg);
                });
                // Update our message pointer to be the last message on the page of messages
                message = 0 < messagePage.size ? messagePage.at(-1) : null;
              });
          }
          console.log(messages);
          await interaction.editReply({
            content: `Found ${messages.length} messages to send!`,
          });
          let webhookClient = new WebhookClient({ url: webhookUrl }); // TODO: Disallow any mentions
          for (let msg of messages) {
            webhookClient.send({
              content: msg.content,
              embeds: msg.embeds,
              files: msg.attachments.map((attachment) => {
                return {
                  attachment: attachment.url,
                  name: attachment.name,
                };
              }),
              components: msg.components,
              username: msg.author.username,
              avatarURL: msg.author.displayAvatarURL(),
            });
          }
        }
        break;
    }
  }
});

client.login(process.env["TOKEN"]);
