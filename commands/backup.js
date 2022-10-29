const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.js');
var dateTime = require('node-datetime');
var dt = dateTime.create();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("backup")
        .setDescription("Send a backup of the bot configuration")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild || PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try {
                await interaction.editReply({
                    content: "auto backup" + dt.format('Y-m-d H:M:S'),
                    files: [{
                        attachment: "./cookie.json",
                        name: "cookie-backup" + dt.format('Y-m-d H:M:S') + ".json",
                        description: `auto backup.`
                    },
                    {
                        attachment: "./daily.json",
                        name: "daily-backup" + dt.format('Y-m-d H:M:S') + ".json",
                        description: `auto backup.`
                    },
                    {
                        attachment: "./settings.json",
                        name: "settings-backup" + dt.format('Y-m-d H:M:S') + ".json",
                        description: `auto backup.`
                    }],
                });
                return;

        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /backup: \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }

    }
};