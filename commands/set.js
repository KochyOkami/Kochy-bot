const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set")
        .setDescription("To set a specific channel, for yaoi book.")
        .addStringOption(option =>
            option.setName('option')
                .setDescription('the setting that will be set')
                .addChoices(
                    { name: 'Yaoi Light', value: 'yaoi light' },
                    { name: 'Yaoi Hard', value: 'yaoi hard' },)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('id')
                .setDescription("the id of the channel who that been set, by defaul take the current channel")
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels || PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            if (await interaction.options.getString('id', false)) {
                try {
                    var option = await interaction.options.getString('option', true);
                    let settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

                    if (option === 'yaoi hard') {
                        settings.hard_book = await interaction.client.channels.fetch(await interaction.options.getString('id', true));

                    } else if (option === 'yaoi light') {
                        settings.light_book = await interaction.client.channels.fetch(await interaction.options.getString('id', true));

                    }

                    const text = new EmbedBuilder()
                        .setColor('#245078')
                        .setTitle('**Information**')
                        .setDescription(`This channel are now the channel for the ${option} !`)
                        .setFooter({ text: '/set `option`' })


                    await interaction.editReply({ embeds: [text] });
                    fs.writeFileSync("./settings.json", JSON.stringify(settings));
                    return;

                } catch (error) {
                    log.write(error);
                    const text = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('**Error**')
                        .setDescription(`There was an error executing /set ${option} : \n` + '```' + error + '```')
                    await interaction.editReply({ embeds: [text] });
                    return;
                }

            } else {
                try {
                    var option = await interaction.options.getString('option', true);
                    let settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

                    if (option === 'yaoi hard') {
                        settings.hard_book = interaction.channelId;

                    } else if (option === 'yaoi light') {
                        settings.light_book = interaction.channelId;

                    }

                    const text = new EmbedBuilder()
                        .setColor('#245078')
                        .setTitle('**Information**')
                        .setDescription(`This channel are now the channel for the ${option} !`)
                        .setFooter({ text: '/set `option`' })


                    await interaction.editReply({ embeds: [text] });
                    fs.writeFileSync("./settings.json", JSON.stringify(settings));
                    return;

                } catch (error) {
                    log.write(error);
                    const text = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('**Error**')
                        .setDescription(`There was an error executing /set ${option} : \n` + '```' + error + '```')
                    await interaction.editReply({ embeds: [text] });
                    return;
                }
            }
        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /set ${option} : \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }

    }
};