const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');
const { PassThrough } = require('stream');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unlink")
        .setDescription("Unlink all channel link to a specific channel or the current channel if their not specified.")
        .addStringOption(option =>
            option.setName('channel')
                .setDescription('if you want to unlink a specifique channel. Use channel id.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('delete')
                .setDescription('if you want to unlink only a specifique channel. Use channel id.')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('anonym')
                .setDescription('"true" for sending image anymously (false in defaultValue)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels || PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try {

            var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
            var anonym = false
            if (await interaction.options.getBoolean('anonym', false)) {
                var links_list = eval(settings.anonym_link);
                anonym = true
            }
            else {
                var links_list = eval(settings.links_list);
                anonym = false
            }

            //Use the default channel if a specific channel is not specified.
            if (await interaction.options.getString('channel', false)) {
                var channel = await interaction.options.getString('channel');
            } else {
                var channel = interaction.channel.id;
            }

            //check if the channel is linked to any other channels, else send error messasage.
            if (!links_list.hasOwnProperty(channel)) {
                const text = new EmbedBuilder()
                    .setColor('#F39C12')
                    .setTitle('**Warning**')
                    .setDescription(`This channel is not linked any other channels.`)

                await interaction.editReply({ embeds: [text] });
                return;
            }

            //delete a specific channel linked if it's specified.
            if (await interaction.options.getString('delete', false)) {
                var deleted = await interaction.options.getString('delete');

                //check if the specified channel is already in the link's list.

                const text = new EmbedBuilder()
                    .setColor('#2ECC71')
                    .setTitle('**Validation**')

                if (links_list[channel].includes(deleted)) {
                    if (links_list[channel].length > 1) {
                        var new_list = Array();
                        links_list[channel].forEach(function (chan) {
                            if (chan != deleted) {
                                new_list.push(chan);
                            }
                        });
                        links_list[channel] = new_list
                        var values = "";

                        for (let index = 0; index < links_list[channel].length; index++) {
                            try {
                                values += "<#" + links_list[channel][index] + "> `(" + await interaction.client.channels.fetch(links_list[channel][index]) + ")`\n";

                            } catch {
                                values += "`" + links_list[channel][index] + "`\n";
                            }



                        }
                        text.setDescription(`<#${deleted}> has been successfully unlink. Remain links:`)
                        text.setFields({ name: "Channels:", value: values })
                    } else {
                        delete links_list[channel];
                        text.setDescription(`<#${deleted}> has been successfully unlink. No links remainig.`)
                    }

                    log.write(`Channel: ${deleted} has been unlink to ${channel}`, interaction.member, interaction.channel);

                } else {
                    const text = new EmbedBuilder()
                        .setColor('#F39C12')
                        .setTitle('**Warning**')
                    if (await interaction.client.channels.fetch(deleted, false)) {
                        text.setDescription(`This channel is not linked to ${await interaction.client.channels.fetch(deleted)} (${deleted})`)

                    } else {
                        text.setDescription(`This channel is not linked to (${deleted})`)

                    }
                    await interaction.editReply({ embeds: [text] });
                    return;
                }



                await interaction.editReply({ embeds: [text] });

                settings.links_list = links_list;
                fs.writeFileSync("./settings.json", JSON.stringify(settings));
                return;

            } else {
                const save_list = links_list[channel];

                const text = new EmbedBuilder()
                    .setColor('#2ECC71')
                    .setTitle('**Validation**')
                    .setDescription(`<#${channel}> is unlink form all previous link:`)

                var values = "";

                for (let index = 0; index < links_list[channel].length; index++) {
                    try {
                        values += "<#" + links_list[channel][index] + "> `(" + await interaction.client.channels.fetch(links_list[channel][index]) + ")`\n";

                    } catch {
                        values += "`" + links_list[channel][index] + "`\n";
                    }

                }
                text.setFields({ name: "Channels:", value: values })

                delete links_list[channel];

                log.write(`Channel: ${save_list} has been unlink to ${channel}`, interaction.member, interaction.channel);
                await interaction.editReply({ embeds: [text] });
                if (anonym) {
                    settings.anonym_link = links_list;
                }else {
                settings.links_list = links_list;
                }
                fs.writeFileSync("./settings.json", JSON.stringify(settings));
                return;
            }

        } catch (error) {
            //log the error message.
            log.write(error, interaction.member, interaction.channel);

            //editReply the error message.
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`error: ${error.message}`)
                .setFooter({ text: '/link `arg1` `arg2`  arg* must be a channel id' })

            await interaction.editReply({ embeds: [text] });
            return;
        }
    }
};