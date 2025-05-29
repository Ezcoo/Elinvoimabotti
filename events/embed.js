const { Client, GatewayIntentBits, ActionRowBuilder, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { token } = require('../config.json');

const CHANNEL_ID = '1377448009117204634'; // Replace with your channel ID

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    // Create the embed
    const embed = new EmbedBuilder()
        .setTitle('Liikkumisen iloa!')
        .setDescription('Miten olet liikkunut tänään? Paina nappia avataksesi lajivalikon.');

    // Create the button
    const openMenuButton = new ButtonBuilder()
        .setCustomId('open_menu')
        .setLabel('Avaa lajivalikko')
        .setStyle(ButtonStyle.Primary);

    const buttonRow = new ActionRowBuilder().addComponents(openMenuButton);

    await channel.send({
        embeds: [embed],
        components: [buttonRow],
    });

    console.log('Embed with button sent!');
});

// No changes needed

client.login(token);