const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
var requests = require('request');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("weekly")
        .setDescription("To claim your weekly cookie."),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

            if (settings.cookie_status == 'off') {
                const text = new EmbedBuilder()
                    .setColor('#C0392B')
                    .setTitle(`**Sorry**`)
                    .setDescription(`Cookie system is in maintenance mode,  please wait for the next update.`)
                    .setThumbnail('attachment://dead-cat.png')
                await interaction.editReply({ embeds: [text], files: [`./images/obj/dead-cat.png`] });
            } else {
                
                var cookie = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'));
                var weekly = eval(JSON.parse(fs.readFileSync('./weekly.json', 'utf8')));

                if (Object.hasOwn(weekly, interaction.user.id)) {
                    if (Math.round(Date.now() / 1000) >= weekly[interaction.user.id]) {
                        cookie[interaction.user.id] = parseInt(cookie[interaction.user.id]) + settings.weekly
                        var time = Math.round(Date.now() / 1000) + (7 * 24 * 60 * 60)

                        weekly[interaction.user.id] = time
                        var toplevel = top(interaction.user.id)

                        const text = new EmbedBuilder()
                            .setColor('#245078')
                            .setTitle(`**You have win ${settings.weekly} 🍪**`)
                            .setDescription(`Come back <t:${time}:R>`)
                            .setFooter({ iconURL: interaction.user.avatarURL(), text: 'Place: #' + toplevel })
                        await interaction.editReply({ embeds: [text] });
                        fs.writeFileSync("./weekly.json", JSON.stringify(weekly))
                        fs.writeFileSync("./cookie.json", JSON.stringify(cookie))


                    } else {
                        var toplevel = top(interaction.user.id)
                        const text = new EmbedBuilder()
                            .setColor('#C0392B')
                            .setTitle(`**Error**`)
                            .setDescription(`You already have take your weekly, come back in <t:${weekly[interaction.user.id]}:R>`)
                            .setFooter({ iconURL: interaction.user.avatarURL(), text: 'Place: #' + toplevel })
                        await interaction.editReply({ embeds: [text] });
                        fs.writeFileSync("./weekly.json", JSON.stringify(weekly))
                        fs.writeFileSync("./cookie.json", JSON.stringify(cookie))

                    }

                } else {
                    if (cookie[interaction.user.id]) {
                        cookie[interaction.user.id] = parseInt(cookie[interaction.user.id]) + settings.weekly
                    } else {
                        cookie[interaction.user.id] = settings.weekly
                    }
                    var time = Math.round(Date.now() / 1000) + (7 * 24 * 60 * 60)
                    weekly[interaction.user.id] = time
                    var toplevel = top(interaction.user.id)
                    const text = new EmbedBuilder()
                        .setColor('#245078')
                        .setTitle(`**You have win ${settings.weekly} 🍪**`)
                        .setDescription(`Come back <t:${time}:R>`)
                        .setFooter({ iconURL: interaction.user.avatarURL(), text: 'Place: #' + toplevel })
                    await interaction.editReply({ embeds: [text] });
                    fs.writeFileSync("./weekly.json", JSON.stringify(weekly))
                    fs.writeFileSync("./cookie.json", JSON.stringify(cookie))
                }

                var myJSONObject = { 'cookie': cookie, 'password': '91784SK8325k0r0lev' };

                //Custom Header pass
                var headersOpt = {
                    "content-type": "application/json",
                };
                requests(
                    {
                        method: 'post',
                        url: settings.cookie_serv + 'cookie.php',
                        form: myJSONObject,
                        headers: headersOpt,
                        json: true,
                    }, function (error, response, body) {
                        //Print the Response
                        log.write('cookie send')
                    });


            }
        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /weekly : \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }

    }
};

function top(user) {
    var top = Array();
    var cookie = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'));

    for (let i in cookie) {
        top.push([cookie[i], i])
    }

    top.sort(function (a, b) {
        return b[0] - a[0];
    });

    var a = [cookie[user], user]
    var toplevel = 0

    while (toplevel < top.length && !top[toplevel].equals(a)) {
        toplevel++
    }
    return toplevel + 1
}