const { ActionRowBuilder, Events, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('deprecated')
		.setDescription('Miten liikuit tänään?')
		.addStringOption(option =>
			option.setName('vaihtoehdot')
				.setDescription('Lajin nimi')
				.setAutocomplete(true)),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const choices = ['Pyöräily', 'Kävely', 'Juoksu', 'Kuntosali', 'Uinti'];
		const filtered = choices.filter(choice => choice.startsWith(focusedValue));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},
	async execute(interaction) {
		const chosenActivity = interaction.value;
		const reason = interaction.options.getString('reason') ?? 'No reason provided';

		const button1 = new ButtonBuilder()
			.setCustomId('button1')
			.setLabel('1')
			.setStyle(ButtonStyle.Primary);

		const button2 = new ButtonBuilder()
			.setCustomId('button2')
			.setLabel('2')
			.setStyle(ButtonStyle.Primary);

		const button3 = new ButtonBuilder()
			.setCustomId('button3')
			.setLabel('3')
			.setStyle(ButtonStyle.Primary);

		const button4 = new ButtonBuilder()
			.setCustomId('button4')
			.setLabel('4')
			.setStyle(ButtonStyle.Primary);

		const button5 = new ButtonBuilder()
			.setCustomId('button5')
			.setLabel('5')
			.setStyle(ButtonStyle.Primary);

		const row = new ActionRowBuilder()
			.addComponents(button1, button2, button3, button4, button5);

		await interaction.reply({
			content: `**Valitse, miten hyvältä sinusta tuntui ennen liikkumista asteikolla 0-5.**`,
			components: [row],
		});
	},
};
