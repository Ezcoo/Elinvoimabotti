const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function passMoodQuestionnaire() {
    // Define the next menu: buttons 1-5
    const select = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder().setCustomId('OPT_OUT').setLabel('Ohita kysely').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('OPT_IN').setLabel('Vastaa kyselyyn').setStyle(ButtonStyle.Primary),
    );

    return select;
}

// Export the function
module.exports.passMoodQuestionnaire = passMoodQuestionnaire;