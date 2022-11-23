const {
    EmbedBuilder,
    MessageAttachment
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

            var searchtext = 'yaoi'
            if (await interaction.options.getString('option', false)) {
                searchtext = "yaoi " + await interaction.options.getString('option', true);

            }
            try {
                var offset = Math.floor(Math.random() * (3))
                var headersOpt = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',

                };
                try {
                    var body = requests(
                        {
                            method: 'get',
                            url: 'https://api.qwant.com/search/images/?count=80&q='+encodeURI(searchtext)+'&safesearch=0&t=images&locale=en_us&offset='+offset.toString(),
                            headers: headersOpt,
                        }, function (error, response, body) {
                            //Print the Response
                            console.log(error, body, response)
                            return body
                        });


                    var img = body


                    var url = img.data.result.items[Math.floor(Math.random() * (img.data.result.total))].media
                    log.write(searchtext+ ' ' + url)
                    const text = new EmbedBuilder()
                    .setColor('#6c3483')
                    .setTitle('**Yaoi**')
                    .setDescription(`Here is a image for your search: ${searchtext}`)
                    .setImage(url)
                    .setFooter({
                        text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({
                            extension: 'jpg'
                        })})
                    await interaction.editReply({
                        embeds: [text]
                    });

                }catch (e) {
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