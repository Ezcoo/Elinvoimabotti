const { Client, GatewayIntentBits, ActionRowBuilder, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { token } = require('../config.json');

const CHANNEL_ID = '1377448009117204634'; // Replace with your channel ID

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

async function ensureSingleQuestionnaire(channel) {
    // Fetch last 50 messages (adjust as needed)
    const messages = await channel.messages.fetch({ limit: 50 });
    // Filter bot's own questionnaire/embed messages
    const botMessages = messages.filter(msg =>
        msg.author.id === channel.client.user.id &&
        (
            msg.embeds.some(e =>
                e.title === 'Liikkumisen iloa!' ||
                e.title === 'Kiitos vastauksistasi!' ||
                e.title === 'Liikkumistapa'
            ) ||
            msg.components.length > 0
        )
    );
    // Sort by createdTimestamp descending (newest first)
    const sorted = botMessages.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
    // Keep the newest, delete the rest
    const [keep, ...toDelete] = sorted.values();
    for (const msg of toDelete) {
        try { await msg.delete(); } catch (e) { /* ignore */ }
    }
    return keep;
}

client.once('ready', async () => {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    // Ensure only one questionnaire/embed exists
    await ensureSingleQuestionnaire(channel);

    // Create the embed
    const embed = new EmbedBuilder()
        .setTitle('Liikkumisen iloa!')
        .setDescription('Miten olet liikkunut tänään? Paina nappia avataksesi lajivalikon. \n \nVoit myös hakea lajia komennolla `/laji`.');

    // Create the button
    const openMenuButton = new ButtonBuilder()
        .setCustomId('open_menu')
        .setLabel('Avaa lajivalikko')
        .setStyle(ButtonStyle.Primary);

    const buttonRow = new ActionRowBuilder().addComponents(openMenuButton);

    // Send only if there is no current questionnaire/embed
    const messages = await channel.messages.fetch({ limit: 10 });
    const alreadyExists = messages.some(msg =>
        msg.author.id === channel.client.user.id &&
        (msg.embeds.some(e => e.title === 'Liikkumisen iloa!') || msg.components.length > 0)
    );
    if (!alreadyExists) {
        await channel.send({
            embeds: [embed],
            components: [buttonRow],
        });
        console.log('Embed with button sent!');
    }
});

client.on('messageCreate', async (msg) => {
    if (msg.channel.id !== CHANNEL_ID) return;
    if (msg.author.id !== client.user.id) return;

    // After sending a new questionnaire/embed, ensure only one exists
    const channel = msg.channel;
    await ensureSingleQuestionnaire(channel);
});

client.login(token);