const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Responds with the list of commands available, and information about YaoiCute_bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages || PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply()
        var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

        const text = new EmbedBuilder()
            .setColor("#245078")
            .setTitle('---------Box----------')
            .addFields(
                { name: 'Spawn box chance', value: settings.box_chance + "/10 000" },
                { name: 'Chance to win', value: settings.box_gain + "%" }
            )

        const text2 = new EmbedBuilder()
            .setColor("#245078")
            .setTitle('------Book channel------')
            .addFields(
                { name: 'Yaoi Light book Channel', value: '<#' + settings.light_book + '>' },
                { name: 'Yaoi Hard book Channel', value: '<#' + settings.hard_book + '>' }
            )
        const text3 = new EmbedBuilder()
            .setColor("#245078")
            .setTitle('-------Book Cookie-------')
            .addFields(
                { name: 'Cookie per daily', value: settings.daily + " 🍪"},
                { name: 'Cookie statue', value: settings.cookie_status},
                { name: 'Cookie per messages', value: settings.cookie_add + " 🍪"},
            )
        var fields = Array();
        for (var link in settings.category) {
            fields.push({ name: settings.category[link], value: "<#" + link + ">" });
        }
        const text4 = new EmbedBuilder()
            .setColor("#245078")
            .setTitle('-----Link to web site-----')
            .addFields(
                fields
            )

        interaction.editReply({ embeds: [text, text2, text3, text4] })
        return;
    }
};

//'\u200B' => '  '