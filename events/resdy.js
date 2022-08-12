const client = require("../index");
const { WebhookClient } = require("discord.js") 
const log = new WebhookClient({ url: client.config.webhook });

client.on('ready', () => {
    console.log(`[BOT] Logged in as ${client.user.tag}`);

    client.user.setActivity(`luxz#8403`, { type: 'STREAMING',url: 'https://www.twitch.tv/loqrdluxz' });
}); 
