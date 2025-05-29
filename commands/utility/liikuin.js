const { ActionRowBuilder, Events, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('liikuin')
		.setDescription('Millaista liikkumista harrastit?'),
	async execute(interaction) {
		const select = new StringSelectMenuBuilder()
			.setCustomId('lajivalinta')
			.setPlaceholder('Klikkaa tästä!')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Pyöräily')
					.setValue('pyoraily'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Kävely')
					.setValue('kavely'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Juoksu')
					.setValue('juoksu'),
                new StringSelectMenuOptionBuilder()
					.setLabel('Kuntosali')
					.setValue('kuntosali'),
                new StringSelectMenuOptionBuilder()
					.setLabel('Uinti')
					.setValue('uinti'),
			);

		const row = new ActionRowBuilder()
			.addComponents(select);

		const response = await interaction.reply({
			content: '**Valitse laji alta!**',
			components: [row],
			withResponse: true,
		});

		const collectorFilter = i => i.user.id === interaction.user.id;

		try {
 			const chosenActivity = await response.resource.message.awaitMessageComponent( { filter: collectorFilter });
			const activityLabel = response.resource.message.components[0].components[0].options.find(option => option.value === chosenActivity.values[0]).label;

			await chosenActivity.update( { content: `**${activityLabel}** valittu!` } );
		} catch {

		}

/* 		try {
			const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
			if (confirmation. {
				await confirmation.update({ content: `${target.username} has been banned for reason: ${reason}`, components: [] });
			} else if (confirmation.customId === 'cancel') {
				await confirmation.update({ content: 'Action cancelled', components: [] });
			}
		} catch {
			await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
		} */

	},
};