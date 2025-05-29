const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

// Define getSelectMenuRow function
function getSelectMenuRow() {
	const select = new StringSelectMenuBuilder()
		.setCustomId('lajivalinta')
		.setPlaceholder('Klikkaa tästä!')
		.addOptions(
			new StringSelectMenuOptionBuilder().setLabel('Kuntosali').setValue('kuntosali'),
			new StringSelectMenuOptionBuilder().setLabel('Pyöräily').setValue('pyöräily'),
			new StringSelectMenuOptionBuilder().setLabel('Kävely').setValue('kävely'),
			new StringSelectMenuOptionBuilder().setLabel('Juoksu').setValue('juoksu'),
			new StringSelectMenuOptionBuilder().setLabel('Uinti').setValue('uinti'),
			new StringSelectMenuOptionBuilder().setLabel('Vesijumppa').setValue('vesijumppa'),
			new StringSelectMenuOptionBuilder().setLabel('Hyötyliikunta').setValue('hyötyliikunta'),
			new StringSelectMenuOptionBuilder().setLabel('Ryhmäliikunta').setValue('ryhmäliikunta'),
			new StringSelectMenuOptionBuilder().setLabel('Palloilu').setValue('palloilu'),
			new StringSelectMenuOptionBuilder().setLabel('Hiihto').setValue('hiihto'),
			new StringSelectMenuOptionBuilder().setLabel('Luistelu').setValue('luistelu'),
			new StringSelectMenuOptionBuilder().setLabel('Luonnossa liikkuminen').setValue('luonnossa_liikkuminen'),
			new StringSelectMenuOptionBuilder().setLabel('Muu laji').setValue('muu_laji')
		);
	return new ActionRowBuilder().addComponents(select);
}

// Export the function
module.exports.getSelectMenuRow = getSelectMenuRow;