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
        .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

            var searchtext = 'yaoi'
            if (await interaction.options.getString('option', false)) {
                searchtext = await interaction.options.getString('option', true);
            }
            try {
                //Custom Header pass
                console.log('fr')

                var offset =Math.floor(Math.random() * (100))
                var headersOpt = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',

                };
                requests(
                    {
                        method: 'get',
                        url: 'https://api.qwant.com/V3/search/images/?count=1&q=yaoi&safesearch=0&locale=en_us&offset='+offset.toString(),
                        headers: headersOpt,
                    }, async function (error, response, body) {
                        //Print the Response
                        console.log(body)
                        console.log(body["result"])
                        console.log(body["result"]["items"][0]["media_fulsize"])
                    });

                //.setAuthor({ name: `${interaction.user.username}`, iconURL: `${interaction.user.avatarURL({ dynamic: true, size: 512 })}` })
                // await interaction.editReply({ files: [attachment] });
                //await interaction.editReply('finished')
                return;

            } catch (error) {
                log.write(error);
                const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /cookie : \n` + '```' + error + '```')
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
            .setDescription(`There was an error executing /cookie : \n` + '```' + error + '```')
            await interaction.editReply({
                embeds: [text]
            });
            return;
        }

    }
};