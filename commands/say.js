const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Unlink a specific channel or the current channel if their not specified.")
        .addStringOption(option =>
            option.setName('text')
                .setDescription('the text to be sent to the channel')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('if you want to say something with the name of somemone ;)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages || PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            var text = await interaction.options.getString('text', true);
            if (await interaction.options.getUser('user', false)) {
                var user = await interaction.options.getUser('user', true);
                var webhook = await find_webhook(interaction, interaction.channelId)
                await webhook.send({
                    content: text,
                    username: user.username,
                    avatarURL: user.avatarURL()
                });

            }else{
                await interaction.channel.send(text)
            }
            await interaction.deleteReply();
            return;
        } catch (error) {
            //log the error message.

            log.write(error, interaction.member, interaction.channel);
            const texte = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /say ${text} : \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [texte] });
            return;


        }
    }
};

async function find_webhook(interaction, channel_id) {
    /**
     * Create a webhook for the specified channel if he is not already registered to the webhook server.
     * 
     * @param {Discord.Message} message The message who the command process is associated with.
     * @param {string} channel_id The ID of the channel who the webhook will be associated with.
     * @return  Return nothings, but the webhook_list has been edited.
     */
    const channel = await interaction.client.channels.fetch(channel_id);
    try {

        //check if the channel already have a webhook.
        var wbs = await channel.fetchWebhooks()

        //find all webhooks who named YaoiCute_bot.
        if (wbs.find(Webhook => Webhook.name === 'YaoiCute_bot')) {

            var webhooks_already_registered = [];
            var no = []

            Array.from(wbs.values()).filter(Webhook => Webhook.name === 'Kochy_bot' || Webhook.name === 'KochyBot').forEach(function (webhook) { no.push(webhook.id); });

            Array.from(wbs.values()).filter(Webhook => Webhook.name === 'YaoiCute_bot').forEach(function (webhook) { webhooks_already_registered.push(webhook.id); });

            no.forEach(async function (id) {
                var wb = await bot.fetchWebhook(id);
                wb.delete('They have too much webhook :(');
                log.write('webhook ' + Array.from(wbs.values()).filter(Webhook => Webhook.id === id) + 'has been deleted');
            });

            if (webhooks_already_registered.length > 1) {
                //keep the first if multiple webhooks are found.
                var webhook_id = webhooks_already_registered[0]
                delete webhooks_already_registered[0];

                //delete all the other webhooks.
                webhooks_already_registered.forEach(async function (id) {
                    var wb = await interaction.client.fetchWebhook(id);
                    wb.delete('They have too much webhook :(');
                    log.write('webhook ' + Array.from(wbs.values()).filter(Webhook => Webhook.id === id) + 'has been deleted');
                });
            } else { var webhook_id = webhooks_already_registered[0] }

            var webhook = await interaction.client.fetchWebhook(webhook_id)
            log.write(`A webhook has been registered for "${channel.name}" (${channel_id}).`);

        } else {

            try {
                var webhook = await channel.createWebhook({
                    name: 'YaoiCute_bot',
                    avatar: config.avatar,
                    reason: 'Need a cool Webhook to send beautiful images UwU'
                });
                console.log(webhook, "dd")
            } catch (error) {
                //log the error message.
                log.write(error);

                //editReply the error message.
                const text = new EmbedBuilder()
                    .setColor('#C0392B')
                    .setTitle('**Error**')
                    .setDescription("error:\n`" + error + "`")
                    .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

                await channel.send({ embeds: [text] });
                return;
            }
        }


        log.write(`A webhook for "${channel.name}"(${channel}) was successfully find`);

        return webhook;
    } catch (error) {
        //log the error message.
        log.write(error);

        //editReply the error message.
        const text = new EmbedBuilder()
            .setColor('#C0392B')
            .setTitle('**Error**')
            .setDescription("error:\n`" + error + "`")
            .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

        await channel.send({ embeds: [text] });
        return;
    }
};
