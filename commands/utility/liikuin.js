const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

// Define getSelectMenuRow function
function getSelectMenuRow() {
	const select = new StringSelectMenuBuilder()
		.setCustomId('lajivalinta')
		.setPlaceholder('Klikkaa tästä!')
		.addOptions(
			new StringSelectMenuOptionBuilder().setLabel('Pyöräily').setValue('pyoraily'),
			new StringSelectMenuOptionBuilder().setLabel('Kävely').setValue('kavely'),
			new StringSelectMenuOptionBuilder().setLabel('Juoksu').setValue('juoksu'),
			new StringSelectMenuOptionBuilder().setLabel('Kuntosali').setValue('kuntosali'),
			new StringSelectMenuOptionBuilder().setLabel('Uinti').setValue('uinti'),
		);

	return new ActionRowBuilder().addComponents(select);
}

// Export the function
module.exports.getSelectMenuRow = getSelectMenuRow;