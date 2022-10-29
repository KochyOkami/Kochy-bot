const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');

// Warn if overriding existing method
if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;
    // if the argument is the same array, we can be sure the contents are same as well
    if (array === this)
        return true;
    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false });

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cookie")
        .setDescription("For see the amount of your cookie of someone else.")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the user')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            var user = interaction.user;
            if (await interaction.options.getUser('user', false)) {
                user = await interaction.options.getUser('user', true);
            }
            try {
                var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
                var cookie = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'));
                if (!cookie[user.id]) {
                    cookie[user.id] = 0
                    fs.writeFileSync("./cookie.json", JSON.stringify(cookie))  
                }
                var toplevel = top(user.id)
                const text = new EmbedBuilder()
                    .setColor('#245078')
                    .setDescription('Cookie box `' + cookie[user.id] + '` :cookie:')
                    .setFooter({ iconURL: user.avatarURL(), text: 'Place: #' + toplevel })
                //.setAuthor({ name: `${interaction.user.username}`, iconURL: `${interaction.user.avatarURL({ dynamic: true, size: 512 })}` })
                await interaction.editReply({ embeds: [text] });
                return;

            } catch (error) {
                log.write(error);
                const text = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('**Error**')
                    .setDescription(`There was an error executing /cookie : \n` + '```' + error + '```')
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