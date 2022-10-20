const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('/home/pi/Desktop/Kochy-bot/logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("blacklist")
        .setDescription("To set a specific channel, for books.")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the user')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('add')
                .setDescription("Add for add the user or Remove for remove the user. Add by default")
                .addChoices(
                    { name: 'Add', value: 'add' },
                    { name: 'Remove', value: 'remove' },)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels || PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            if (await interaction.options.getString('add', false)) {
                try {
                    var add = await interaction.options.getString('add', false);

                    if (add == 'remove') {

                        var user = await interaction.options.getUser('user', true);
                        var settings = JSON.parse(fs.readFileSync('/home/pi/Desktop/Kochy-bot/settings.json', 'utf8'));

                        if (settings.blacklist.indexOf(user.id) != -1) {
                            settings.blacklist.splice(settings.blacklist.indexOf(user.id), settings.blacklist.indexOf(user.id))
                        } else {
                            log.write( user.id + 'is not in the blacklist');
                            const text = new EmbedBuilder()
                                .setColor('#FF0000')
                                .setTitle('**Warrning**')
                                .setDescription(`${user}  alreadi not in the blacklist`)
                            await interaction.editReply({ embeds: [text] });
                            return;
                        }

                        settings.blacklist.push(user.id);

                        const text = new EmbedBuilder()
                            .setColor('#245078')
                            .setTitle('**Information**')
                            .setDescription(`This channel are now the channel for the ${option} !`)
                            .setFooter({ text: '/set `option`' })

                        await interaction.editReply({ embeds: [text] });
                        fs.writeFileSync("/home/pi/Desktop/Kochy-bot/settings.json", JSON.stringify(settings));
                        return;

                    } else {

                    }



                } catch (error) {
                    log.write(error);
                    const text = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('**Error**')
                        .setDescription(`There was an error executing /set ${option} : \n` + '```' + error + '```')
                    await interaction.editReply({ embeds: [text] });
                    return;
                }

            } else {
                try {
                    var user = await interaction.options.getUser('user', true);
                    let settings = JSON.parse(fs.readFileSync('/home/pi/Desktop/Kochy-bot/settings.json', 'utf8'));

                    settings.blacklist.push(user.id);

                    const text = new EmbedBuilder()
                        .setColor('#245078')
                        .setTitle('**Information**')
                        .setDescription(`This channel are now the channel for the ${option} !`)
                        .setFooter({ text: '/set `option`' })

                    await interaction.editReply({ embeds: [text] });
                    fs.writeFileSync("/home/pi/Desktop/Kochy-bot/settings.json", JSON.stringify(settings));
                    return;

                } catch (error) {
                    log.write(error);
                    const text = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('**Error**')
                        .setDescription(`There was an error executing /set ${option} : \n` + '```' + error + '```')
                    await interaction.editReply({ embeds: [text] });
                    return;
                }
            }

        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /set ${option} : \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }

    }
};