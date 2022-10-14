const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("show_link")
        .setDescription("Show with witch channel this channel is linked. ")
        .addBooleanOption(option =>
            option.setName('all')
                .setDescription('"true" see all link settings,"false" see with withch channels is linked.(false in defaultValue)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels || PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
            var links_list = eval(settings.links_list);
            var channel = interaction.channelId;
            

            if (await interaction.options.getBoolean('all', false)) {

                const text = new EmbedBuilder()
                    .setColor('#245078')
                    .setTitle('**Information**')
                    .setDescription(`List of all channels and their associated channels:`)

                await interaction.channel.send({ embeds: [text] });
                
                for (let links in links_list) {
                    var values = "";
                    for (let index = 0; index < links_list[links].length; index++) {
                        try {
                            var channel_rep = await interaction.client.channels.fetch(links_list[links][index])
                            values += "  * <#" + links_list[links][index] + `> in server ${channel_rep.guild.name} \n`;
                        } catch (e){
                            console.log(e)
                            values += "  * `" + links_list[links][index] + "`\n";
                        }
                    }
                    try {
                        try {
                            var channel_rep = await interaction.client.channels.fetch(links)
                            const text = new EmbedBuilder()
                                .setColor('#245078')
                                .setDescription("**Channels <#" + await interaction.client.channels.fetch(links, true) + `> in server ${channel_rep.guild.name} with**: \n\n` + values)
                            await interaction.channel.send({ embeds: [text] });
                        } catch (e) {
                            console.log(e)
                            const text = new EmbedBuilder()
                                .setColor('#245078')
                                .setDescription("**Channels `" + links + "` with**: \n\n" + values)
                            await interaction.channel.send({ embeds: [text] });
                        }

                    } catch (e) {
                        log.write(e, interaction.member, interaction.channel)
                    }
                }
                await interaction.deleteReply();
                return;
            } else {
                if (links_list[channel]) {
                    const text = new EmbedBuilder()
                        .setColor('#245078')
                        .setTitle('**Information**')
                        .setDescription(`This channel is linked to:`)
                        .setFooter({ text: 'KochyBot' })

                    var values = "";

                    for (let index = 0; index < links_list[channel].length; index++) {
                        try {
                            var channel_rep = await interaction.client.channels.fetch(links_list[channel][index])
                            await interaction.client.channels.fetch(links_list[channel][index])
                            values += "  * <#" + links_list[channel][index] + `> in server ${channel_rep.guild.name} \n`;
                        } catch (e) {
                            console.log(e)
                            values += "  * `" + links_list[channel][index] + "`\n";
                        }
                    }
                    text.setFields({ name: "Channels:", value: values })
                    await interaction.editReply({ embeds: [text] });
                    return;
                } else {
                    const text = new EmbedBuilder()
                        .setColor('#245078')
                        .setTitle('**Information**')
                        .setDescription(`This channel is not linked to other channels`)
                    await interaction.editReply({ embeds: [text] });
                    return;
                }
            }

        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /show_link: \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }
    }
};