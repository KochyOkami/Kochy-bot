const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('/home/pi/Desktop/Kochy-bot/logs/logBuilder.js');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
var dateTime = require('node-datetime');
var dt = dateTime.create();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("log")
        .setDescription("Send the bot detail log")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try {

            try {
                const text = new EmbedBuilder()
                    .setColor('#245078')
                    .setTitle('**Information**')
                    .setDescription(`Bot log ${dt.format('Y-m-d H:M:S')}`)
                    .setFooter({ text: '/log' })

                var name_log = 'log-' + dt.format('Y-m-d H:M:S');
                var name_msg = 'msg-' + dt.format('Y-m-d H:M:S');
                await interaction.editReply({
                    embeds: [text],
                    files: [{
                        attachment: "/home/pi/Desktop/Kochy-bot/logs/errors.log",
                        name: name_log,
                        description: `Log wanted by ${interaction.member.displayName}`
                    },
                    {
                        attachment: "/home/pi/Desktop/Kochy-bot/logs/msg.log",
                        name: name_msg,
                        description: `mgs wanted by ${interaction.member.displayName}`
                    }],
                });
                fs.writeFile("/home/pi/Desktop/Kochy-bot/logs/errors.log", '', function (err) {
                    if (err) throw err;
                });
                fs.writeFile("/home/pi/Desktop/Kochy-bot/logs/msg.log", '', function (err) {
                    if (err) throw err;
                });
                return;

            } catch (error) {
                log.write(error);
                const text = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('**Error**')
                    .setDescription(`There was an error executing /backup: \n` + '```' + error + '```')
                await interaction.editReply({ embeds: [text] });
                return;
            }

        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /backup: \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }

    }
};