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
        var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
        var webhooks_list = eval(settings.webhooks_list);
        try {
            var text = await interaction.options.getString('text', true);
            var user = false;
            if (await interaction.options.getUser('user', false)) {
                var user = await interaction.options.getUser('user', true);
            }
            try {
                if (webhooks_list[interaction.channel.id]) {
                    var webhook = await interaction.client.fetchWebhook(webhooks_list[interaction.channel.id]);
                } else {

                    var wbs = await interaction.guild.channels.fetchWebhooks(interaction.channel)

                    //find all webhooks who named YaoiCute_bot.
                    if (wbs.find(Webhook => Webhook.name === 'YaoiCute_bot')) {

                        var a = [];
                        Array.from(wbs.values()).filter(Webhook => Webhook.name === 'YaoiCute_bot').forEach(function (webhook) { a.push(webhook.id); });

                        var webhook_id = a[0];

                        if (a.length > 1) {
                            //keep the first if multiple webhooks are found.
                            delete a[0];

                            //delete all the other webhooks.
                            a.forEach(async function (id) {
                                var wb = await interaction.client.fetchWebhook(id);
                                wb.delete('They have too much webhook :(');
                                log.write('webhook has been deleted');
                            });
                        }
                    }
                    webhooks_list[interaction.channel.id] = webhook_id;
                    var webhook = await interaction.client.fetchWebhook(webhook_id);
                }
            } catch (error) {
                var webhook = await interaction.guild.channels.createWebhook({
                    channel: interaction.channel,
                    name: 'YaoiCute_bot',
                    avatar: config.avatar,
                    reason: 'Need a cool Webhook to send beautiful images UwU'
                });
                webhooks_list[interaction.channel.id] = webhook.id;
                log.write(`A webhook has been registered for ${interaction.channelId}`);
            }
            if (user != false) {
                await webhook.send({ content: text, username: user.username, avatarURL: user.avatarURL() });
            } else {
                await interaction.channel.send({ content: text})
            }
            settings.webhooks_list = webhooks_list;
            fs.writeFileSync("./settings.json", JSON.stringify(settings));
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