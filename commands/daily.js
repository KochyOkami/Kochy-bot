const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("To claim your daily cookie."),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle(`**Sorry**`)
                .setDescription(`Cookie system is in maintenance mode,  please wait for the next update.`)
                .setThumbnail('attachment://dead-cat.png')
            await interaction.editReply({ embeds: [text], files: [`./images/obj/dead-cat.png`] });
            /* var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
            var cookie = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'));
            var daily = eval(JSON.parse(fs.readFileSync('./daily.json', 'utf8')));
            
            if (Object.hasOwn(daily, interaction.user.id)) {
                if (Math.round(Date.now() / 1000) >= daily[interaction.user.id]) {
                    cookie[interaction.user.id] += settings.daily
                    var time = Math.round(Date.now()/ 1000) + (12 * 60 * 60)

                    daily[interaction.user.id] = time
                    var toplevel = top(interaction.user.id)

                    const text = new EmbedBuilder()
                        .setColor('#245078')
                        .setTitle(`**You have win ${settings.daily} 🍪**`)
                        .setDescription(`Come back in <t:${time}:R>`)
                        .setFooter({ iconURL: interaction.user.avatarURL(), text: 'Place: #' + toplevel })
                    await interaction.editReply({ embeds: [text] });
                    fs.writeFileSync("./daily.json", JSON.stringify(daily)) 
                    fs.writeFileSync("./cookie.json", JSON.stringify(cookie)) 
                    return
                } else {
                    var toplevel = top(interaction.user.id)
                    const text = new EmbedBuilder()
                        .setColor('#C0392B')
                        .setTitle(`**Error**`)
                        .setDescription(`You already have take your daily, come back in <t:${daily[interaction.user.id]}:R>`)
                        .setFooter({ iconURL: interaction.user.avatarURL(), text: 'Place: #' + toplevel })
                    await interaction.editReply({ embeds: [text] });
                    fs.writeFileSync("./daily.json", JSON.stringify(daily)) 
                    fs.writeFileSync("./cookie.json", JSON.stringify(cookie)) 
                    return
                }
            } else {
                if (cookie[interaction.user.id]){
                    cookie[interaction.user.id] += settings.daily
                }else {
                    cookie[interaction.user.id] = settings.daily
                }
                var time = Math.round(Date.now()/ 1000) + (12 * 60 * 60)
                daily[interaction.user.id] = time
                var toplevel = top(interaction.user.id)
                const text = new EmbedBuilder()
                    .setColor('#245078')
                    .setTitle(`**You have win ${settings.daily} 🍪**`)
                    .setDescription(`Come back in <t:${time}:R>`)
                    .setFooter({ iconURL: interaction.user.avatarURL(), text: 'Place: #' + toplevel })
                await interaction.editReply({ embeds: [text] });
                fs.writeFileSync("./daily.json", JSON.stringify(daily)) 
                fs.writeFileSync("./cookie.json", JSON.stringify(cookie)) 
                return
            } */
        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /daily : \n` + '```' + error + '```')
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