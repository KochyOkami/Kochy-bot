const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("yaoi")
        .setDescription("Show with witch channel this channel is linked. ")
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of the book.')
                .addChoices(
                    { name: 'Light', value: 'light' },
                    { name: 'Hard', value: 'hard' },)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('The title of the book.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('author')
                .setDescription('The author of the book.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('A description of the book, a sort text who resume the book.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('language')
                .setDescription('The language of the book.')
                .addChoices(
                    { name: 'English', value: 'english' },
                    { name: 'French', value: 'french' },
                    { name: 'Japanese', value: 'japanese' },
                    { name: 'Korean', value: 'korean' },
                    { name: 'Other', value: 'other' },)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('link')
                .setDescription('The link to see or download the book, you can put your files in hour website: YaoiCute.fr.')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('A immage to ilustrate the book, you can put your files in hour website: YaoiCute.fr.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages | PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

        try {
            var type = await interaction.options.getString('type', true);
            var title = await interaction.options.getString('title', true);
            var author = await interaction.options.getString('author', true);
            var description = await interaction.options.getString('description', true);
            var language = await interaction.options.getString('language', true);
            var link = await interaction.options.getString('link', true);
            var image = await interaction.options.getAttachment('image', false);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel(`Download ${title} `)
                        .setURL(link)
                        .setStyle(ButtonStyle.Link),
                );
            var text = new EmbedBuilder()
                .setColor('#ff36c5')
                .setTitle(title)
                .addFields({ name: 'Author', value: author })
                .addFields({ name: 'Synopsis', value: description })
                .setFooter({ text: language })

            if (await interaction.options.getAttachment('image')) {
                text.setImage(image.url)
                    .setThumbnail(image.url)

            } else {
                
                text.setThumbnail(config.unknown_book)
            }


            var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
            var links_list = eval(settings.links_list);
            var channel = ""
            
            if (type === 'light') {
                if (settings.light_book == "") {
                    const text = new EmbedBuilder()
                        .setColor('#C0392B')
                        .setTitle('**Error**')
                        .setDescription('The channel to send the book is not defined.')
                        .setFooter({ text: '/set `Yaoi Light` `id`' })
                    interaction.editReply({ embeds: [text] });
                    return;
                }
                try {
                    if (links_list[settings.light_book]){
                        links_list[settings.light_book].forEach(async function (link) {
                            channel = await interaction.client.channels.fetch(link, true)
                            await channel.send({ embeds: [text], components: [row] });
                        })
                        channel = await interaction.client.channels.fetch(ssettings.light_book, true)
                        await channel.send({ embeds: [text], components: [row] });
                    }else{
                        const channel = await interaction.client.channels.fetch(settings.light_book, true)
                        await channel.send({ embeds: [text], components: [row] });
                    }
                    await interaction.deleteReply();

                } catch (error) {
                    log.write(error);
                    const text = new EmbedBuilder()
                        .setColor('#C0392B')
                        .setTitle('**Error**')
                        .setDescription(`There was an error executing /yaoi: \n` + '```' + error + '```')
                    await interaction.editReply({ embeds: [text] });
                    return;
                }
            } else if (type === 'hard') {
                if (settings.hard_book == "") {
                    const text = new EmbedBuilder()
                        .setColor('#C0392B')
                        .setTitle('**Error**')
                        .setDescription('The channel to send the book is not defined.')
                        .setFooter({ text: '/set `Yaoi Hard` `id`' })
                    interaction.editReply({ embeds: [text] });
                    return;
                }
                try {

                    if (links_list[settings.hard_book]){

                        links_list[settings.hard_book].forEach(async function (link) {

                            channel = await interaction.client.channels.fetch(link, true)
                            await channel.send({ embeds: [text], components: [row] });
                        })
                        channel = await interaction.client.channels.fetch(settings.hard_book, true)
                        await channel.send({ embeds: [text], components: [row] });
                        
                    }else{
                        const channel = await interaction.client.channels.fetch(settings.hard_book, true)
                        await channel.send({ embeds: [text], components: [row] });
                    }
                    await interaction.deleteReply();

                } catch (error) {
                    log.write(error);
                    const text = new EmbedBuilder()
                        .setColor('#C0392B')
                        .setTitle('**Error**')
                        .setDescription(`There was an error executing /yaoi: \n` + '```' + error + '```')
                    await interaction.editReply({ embeds: [text] });
                    return;
                }
            }

        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /yaoi: \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }
    }
};