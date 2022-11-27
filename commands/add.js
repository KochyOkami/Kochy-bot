const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add")
        .setDescription("To add a specific parameter.")
        .addStringOption(option =>
            option.setName('option')
                .setDescription('the setting that will be add')
                .addChoices(
                    { name: 'Banned Word', value: 'banned word' },)
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
                    var found = false;

                    if (option === 'banned word') {
                        var word = await interaction.options.getString('value', true);
                        settings.banned_words.forEach(async element => {
                            if (word == element) found = true
                        });
                        console.log(found);
                        if (!found) {
                            settings.banned_words.push(word)
                            console.log(settings.banned_words)
                            const text = new EmbedBuilder()
                                .setColor('#245078')
                                .setTitle('**Information**')
                                .setDescription(`The word **${word}** has been add to the list of banned words.`)
                                .setFooter({ text: '/add `option`' })


                            await interaction.editReply({ embeds: [text] });

                            fs.writeFileSync("./settings.json", JSON.stringify(settings));
                        } else {
                            const text = new EmbedBuilder()
                                .setColor('#245078')
                                .setTitle('**Information**')
                                .setDescription(`The word **${word}** is already in ${option}: \n ` + '`' + settings.banned_words + '`')
                                .setFooter({ text: '/add `option`' })
                            await interaction.editReply({ embeds: [text] });
                        }
                    }

                } catch (error) {
                    log.write(error);
                    const text = new EmbedBuilder()
                        .setColor('#C0392B')
                        .setTitle('**Error**')
                        .setDescription(`There was an error executing /add ${option} : \n` + '```' + error + '```')
                    await interaction.editReply({ embeds: [text] });
                    return;
                }

            } else {
                const text = new EmbedBuilder()
                    .setColor('#F39C12')
                    .setTitle('**Warning**')
                    .setDescription(`The value for the current value is not correct.`)
                    .setFooter({ text: '/add  `option`' })
                await interaction.editReply({ embeds: [text] });
            }
        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /add ${option} : \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }

    }
};