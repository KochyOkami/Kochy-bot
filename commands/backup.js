const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("backup")
        .setDescription("Send a backup of the bot configuration")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try {

            try {
                const text = new EmbedBuilder()
                    .setColor('#245078')
                    .setTitle('**Information**')
                    .setDescription(`Baackup of the server, V${config.bot_version}`)
                    .setFooter({ text: '/backup' })

                var name = 'backup_kochy_bot_v'+ config.bot_version;
                console.log(name)
                await interaction.editReply({
                    embeds: [text], 
                    files: [{
                        attachment: "./settings.json",
                        name: name,
                        description: `Backup wanted by ${interaction.member.displayName}`
                    }],
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