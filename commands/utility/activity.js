const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { userState } = require('../../state');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('laji')
		.setDescription('Voit myös pikavalita liikkumistyypin kirjoittamalla sen tähän.')
		.addStringOption(option =>
			option
                .setName('laji')
				.setDescription('Laji:')
				.setAutocomplete(true)),
	async autocomplete(interaction) {
		try {
			const focusedValue = interaction.options.getFocused() ?? '';
			const choices = [
				'Hiihto', 'Hyötyliikunta', 'Jalkapallo', 'Jooga', 'Jumppa', 'Juoksu', "Jääkiekko", 'Kuntosali', 'Kävely', 'Laskettelu', 'Luistelu', 'Luonnossa liikkuminen', 
                'Marjastus', 'Palloilu', 'Pilates', 'Pyöräily', 'Ryhmäliikunta', 'Sienestys', 'Sulkapallo', 'Sähly', 'Uinti', 'Vesijumppa', 'Muu laji'
			];
			let filtered = choices;
			if (typeof focusedValue === 'string' && focusedValue.length > 0) {
				const normalized = focusedValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
				filtered = choices.filter(choice =>
					choice.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized)
				);
			}
			const results = filtered.slice(0, 25).map(choice => ({
				name: String(choice),
				value: String(choice)
			}));
			await interaction.respond(results.length > 0 ? results : [{ name: 'Ei tuloksia', value: 'Ei tuloksia' }]);
		} catch (err) {
			console.error('Autocomplete error:', err);
			try {
				await interaction.respond([{ name: 'Virhe', value: 'Virhe' }]);
			} catch {}
		}
	},
	async execute(interaction) {
		const activity = interaction.options.getString('laji');
		console.log(`An user selected activity ${activity} with slash command.`);
		userState.set(interaction.user.id, { selectedLabel: activity });

		const passMoodQuestionnaire = require('./ohitaMielialakysely.js');

		// If in a guild, move the flow to DMs after the initial reply
		if (interaction.inGuild()) {
			await interaction.reply({
				content: `Valitsit lajin: **${activity}**. Jatketaan kyselyä yksityisviestissä!`,
				flags: MessageFlags.Ephemeral,
			});
			try {
				await interaction.user.send({
					content: `Valitsit lajin: **${activity}**. Haluatko vastata mielialakyselyyn?`,
					components: [passMoodQuestionnaire.passMoodQuestionnaire()],
				});
			} catch (err) {
				console.error('Failed to send DM:', err);
				await interaction.followUp({
					content: 'En voinut lähettää sinulle yksityisviestiä. Tarkista yksityisviestiasetuksesi.',
					flags: MessageFlags.Ephemeral,
				});
			}
		} else {
			// In DMs, continue as before
			await interaction.reply({
				content: `Valitsit lajin: **${activity}**. Haluatko vastata mielialakyselyyn?`,
				components: [passMoodQuestionnaire.passMoodQuestionnaire()],
				flags: MessageFlags.Ephemeral,
			});
		}
	}
};