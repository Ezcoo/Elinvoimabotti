const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function secondChoice() {
    // Define the next menu: buttons 1-5
    const select = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('value2_1').setLabel('1').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('value2_2').setLabel('2').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('value2_3').setLabel('3').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('value2_4').setLabel('4').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('value2_5').setLabel('5').setStyle(ButtonStyle.Primary),
        );

    return select;
}

module.exports.secondChoice = secondChoice;