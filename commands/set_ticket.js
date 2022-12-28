const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ButtonBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set_ticket")
        .setDescription("For set the ticket system.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        await interaction.deferReply();
        var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

        //If the ticket system is not enable:
        if (settings.ticket_status == 'off') {
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle(`**Sorry**`)
                .setDescription(`Ticket system isn't on, please enable it.`)
                .setThumbnail('attachment://dead-cat.png')
                .setFooter({ text: '/set Ticket status on' })
            await interaction.editReply({ embeds: [text], files: [`./images/obj/dead-cat.png`] });
            var interval = setTimeout(async () => { try { await interaction.deleteReply() } catch { } }, 10 * 1000)

        }   
        //else send the message.
        else if (settings.ticket_status === 'on'){
            try {
                const button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`create_ticket`)
                            .setLabel('Create a Ticket')
                            .setStyle(ButtonStyle.Primary),
                    );

                var text = new EmbedBuilder()
                    .setColor('#245078')
                    .setTitle('**Ticket**')
                    .setDescription("If you have any problems on the server, you can create a ticket. Thank's the avoid abuse of tickets or you will be sanctioned.");

                await interaction.channel.send({ embeds: [text], components: [button] })
                await interaction.editReply('done');
                await interaction.deleteReply()
                return;
            } catch (error) {
                log.write(error);
                const text = new EmbedBuilder()
                    .setColor('#C0392B')
                    .setTitle('**Error**')
                    .setDescription(`There was an error executing /set_ticket : \n` + '```' + error + '```')
                await interaction.editReply({ embeds: [text] });
                return;
            }
        }

    }
};