const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Responds with the list of commands available, and information about KochyBot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages || PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply()
        const text = new EmbedBuilder()
            .setColor("#245078")
            .setTitle('**Help menu**')
            .setDescription('All commands and their informations:')
            .addFields(
                { name: '/help :', value: 'Show all commands and their informations.' },
                { name: '/link `channel` `*2channel` `*double way` :', value: 'Synchronise channel together `1arg` and `2arg` is the ChannelId or the RoomId of the channel.\
                                         All message send to linked channel will be send to their linked channel' },
                { name: '/unlink `id` `delete` :', value: 'Unlink all channel where this command is currently send, Optionnal `channel`if you want to unlink\
                                         a specific channel. And `delete` is for only unlink the specified channel.'},
                { name: '/unlink_img `id` `delete` :', value: 'Unlink all save img channels where this command is currently send, Optionnal `channel`if you want to unlink\
                                         a specific channel. And `delete` is for only unlink the specified channel.'},
                { name: '/show_link `*all` :', value: 'Show with witch channel this channel is linked. Option `all`, true for see all links.' },
                { name: "/set `option` `*id` :", value: "Set channel to specifiqe channel. Option for use a other channel. Option: `Book Hard`, `Book Light`."},
                { name: "/say `text` `*user` :", value: "To send a message with the bot or is `user` is passed to send message with the user name/avatar."},
                { name: "/book `type` `title` `author` `description` `language` `link` `*image` :", value: "To share a book, the `type` is for the NSFW\
                                         classification of the book. An image can be put in option do illustrate the book."},
                {name: "save_img `channel` `*2channel` `*double way` :", value: 'Synchronise only img of channels together `1arg` and `2arg` is the ChannelId.\
                                        All file attached will be send to linked channel' }

            )
        interaction.editReply({ embeds: [text] })
        return;
    }
};

//'\u200B' => '  '