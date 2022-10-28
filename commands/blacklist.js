const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("blacklist")
        .setDescription("To set a specific channel, for books.")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the user')
                .setRequired(false))
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
            if (await interaction.options.getUser('user', false)) {
                try {
                    var add = await interaction.options.getString('add', false);

                    if (add == 'remove') {

                        var user = await interaction.options.getUser('user', true);
                        var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

                        if (settings.blacklist.indexOf(user.id) != -1) {
                            for (var i = 0; i < settings.blacklist.length; i++) {

                                if (settings.blacklist[i] === user.id) {

                                    settings.blacklist.splice(i, 1);
                                }

                            }

                            log.write(user + ' is not in the blacklist');
                            const text = new EmbedBuilder()
                                .setColor('#245078')
                                .setTitle('**Information**')
                                .setDescription(`${user} as been remove from the blacklist`)
                            await interaction.editReply({ embeds: [text] })
                                .catch(err => log.write(err));
                        } else {
                            log.write(user + ' is not in the blacklist');
                            const text = new EmbedBuilder()
                                .setColor('#FF0000')
                                .setTitle('**Warrning**')
                                .setDescription(`${user} is not in the blacklist`)
                            await interaction.editReply({ embeds: [text] })
                                .catch(err => log.write(err));
                            return;
                        }

                        fs.writeFileSync("./settings.json", JSON.stringify(settings));
                        return;

                    } else {

                        var user = await interaction.options.getUser('user', true);
                        var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

                        if (settings.blacklist.indexOf(user.id) != -1) {
                            delete blacklist[settings.blacklist.indexOf(user.id)]
                        } else {
                            settings.blacklist.push(user.id);
                            log.write(user.id + 'has been add to the blacklist');
                            const text = new EmbedBuilder()
                                .setColor('#245078')
                                .setTitle('**Information**')
                                .setDescription(`${user} has been add to the blacklist`)
                            await interaction.editReply({ embeds: [text] });
                        }

                        fs.writeFileSync("./settings.json", JSON.stringify(settings));
                        return;
                    }

                } catch (error) {
                    log.write(error);
                    const text = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('**Error**')
                        .setDescription(`There was an error executing /blacklist: \n` + '```' + error + '```')
                    await interaction.editReply({ embeds: [text] });
                    return;
                }

            } else {
                try {
                    var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
                    if (settings.blacklist.length == 0) {
                        const text = new EmbedBuilder()
                            .setColor('#245078')
                            .setTitle('**Information**')
                            .setDescription(`There is not user in the blacklist`)
                            .setFooter({ text: '/blacklist `option`' })

                        await interaction.editReply({ embeds: [text] });
                    } else {
                        var values = ""
                        for (let index = 0; index < settings.blacklist.length; index++) {
                            try {
                                values += "  * <@" + settings.blacklist[index] + `> \n`;
                            } catch (e) {
                                console.log(e)
                            }
                        }
                        const text = new EmbedBuilder()
                            .setColor('#245078')
                            .setTitle('**Information**')
                            .setDescription(`User in the blacklist:\n${values}`)
                            .setFooter({ text: '/blacklist `option`' })

                        await interaction.editReply({ embeds: [text] });
                    }

                    fs.writeFileSync("./settings.json", JSON.stringify(settings));
                    return;

                } catch (error) {
                    log.write(error);
                    const text = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('**Error**')
                        .setDescription(`There was an error executing /blacklist : \n` + '```' + error + '```')
                    await interaction.editReply({ embeds: [text] });
                    return;
                }
            }

        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /blacklist : \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }

    }
};