const { Events, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { userState } = require('../state');
const fs = require('fs');
const path = require('path');

// In-memory cache for results
const resultCache = [];

// Helper to append results to cache (anonymous, no userId)
function cacheResult({ selectedLabel, moodBefore, moodAfter, timestamp }) {
    resultCache.push({ selectedLabel, moodBefore, moodAfter, timestamp });
}

// Helper to flush cache to CSV
function flushCacheToCSV() {
    if (resultCache.length === 0) return;
    const filePath = path.join(__dirname, '../results.csv');
    // If file doesn't exist, add header
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, 'selectedLabel,moodBefore,moodAfter,timestamp\n');
    }
    const rows = resultCache.map(({ selectedLabel, moodBefore, moodAfter, timestamp }) =>
        [selectedLabel, moodBefore, moodAfter, timestamp]
            .map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n') + '\n';
    fs.appendFileSync(filePath, rows);
    resultCache.length = 0; // Clear cache
}

// Schedule cache flush 3 times a day (every 8 hours)
setInterval(flushCacheToCSV, 8 * 60 * 60 * 1000);

// Helper to delete previous bot DMs to the user
async function deletePreviousBotDMs(user) {
    try {
        const dmChannel = await user.createDM();
        // Fetch last 50 messages in DM
        const messages = await dmChannel.messages.fetch({ limit: 50 });
        // Filter bot's own questionnaire-related messages
        const botMessages = messages.filter(msg =>
            msg.author.id === user.client.user.id &&
            (
                msg.embeds.some(e =>
                    e.title === 'Liikkumisen iloa!' ||
                    e.title === 'Kiitos vastauksistasi!' ||
                    e.title === 'Liikkumistapa'
                ) ||
                msg.components.length > 0
            )
        );
        for (const msg of botMessages.values()) {
            try { await msg.delete(); } catch (e) { /* ignore */ }
        }
    } catch (e) {
        // ignore errors (e.g., if DMs are closed)
    }
}

// Helper to append results to CSV (anonymous, no userId)
function appendResultToCSV({ selectedLabel, moodBefore, moodAfter, timestamp }) {
    const filePath = path.join(__dirname, '../results.csv');
    const row = [selectedLabel, moodBefore, moodAfter, timestamp]
        // Regex to format arrays into CSV format
        .map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\n';
    // If file doesn't exist, add header
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, 'selectedLabel,moodBefore,moodAfter,timestamp\n');
    }
    fs.appendFileSync(filePath, row);
}

async function handleMoodBeforeSelection(dm, userId, selectedLabel) {
    const valinta1 = await import('../commands/utility/valinta1.js');
    await dm.send({
        content: `Valitsit lajin: **${selectedLabel}**. Millainen olosi oli **ennen** sitä asteikolla **1 - 5** (jossa 1 = todella huono olo ja 5 = erinomainen olo)?`,
        components: [valinta1.firstChoice()],
    });
    userState.set(userId, { ...userState.get(userId), step: 'mood_before' });
}

async function handleMoodAfterSelection(dm, userId, selectedLabel) {
    const valinta2 = await import('../commands/utility/valinta2.js');
    await dm.send({
        content: `Valitsit lajin: **${selectedLabel}**. Entä millainen olosi oli liikkumisen **jälkeen** asteikolla **1 - 5** (jossa 1 = todella huono olo ja 5 = erinomainen olo)?`,
        components: [valinta2.secondChoice()],
    });
    userState.set(userId, { ...userState.get(userId), step: 'mood_after' });
}

async function openStartViewDM(user) {
    await deletePreviousBotDMs(user);
    const embed = new EmbedBuilder()
        .setTitle('Liikkumisen iloa!')
        .setDescription('Miten olet liikkunut tänään? Paina nappia avataksesi lajivalikon. \n\nVoit myös hakea lajia komennolla `/laji`.');

    const liikuin = await import('../commands/utility/liikuin.js');
    await user.send({
        content: '**Aloita uusi kysely valitsemalla laji alta.**',
        embeds: [embed],
        components: [liikuin.getSelectMenuRow()],
    });
    userState.set(user.id, { step: 'start' });
}

async function showEndScreenDM(user) {
    const embed = new EmbedBuilder()
        .setTitle('Kiitos vastauksistasi!')
        .setDescription('Kysely on nyt valmis ja vastauksesi on tallennettu. Mukavaa päivää! :) \n\nOdotathan hetken, että poistan nämä viestit tästä kanavasta. Voit aloittaa uuden kyselyn milloin tahansa sen jälkeen.');

    // Send the end screen in DM
    await user.send({
        content: '',
        embeds: [embed],
        components: [],
    });

    // Save results to cache if available (anonymous)
    const state = userState.get(user.id);
    if (state && state.selectedLabel && state.moodBefore && state.moodAfter) {
        cacheResult({
            selectedLabel: state.selectedLabel,
            moodBefore: state.moodBefore,
            moodAfter: state.moodAfter,
            timestamp: new Date().toISOString()
        });
    }

    // After 20 seconds, delete all bot DMs in the user's DM channel (but NOT guild messages)
    setTimeout(async () => {
        try {
            await deletePreviousBotDMs(user);
        } catch (e) {
            // ignore
        }
    }, 20000);
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const user = interaction.user;

        // Only start the graphical UI if the user clicks the button in the channel
        if (interaction.isButton() && interaction.customId === 'open_menu') {
            await openStartViewDM(user);
            if (interaction.inGuild()) {
                await interaction.reply({ content: 'Aloitetaan kysely yksityisviestissä! \n\n (Voit poistaa tämän ohjeviestin milloin vain.)', flags: MessageFlags.Ephemeral,});
            }
            return;
        }

        // Handle slash command /laji and all other commands via client.commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                await interaction.reply({ content: 'Komento ei ole käytettävissä.', flags: MessageFlags.Ephemeral, });
                return;
            }
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Komennon suoritus epäonnistui.', flags: MessageFlags.Ephemeral, });
                } else {
                    await interaction.reply({ content: 'Komennon suoritus epäonnistui.', flags: MessageFlags.Ephemeral, });
                }
            }
            return;
        }

        // Handle autocomplete for slash commands
        if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command || typeof command.autocomplete !== 'function') {
                console.error(`No autocomplete handler for ${interaction.commandName}.`);
                return;
            }
            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error('Autocomplete error:', error);
            }
            return;
        }

        // Only process further if in a DM channel
        if (!interaction.channel || interaction.channel.type !== 1) { // 1 = DM
            return;
        }

        // Handle select menu in DM
        if (interaction.isStringSelectMenu() && interaction.customId === 'lajivalinta') {
            const selectedValue = interaction.values[0];
            const options = interaction.component.options;
            const selectedOption = options.find(option => option.value === selectedValue);
            const selectedLabel = selectedOption ? selectedOption.label : selectedValue;

            userState.set(user.id, { selectedLabel, step: 'activity' });

            const ohitaMielialakysely = await import('../commands/utility/ohitaMielialakysely.js');
            await interaction.reply({
                content: `Valitsit lajin: **${selectedLabel}**. Haluatko vastata mielialakyselyyn?`,
                components: [ohitaMielialakysely.passMoodQuestionnaire()],
            });
            return;
        }

        // Handle mood questionnaire opt-in/out in DM
        if (interaction.isButton() && interaction.customId === 'OPT_IN') {
            const state = userState.get(user.id);
            const selectedLabel = state ? state.selectedLabel : 'Tunnistamaton laji';
            await handleMoodBeforeSelection(interaction.channel, user.id, selectedLabel);
            return;
        }
        if (interaction.isButton() && interaction.customId === 'OPT_OUT') {
            userState.delete(user.id);
            await showEndScreenDM(user);
            return;
        }

        // Handle mood before/after selections in DM
        if (interaction.isButton() && interaction.customId.startsWith('value_')) {
            const state = userState.get(user.id);
            const selectedLabel = state ? state.selectedLabel : 'Tunnistamaton laji';
            await handleMoodAfterSelection(interaction.channel, user.id, selectedLabel);
            return;
        }
        if (interaction.isButton() && interaction.customId.startsWith('value2_')) {
            userState.delete(user.id);
            await showEndScreenDM(user);
            return;
        }
    },
};
