const {
    EmbedBuilder,
} = require('discord.js');
const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const {
    PermissionFlagsBits,
    AttachmentBuilder
} = require('discord.js');
var requests = require('request');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("yaoi")
        .setDescription("Give you a yaoi picture ^^")
        .addStringOption(option =>
            option.setName('option')
                .setDescription('key word for the research')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.AttachFiles),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
            if (settings.yaoi_status === 'on') {


                var banned_words = settings.banned_words;
                var ban = false
                var searchtext = 'yaoi'
                if (await interaction.options.getString('option', false)) {
                    searchtext = "yaoi " + await interaction.options.getString('option', true);
                    await banned_words.forEach(async function (banned) {

                        if (searchtext.toLowerCase().match(banned)) {
                            ban = true
                            log.write(searchtext);
                            const attachment = new AttachmentBuilder("./images/forbiden.png", { name: 'forbiden.png' });

                            const text = new EmbedBuilder()
                                .setColor('#C0392B')
                                .setTitle('**Error**')
                                .setDescription(`Sorry but we have detected a banned word to your request: ${searchtext} - > ${banned}`)
                                .setImage('attachment://forbiden.png')
                            await interaction.editReply({
                                embeds: [text],
                                files: [attachment]
                            });
                            return;
                        }
                    });

                }
                if (!ban) {
                    try {
                        var offset = Math.floor(Math.random() * (10))
                        var headersOpt = {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
                        };
                        try {
                            requests(
                                {
                                    method: 'get',
                                    url: 'https://api.qwant.com/V3/search/images/?count=50&q=' + encodeURI(searchtext) + '&safesearch=0&t=images&locale=en_us&offset=' + offset.toString(),
                                    headers: headersOpt,
                                }, async function (error, response, body) {
                                    //Print the Response
                                    var resultat = JSON.parse(body)
                                    if (resultat.data.result.total > 0) {
                                        var url = resultat.data.result.items[Math.floor(Math.random() * (resultat.data.result.total))].media
                                        while (url.toString().match('myreadingmanga')) {
                                            url = resultat.data.result.items[Math.floor(Math.random() * (resultat.data.result.total))].media
                                            console.log('error in url')
                                        }
                                        log.write(searchtext + ' ' + url)
                                        const text = new EmbedBuilder()
                                            .setColor('#6c3483')
                                            .setTitle('**Yaoi**')
                                            .setDescription(`Here is a image for your search: __${searchtext}__`)
                                            .setImage(url)
                                            .setFooter({
                                                text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({
                                                    extension: 'jpg'
                                                })
                                            })
                                        var message = await interaction.editReply({
                                            embeds: [text],
                                            fetchReply: true
                                        });
                                        message.react('<:forbbiden:1046436266046136321>')
                                        const filter = (reaction, user) => true && true
                                        await message.awaitReactions({ filter, max: 1, time: 6_000, errors: ['time'] })
                                            .then(collected => {
                                                console.log(collected)
                                                message.deleteReply()
                                                    .catch(error => console.error(error))
                                            })
                                            .catch(collected => {
                                                console.log(collected)
                                                message.reactions.removeAll()
                                                    .catch(error => console.error('Failed to clear reactions:', error));
                                            });
                                    } else {
                                        const attachment = new AttachmentBuilder("./images/sora_sad.png", { name: 'sad.png' });

                                        const text = new EmbedBuilder()
                                            .setColor('#6c3483')
                                            .setTitle('**Yaoi**')
                                            .setDescription(`Notings found for: __${searchtext}__`)
                                            .setImage('attachment://sad.png')
                                            .setFooter({
                                                text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({
                                                    extension: 'jpg'
                                                })
                                            })
                                        await interaction.editReply({
                                            embeds: [text],
                                            files: [attachment]
                                        });
                                    }
                                });

                        } catch (e) {
                            log.write(e);
                            const text = new EmbedBuilder()
                                .setColor('#C0392B')
                                .setTitle('**Error**')
                                .setDescription(`There was an error executing /yaoi : 1 \n` + '```' + e + '```')
                            await interaction.editReply({
                                embeds: [text]
                            });
                            return;
                        }
                        return;

                    } catch (error) {
                        log.write(error);
                        const text = new EmbedBuilder()
                            .setColor('#C0392B')
                            .setTitle('**Error**')
                            .setDescription(`There was an error executing /yaoi : 2\n` + '```' + error + '```')
                        await interaction.editReply({
                            embeds: [text]
                        });
                        return;
                    }
                }
            } else {
                const attachment = new AttachmentBuilder("./images/sora_sad.png", { name: 'sad.png' });

                const text = new EmbedBuilder()
                    .setColor('#6c3483')
                    .setTitle('**Yaoi**')
                    .setDescription(`Sorry but the command /yaoi is disabled.`)
                    .setImage('attachment://sad.png')
                    .setFooter({text: '/set `Yaoi Status` `on` to enable it.'})
                await interaction.editReply({
                    embeds: [text],
                    files: [attachment]
                });

            }


        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /yaoi : \n` + '```' + error + '```')
            await interaction.editReply({
                embeds: [text]
            });
            return;

        }
    }
};