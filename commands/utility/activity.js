const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { userState } = require('../../state');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('laji')
		.setDescription('Voit myös pikavalita liikkumistyypin kirjoittamalla sen tähän.')
		.addStringOption(option =>
			option.setName('laji')
				.setDescription('Laji:')
				.setAutocomplete(true)),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const choices = ['Pyöräily', 'Kävely', 'Juoksu', 'Kuntosali', 'Uinti'];
		const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},
	async execute(interaction) {
		const activity = interaction.options.getString('laji');
		// Store the selected activity for this user
		userState.set(interaction.user.id, { selectedLabel: activity });

		// Import mood questionnaire buttons
		const ohitaMielialakysely = require('./ohitaMielialakysely.js');

		await interaction.reply({
			content: `Valitsit: **${activity}**. Haluatko vastata mielialakyselyyn?`,
			components: [ohitaMielialakysely.passMoodQuestionnaire()],
			flags: MessageFlags.Ephemeral,
		});
	}
};