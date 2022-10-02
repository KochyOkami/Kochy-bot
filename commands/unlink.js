const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unlink")
        .setDescription("Unlink a specific channel or the current channel if their not specified.")
        .addStringOption(option =>
            option.setName('channel')
                .setDescription('if you want to unlink a specifique channel. Use channel id.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels | PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try{

            var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
            var links_list = eval(settings.links_list);

            if (await interaction.options.getString('channel', false)) {
                var channel = await interaction.options.getString('channel');

                if (links_list.hasOwnProperty(channel)) {
                    const text = new EmbedBuilder()
                        .setColor('#2ECC71')
                        .setTitle('**Validation**')
                        .setDescription(`<#${channel}> has been successfully unlink.`)
                    var values = "";

                    for (let index = 0; index < links_list[channel].length; index++) {
                        try {
                            values += "<#" + links_list[channel][index] + "> `(" + await interaction.client.channels.fetch(links_list[channel][index]) + ")`\n";

                        } catch {
                            values += "`" + links_list[channel][index] + "`\n";
                        }

                    }
                    text.setFields({ name: "Channels:", value: values })
                        .setFooter({ text: '/link `arg1` `arg2`  arg* to link channels' })

                    await interaction.editReply({ embeds: [text] });
                    log.write(`Channel: ${values} has been unlink to ${channel}`, interaction.member, interaction.channel);
                    delete links_list[channel];
                    settings.links_list = links_list;
                    fs.writeFileSync("./settings.json", JSON.stringify(settings));
                    return;
                }
            } else {
                var channel = interaction.channel.id;

                if (links_list.hasOwnProperty(channel)) {
                    const text = new EmbedBuilder()
                        .setColor('#2ECC71')
                        .setTitle('**Validation**')
                        .setDescription(`<#${channel}> has been successfully unlink.`)
                    var values = "";

                    for (let index = 0; index < links_list[channel].length; index++) {
                        try {
                            values += "<#" + links_list[channel][index] + "> `(" + await interaction.client.channels.fetch(links_list[channel][index]) + ")`\n";

                        } catch {
                            values += "`" + links_list[channel][index] + "`\n";
                        }

                    }
                    text.setFields({ name: "Channels:", value: values })
                        .setFooter({ text: '/link `arg1` `arg2`  arg* to link channels' })

                    await interaction.editReply({ embeds: [text] });
                    log.write(`Channel: ${values} has been unlink to ${channel}`, interaction.member, interaction.channel);
                    delete links_list[channel];
                    settings.links_list = links_list;
                    fs.writeFileSync("./settings.json", JSON.stringify(settings));
                    return;
                }

                const text = new EmbedBuilder()
                    .setColor('#C0392B')
                    .setTitle('**Error**')
                    .setDescription('This channel is not linked.')
                    .setFooter({ text: '*/link `arg1` `arg2`  arg* must be a channel id or room link*' })


                await interaction.editReply({ embeds: [text] });
                return;
            }
        }catch(error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /unlink  ${await interaction.options.getString('channel', false)}: \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }
    }
};