const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const config = require('../config');
const { ActionRowBuilder, SelectMenuBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("For see the top."),

    async execute(interaction) {
        await interaction.deferReply();
        var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

        try {
            const row = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('shop_select')
                        .setPlaceholder('Chose something to buy')
                        .addOptions(settings.shop_select),
                );
            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`cancel_shop`)
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary),
                );

            var values = ""
            for (let index = 0; index < settings.shop_select.length; index++) {
                var object = settings.shop_role.find(obj => { return obj.name === settings.shop_select[index].value; })

                values += `**Role ${object.name} (${object.price} :cookie:)**\n`
                values += `You buy the role ${object.name}\n`
            }

            const text = new EmbedBuilder()
                .setColor('#245078')
                .setTitle('Shop')
                .setDescription(values)
            await interaction.editReply({ embeds: [text], components: [row, button] });
            //await wait(4000)
            //await interaction.editReply({ embeds: [text], components: [] });
            return;
        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /cookie : \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }

    }
};