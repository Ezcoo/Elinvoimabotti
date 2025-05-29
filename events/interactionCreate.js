const { Events, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { userState } = require('../state');

async function handleMoodBeforeSelection(interaction, selectedLabel) {
    const valinta1 = await import('../commands/utility/valinta1.js');
    await interaction.update({
        content: `Valitsit: **${selectedLabel}**. Millainen olosi oli **ennen** sitä asteikolla **1 - 5** (jossa 1 = todella huono olo ja 5 = erinomainen olo)?`,
        flags: MessageFlags.Ephemeral,
        components: [valinta1.firstChoice()],
    });
}

async function handleMoodAfterSelection(interaction, selectedLabel) {
    const valinta2 = await import('../commands/utility/valinta2.js');
    await interaction.update({
        content: `Valitsit: **${selectedLabel}**. Entä millainen olosi oli liikkumisen **jälkeen** asteikolla **1 - 5** (jossa 1 = todella huono olo ja 5 = erinomainen olo)?`,
        flags: MessageFlags.Ephemeral,
        components: [valinta2.secondChoice()],
    });
}

async function openStartView(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('Liikkumisen iloa!')
        .setDescription('Miten olet liikkunut tänään? Paina nappia avataksesi lajivalikon.');

    const openMenuButton = new ButtonBuilder()
        .setCustomId('open_menu')
        .setLabel('Avaa lajivalikko')
        .setStyle(ButtonStyle.Primary);

    const buttonRow = new ActionRowBuilder().addComponents(openMenuButton);

    // Edit the original message using the message object if possible
    try {
        // If interaction is a MessageComponentInteraction, use interaction.message.edit
        if (interaction.message && typeof interaction.message.edit === 'function') {
            await interaction.message.edit({
                content: '**Aloita uusi kysely painamalla nappia alta.**',
                embeds: [embed],
                components: [buttonRow],
                flags: MessageFlags.Ephemeral,
            });
        } else {
            // Fallback: try interaction.update (if not already replied)
            await interaction.update({
                content: '**Aloita uusi kysely painamalla nappia alta.**',
                embeds: [embed],
                components: [buttonRow],
                flags: MessageFlags.Ephemeral,
            });
        }
    } catch (e) {
        // Optionally log or handle error
        console.log(e);
    }
}

async function showEndScreen(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('Kiitos vastauksistasi!')
        .setDescription('Kysely on nyt valmis. Mukavaa päivää!');

    await interaction.update({
        content: '',
        embeds: [embed],
        components: [],
        flags: MessageFlags.Ephemeral,
    });

    setTimeout(async () => {
        try {
            await openStartView(interaction);
        } catch (e) {
            console.log(e);
        }
    }, 5000);
}

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);

                // If this is your autocompletion command, continue the flow:
                if (interaction.commandName === 'your_autocomplete_command') {
                    // Get the selected label/value from the option
                    const selectedLabel = interaction.options.getString('laji');
                    await handleActivitySelection(interaction, selectedLabel);
                    return;
                }

            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                }
            }

        } else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
        } else if (interaction.isButton() && interaction.customId === 'open_menu') {
            // Dynamically import liikuin to support ESM
            const liikuin = await import('../commands/utility/liikuin.js');
            await interaction.update({
                content: '**Valitse laji alta!**',
                flags: MessageFlags.Ephemeral,
                embeds: [],
                components: [liikuin.getSelectMenuRow()],
            });
            return;
        } else if (interaction.isStringSelectMenu() && interaction.customId === 'lajivalinta') {
            const selectedValue = interaction.values[0];
            const options = interaction.component.options;
            const selectedOption = options.find(option => option.value === selectedValue);
            const selectedLabel = selectedOption ? selectedOption.label : selectedValue;

            // Store selectedLabel for this user
            userState.set(interaction.user.id, { selectedLabel });

            // Ask whether to include mood questionnaires
            const ohitaMielialakysely = await import('../commands/utility/ohitaMielialakysely.js');
            await interaction.update({
                content: `Valitsit: **${selectedLabel}**. Haluatko vastata mielialakyselyyn?`,
                flags: MessageFlags.Ephemeral,
                components: [ohitaMielialakysely.passMoodQuestionnaire()],
            });
            return;
        } else if (interaction.isButton() && interaction.customId === 'OPT_IN') {
            // Retrieve selectedLabel for this user
            const state = userState.get(interaction.user.id);
            const selectedLabel = state ? state.selectedLabel : 'Tunnistamaton laji';
            await handleMoodBeforeSelection(interaction, selectedLabel);
            return;
        } else if (interaction.isButton() && interaction.customId.startsWith('value_')) {
            // User selected a mood value, now ask about mood after activity
            const state = userState.get(interaction.user.id);
            const selectedLabel = state ? state.selectedLabel : 'Tunnistamaton laji';
            await handleMoodAfterSelection(interaction, selectedLabel);
            return;
        } else if (interaction.isButton() && interaction.customId.startsWith('value2_')) {
            // User finished the last question (after mood after activity)
            userState.delete(interaction.user.id);
            await showEndScreen(interaction);
            return;
        } else if (interaction.isButton() && interaction.customId === 'OPT_OUT') {
            // User opted out of the mood questionnaire
            userState.delete(interaction.user.id);
            await showEndScreen(interaction);
            return;
        }
	},
};
