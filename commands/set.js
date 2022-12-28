const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set")
        .setDescription("To set a specific channel, for books.")
        .addStringOption(option =>
            option.setName('option')
                .setDescription('the setting that will be set')
                .addChoices(
                    { name: 'Book Light', value: 'book light' },
                    { name: 'Book Hard', value: 'book hard' },
                    { name: 'Box chance', value: 'box chance' },
                    { name: 'Box winning', value: 'box winning' },
                    { name: 'Cookie message', value: 'cookie' },
                    { name: 'Daily', value: 'daily' },
                    { name: 'Weekly', value: 'weekly' },
                    { name: 'Weekly status', value: 'cookie status' },
                    { name: 'Yaoi status', value: 'yaoi status' },
                    { name: 'Waiting time', value: 'waiting' },
                    { name: 'Waiting Role', value: 'role' },)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('value')
                .setDescription("the value for the current value")
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels || PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            if (await interaction.options.getString('value', false)) {
                try {
                    var option = await interaction.options.getString('option', true);
                    let settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

                    if (option === 'book hard') {
                        settings.hard_book = await interaction.client.channels.fetch(await interaction.options.getString('value', true));

                    } else if (option === 'book light') {
                        settings.light_book = await interaction.client.channels.fetch(await interaction.options.getString('value', true));

                    } else if (option === 'box chance') {
                        settings.box_chance = parseInt(await interaction.options.getString('value', false))

                    } else if (option === 'box winning') {
                        settings.box_gain = parseInt(await interaction.options.getString('value', false))

                    } else if (option === 'cookie') {
                        settings.cookie_add = parseInt(await interaction.options.getString('value', false))

                    } else if (option === 'daily') {
                        settings.daily = parseInt(await interaction.options.getString('value', false))

                    } else if (option === 'weekly') {
                        settings.weekly = parseInt(await interaction.options.getString('value', false))
                        
                    } else if (option === 'cookie status') {
                        value = await interaction.options.getString('value', false)
                        if (value === 'on'){
                            settings.cookie_status = "on"
                        }else if (value === 'off'){
                            settings.cookie_status = "off"
                        }

                    } else if (option === 'yaoi status') {
                        value = await interaction.options.getString('value', false)
                        if (value === 'on'){
                            settings.yaoi_status = "on"
                        }else if (value === 'off'){
                            settings.yaoi_status = "off"
                        }
                    } else if (option === 'waiting') {
                        settings.waiting_time = parseInt(await interaction.options.getString('value', false))

                    }
                    else if (option === 'role') {

                        if (await interaction.guild.roles.fetch(await interaction.options.getString('value'))) {
                            settings.waiting_role = await interaction.options.getString('value')
                            const text = new EmbedBuilder()
                                .setColor('#245078')
                                .setTitle('**Information**')
                                .setDescription(`The value for ${option} is now ${await interaction.guild.roles.fetch(await interaction.options.getString('value'))}`)
                                .setFooter({ text: '/set `option`' })


                            await interaction.editReply({ embeds: [text] });
                            fs.writeFileSync("./settings.json", JSON.stringify(settings));
                            return;
                        } else {
                            const text = new EmbedBuilder()
                                .setColor('#F39C12')
                                .setTitle('**Warning**')
                                .setDescription(`Invalid role id, please give a role id.`)
                                .setFooter({ text: '/set `option`' })


                            await interaction.editReply({ embeds: [text] });
                            return
                        }

                    }



                    const text = new EmbedBuilder()
                        .setColor('#245078')
                        .setTitle('**Information**')
                        .setDescription(`The value for ${option} is now ${await interaction.options.getString('value', false)}`)
                        .setFooter({ text: '/set `option`' })


                    await interaction.editReply({ embeds: [text] });
                    fs.writeFileSync("./settings.json", JSON.stringify(settings));
                    return;

                } catch (error) {
                    log.write(error);
                    const text = new EmbedBuilder()
                        .setColor('#C0392B')
                        .setTitle('**Error**')
                        .setDescription(`There was an error executing /set ${option} : \n` + '```' + error + '```')
                    await interaction.editReply({ embeds: [text] });
                    return;
                }

            } else {
                try {
                    var option = await interaction.options.getString('option', true);
                    let settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

                    if (option === 'book hard') {
                        settings.hard_book = interaction.channelId;

                    } else if (option === 'book light') {
                        settings.light_book = interaction.channelId;

                    }

                    const text = new EmbedBuilder()
                        .setColor('#245078')
                        .setTitle('**Information**')
                        .setDescription(`This channel are now the channel for the ${option} !`)
                        .setFooter({ text: '/set `option`' })


                    await interaction.editReply({ embeds: [text] });
                    fs.writeFileSync("./settings.json", JSON.stringify(settings));
                    return;

                } catch (error) {
                    log.write(error);
                    const text = new EmbedBuilder()
                        .setColor('#C0392B')
                        .setTitle('**Error**')
                        .setDescription(`There was an error executing /set ${option} : \n` + '```' + error + '```')
                    await interaction.editReply({ embeds: [text] });
                    return;
                }
            }
        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /set ${option} : \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }

    }
};