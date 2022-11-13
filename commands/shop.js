const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { ActionRowBuilder, SelectMenuBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("For see the shop."),

    async execute(interaction) {
        await interaction.deferReply();
        var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
        if (settings.cookie_status == 'off') {
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle(`**Sorry**`)
                .setDescription(`Cookie system is in maintenance mode,  please wait for the next update.`)
                .setThumbnail('attachment://dead-cat.png')
            await interaction.editReply({ embeds: [text], files: [`./images/obj/dead-cat.png`] });
        }
        else {

            try {
                if (settings.shop_select.length < 1) {
                    const text = new EmbedBuilder()
                        .setColor('#245078')
                        .setTitle('**Shop**')
                        .setDescription('Their is nothings the sell :/')
                    await interaction.editReply({ embeds: [text], components: [] });
                    return
                }
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

                var text = new EmbedBuilder()
                    .setColor('#245078')
                    .setTitle('**Shop**')
                for (let index = 0; index < settings.shop_select.length; index++) {
                    var object = settings.shop_role.find(obj => { return obj.name === settings.shop_select[index].value; })

                    text.addFields({ name: `Role ${object.name} (${object.price} :cookie:)`, value: `You buy the role ${object.name}` })
                }
                await interaction.editReply({ embeds: [text], components: [row, button] });
                return;
            } catch (error) {
                log.write(error);
                const text = new EmbedBuilder()
                    .setColor('#C0392B')
                    .setTitle('**Error**')
                    .setDescription(`There was an error executing /shop : \n` + '```' + error + '```')
                await interaction.editReply({ embeds: [text] });
                return;
            }
        }

    }
};