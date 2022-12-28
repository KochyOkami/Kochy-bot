const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("To remove a specific parameter.")
        .addStringOption(option =>
            option.setName('option')
                .setDescription('the setting that will be removed')
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
                            const text = new EmbedBuilder()
                                .setColor('#245078')
                                .setTitle('**Information**')
                                .setDescription(`The word **${word}** is not in ${option}: \n ` + '`' + settings.banned_words + '`')
                                .setFooter({ text: 'Check the orthograph.`' })
                            await interaction.editReply({ embeds: [text] });


                        } else {

                            settings.banned_words = settings.banned_words.filter(name => name != word)
                            console.log(settings.banned_words)
                            const text = new EmbedBuilder()
                                .setColor('#245078')
                                .setTitle('**Information**')
                                .setDescription(`The word **${word}** has been remove to the list of banned words.`)
                                .setFooter({ text: '/remove `option`' })


                            await interaction.editReply({ embeds: [text] });

                            fs.writeFileSync("./settings.json", JSON.stringify(settings));
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
                    .setFooter({ text: '/remove `option`' })
                await interaction.editReply({ embeds: [text] });
            }
        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /remove ${option} : \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }

    }
};