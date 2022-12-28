const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');
var requests = require('request');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cookie_remove")
        .setDescription("Remove a cookie to someone 🍪")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('How many cookie do you want to remove ?')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild || PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
            var user = await interaction.options.getUser('user');
            var cookies = await interaction.options.getInteger('amount')

            try {
                var cookie = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'));
                if (!cookie[user.id]) {
                    cookie[user.id] = 0

                } else {
                    if (cookie[user.id] >= parseInt(cookies)) {
                        cookie[user.id] = parseInt(cookie[user.id]) - parseInt(cookies)
                    } else {
                        cookie[user.id] = 0
                    }

                }
                fs.writeFileSync("./cookie.json", JSON.stringify(cookie))
                var myJSONObject = { 'cookie': cookie, 'password': settings.server_password };

                //Custom Header pass
                var headersOpt = {
                    "content-type": "application/json",
                };
                requests(
                    {
                        method: 'post',
                        url: settings.cookie_serv + 'cookie_post.php',
                        form: myJSONObject,
                        headers: headersOpt,
                        json: true,
                    }, function (error, response, body) {
                        //Print the Response
                        log.write('cookie send' + response)
                    });

                const text = new EmbedBuilder()
                    .setColor('#245078')
                    .setDescription('`' + cookies + '` :cookie: was removed to <@' + user + '>')
                    .setFooter({ iconURL: user.avatarURL(), text: 'Cookie box : ' + cookie[user.id] + ' 🍪' })
                await interaction.editReply({ embeds: [text], ephemeral: true });
                return;

            } catch (error) {
                log.write(error);
                const text = new EmbedBuilder()
                    .setColor('#C0392B')
                    .setTitle('**Error**')
                    .setDescription(`There was an error executing /cookie_remove : \n` + '```' + error + '```')
                await interaction.editReply({ embeds: [text] });
                return;
            }

        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /cookie_remove : \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }

    }
};