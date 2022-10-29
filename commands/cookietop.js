const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const config = require('../config');
const { PermissionFlagsBits } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("cookietop")
        .setDescription("For see the top.")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the persone near of top')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            if (await interaction.options.getUser('user', false)) {
                console.log("e")

            } else {
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
                        values += "`#" + (index +1) + "` <@" + await interaction.client.users.fetch(top[index][1]) + ">\n<:vide:1035917668089352303>    ➥ "+top[index][0] +" :cookie:\n";
                    } catch {
                        values += "`#" + (index + 1) + "` " + top[index] + "\n";
                    }
                }
                var icon = interaction.guild.iconURL()
                if (icon == null){
                    icon = config.avatar
                }
                const text = new EmbedBuilder()
                    .setColor('#245078')
                    .setTitle("**" + interaction.guild.name + " Classement: **")
                    .setDescription(values)
                    .setThumbnail(icon)
                //.setAuthor({ name: `${interaction.user.username}`, iconURL: `${interaction.user.avatarURL({ dynamic: true, size: 512 })}` })
                await interaction.editReply({ embeds: [text] });
                return;
            }
        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#FF0000')
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