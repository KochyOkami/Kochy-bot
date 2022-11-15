const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const config = require('../config');
const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
var requests = require('request');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("topcookie")
        .setDescription("For see the top."),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
            if (settings.cookie_status == "off") {
                const text = new EmbedBuilder()
                    .setColor('#C0392B')
                    .setTitle(`**Sorry**`)
                    .setDescription(`Cookie system is in maintenance mode,  please wait for the next update.`)
                    .setThumbnail('attachment://dead-cat.png')
                await interaction.editReply({ embeds: [text], files: [`./images/obj/dead-cat.png`] });
            }
            else {

                var top = Array();
                var cookie = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'));

                for (let i in cookie) {
                    top.push([cookie[i], i])
                }

                top.sort(function (a, b) {
                    return b[0] - a[0];
                });
                var values = "";

                for (let index = 0; index < 5; index++) {
                    try {
                        values += "`#" + (index + 1) + "` <@" + await interaction.client.users.fetch(top[index][1]) + ">\n<:vide:1035917668089352303>    ➥ " + top[index][0] + " :cookie:\n";
                    } catch {
                        values += "`#" + (index + 1) + "` " + top[index] + "\n";
                    }
                }
                var icon = interaction.guild.iconURL()
                if (icon == null) {
                    icon = config.avatar
                }
                const button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setURL('http://yaoicute.fr/cookie_top.php') 
                            .setLabel('See all the top')
                            .setStyle(ButtonStyle.Link),
                    );

               
                const text = new EmbedBuilder()
                    .setColor('#245078')
                    .setTitle("**" + interaction.guild.name + " Classement: **")
                    .setDescription(values)
                    .setThumbnail(icon)
                //.setAuthor({ name: `${interaction.user.username}`, iconURL: `${interaction.user.avatarURL({ dynamic: true, size: 512 })}` })
                var myJSONObject = { 'cookie': cookie, 'password': '91784SK8325k0r0lev' };

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
                        log.write('cookie send')
                    });

                await interaction.editReply({ embeds: [text], components: [button]});
                return;

            }
        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /cookie : \n` + '```' + error + '```')
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