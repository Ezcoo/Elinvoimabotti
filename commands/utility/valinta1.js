const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function firstChoice() {
    // Define the next menu: buttons 1-5
    const select = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder().setCustomId('value_1').setLabel('1').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('value_2').setLabel('2').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('value_3').setLabel('3').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('value_4').setLabel('4').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('value_5').setLabel('5').setStyle(ButtonStyle.Primary),
    );

    return select;
}

// Export the function
module.exports.firstChoice = firstChoice;