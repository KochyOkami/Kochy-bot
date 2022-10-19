const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('/home/pi/Desktop/Kochy-bot/logs/logBuilder.js');
const { PermissionFlagsBits } = require('discord.js');
const config = require('/home/pi/Desktop/Kochy-bot/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("backup")
        .setDescription("Send a backup of the bot configuration")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild || PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try {

            try {
                const text = new EmbedBuilder()
                    .setColor('#245078')
                    .setTitle('**Information**')
                    .setDescription(`Backup of the server, V${config.bot_version}`)
                    .setFooter({ text: '/backup' })

                var name = 'backup_kochy_bot_v'+ config.bot_version + '.json';
                console.log(name)
                await interaction.editReply({
                    embeds: [text], 
                    files: [{
                        attachment: "/home/pi/Desktop/Kochy-bot/settings.json",
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