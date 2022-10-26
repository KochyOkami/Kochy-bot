const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link two channels and sychronise messages and images.")
    .addStringOption(option =>
      option.setName('1channel')
        .setDescription('the 1st channel to connect')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('2channel')
        .setDescription("the 2nd channel to connect, it's optional, take the current channel if false.")
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('double_way')
        .setDescription('"true" for double-way, "false" for only 1channel to 2 channels. (false in defaultValue)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels || PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      await interaction.deferReply();
      var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
      var links_list = eval(settings.links_list);

      //catch the 2 options.
      var link2 = await interaction.options.getString('1channel', true);
      if (await interaction.options.getString('2channel', false)) {
        var link1 = await interaction.options.getString('1channel', true);
        var link2 = await interaction.options.getString('2channel', true);
      } else {
        var link1 = interaction.channelId;

      }

      //test if it's a valid id
      try {
        await interaction.client.channels.fetch(link1);

      } catch (error) {
        //log the error message.
        log.write(error + "3", interaction.member, interaction.channel);

        //editReply the error message.
        const text = new EmbedBuilder()
          .setColor('#C0392B')
          .setTitle('**Error**')
          .setDescription('The first link is not a valid channel id')
          .addFields(
            { name: 'Link 1', value: '`' + link1 + '`' },
            { name: 'Link 2', value: '`' + link2 + '`' },
            { name: '\u200B', value: '\u200B' }
          )
          .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

        await interaction.editReply({ embeds: [text] });
        return;
      }


      //test if link2 it's a valis id.

      try {
        await interaction.client.channels.fetch(link2);

      } catch (error) {
        //log the error message.
        log.write(error, interaction.member, interaction.channel);

        //editReply the error message.
        const text = new EmbedBuilder()
          .setColor('#C0392B')
          .setTitle('**Error**')
          .setDescription('The second link is not a valid channel id')
          .addFields(
            { name: 'Link 1', value: '`' + link1 + '`' },
            { name: 'Link 2', value: '`' + link2 + '`' },
            { name: '\u200B', value: '\u200B' }
          )
          .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

        await interaction.editReply({ embeds: [text] });
        return;
      }



      if (await interaction.options.getBoolean('double_way', false)) {
        
        if (!links_list[link1] && !links_list[link2]) {
          links_list[link1] = Array(link2);
          links_list[link2] = Array(link1);

          create_webhook(interaction, link1);

          create_webhook(interaction, link2);

        } else if (!links_list[link1] && links_list[link2]) {
          links_list[link1] = Array(link2);

          create_webhook(interaction, link2);

          if (links_list[link2].indexOf(link1) > -1) {
            const text = new EmbedBuilder()
              .setColor('#F39C12')
              .setTitle('**Warning**')
              .setDescription(`<#${link1}> is already linked to:`)
              .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

            await interaction.editReply({ embeds: [text] });
            return;

          } else {
            links_list[link2].push(link1);
            create_webhook(interaction, link1);
          }

        } else if (links_list[link1] && !links_list[link2]) {
          links_list[link2] = Array(link1);

          create_webhook(interaction, link1);

          if (links_list[link1].indexOf(link2) > -1) {
            const text = new EmbedBuilder()
              .setColor('#F39C12')
              .setTitle('**Warning**')
              .setDescription(`<#${link2}>  is already linked to:`)
              .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

            var values = "";

            for (let index = 0; index < links_list[link1].length; index++) {
              try {
                values += "<#" + await interaction.client.channels.fetch(links_list[link1][index]) + ">\n";

              } catch {
                values += "`" + links_list[link1][index] + "`\n";
              }

            }
            text.setFields({ name: "Channels:", value: values })
            await interaction.editReply({ embeds: [text] });
            return;

          } else {
            links_list[link1].push(link2);

            create_webhook(interaction, link2);
          }

        } else if (links_list[link1] && links_list[link2]) {

          if (links_list[link1].indexOf(link2) > -1) {
            const text = new EmbedBuilder()
              .setColor('#F39C12')
              .setTitle('**Warning**')
              .setDescription(`<#${link2}> is already linked to:`)
              .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

            var values = "";

            for (let index = 0; index < links_list[link2].length; index++) {
              try {
                values += "<#" + await interaction.client.channels.fetch(links_list[link2][index]) + ">\n";

              } catch {
                values += "`" + links_list[link2][index] + "`\n";
              }

            }
            text.setFields({ name: "Channels:", value: values })
            await interaction.editReply({ embeds: [text] });
            return;

          } else {
            links_list[link1].push(link2);

            create_webhook(interaction, link2);
          }

          if (links_list[link2].indexOf(link1) > -1) {
            const text = new EmbedBuilder()
              .setColor('#F39C12')
              .setTitle('**Warning**')
              .setDescription(`<#${link1}> is already linked to:`)
              .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

            var values = "";

            for (let index = 0; index < links_list[link1].length; index++) {
              try {
                values += "<#" + await interaction.client.channels.fetch(links_list[link1][index]) + ">\n";

              } catch {
                values += "`" + links_list[link1][index] + "`\n";
              }

            }
            text.setFields({ name: "Channels:", value: values })
            await interaction.editReply({ embeds: [text] });
            return;

          } else {
            links_list[link2].push(link1);

            create_webhook(interaction, link1);
          }

        }
      } else {
        if (!links_list[link1]) {
          links_list[link1] = Array(link2);

          create_webhook(interaction, link2);

        } else if (links_list[link1]) {

          if (links_list[link1].indexOf(link2) > -1) {
            const text = new EmbedBuilder()
              .setColor('#F39C12')
              .setTitle('**Warning**')
              .setDescription(`<#${link1}> is already linked to:`)
              .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

            var values = "";

            for (let index = 0; index < links_list[link1].length; index++) {
              try {
                values += "<#" + await interaction.client.channels.fetch(links_list[link1][index]) + ">\n";

              } catch {
                values += "`" + links_list[link1][index] + "`\n";
              }

            }
            text.setFields({ name: "Channels:", value: values })
            await interaction.editReply({ embeds: [text] });
            return;

          } else {
            links_list[link1].push(link2);
            create_webhook(interaction, link2);
          }
        }
      }

      settings.links_list = links_list;

      fs.writeFileSync("./settings.json", JSON.stringify(settings));

      log.write(`Command /link ${link1} ${link2} Done !`, interaction.members, interaction.channel);

      const text = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('**Validation**')
        .setDescription(`<#${link1}> has been linked to:`)
        .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

      var values = "";

      for (let index = 0; index < links_list[link1].length; index++) {
        try {
          values = "<#" + await interaction.client.channels.fetch(links_list[link1][index]) + ">\n";
        } catch {
          values = "`" + links_list[link1][index] + "`\n";
        }

      }
      text.setFields({ name: "Channels:", value: values })
      await interaction.editReply({ embeds: [text] });
      return;

      //security in case of error
    } catch (error) {
      //log the error message.
      log.write(error + "1", interaction.member, interaction.channel);

      //editReply the error message.
      const text = new EmbedBuilder()
        .setColor('#C0392B')
        .setTitle('**Error**')
        .setDescription("error:\n`" + error + "`")
        .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

      await interaction.editReply({ embeds: [text] });
      return;
    }
  }
};

async function create_webhook(message, channel_id) {



    /**
     * Create a webhook for the specified channel if he is not already registered to the webhook server.
     * 
     * @param {Discord.Message} message The message who the command process is associated with.
     * @param {string} channel_id The ID of the channel who the webhook will be associated with.
     * @return  Return nothings, but the webhook_list has been edited.
     */
    const channel = await bot.channels.fetch(channel_id);
    try {
        const channel = await bot.channels.fetch(channel_id);
        //check if the channel already have a webhook.
        var wbs = await channel.fetchWebhooks()

        var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
        var webhooks_list = eval(settings.webhooks_list);

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
                webhooks_list[channel_id] = webhooks_already_registered[0];
                delete webhooks_already_registered[0];

                //delete all the other webhooks.
                webhooks_already_registered.forEach(async function (id) {
                    var wb = await bot.fetchWebhook(id);
                    wb.delete('They have too much webhook :(');
                    log.write('webhook ' + Array.from(wbs.values()).filter(Webhook => Webhook.id === id) + 'has been deleted');
                });
            } else { webhooks_list[channel_id] = webhooks_already_registered[0]; }


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
                log.write(error, message.member, message.channel);

                //editReply the error message.
                const text = new EmbedBuilder()
                    .setColor('#C0392B')
                    .setTitle('**Error**')
                    .setDescription("error:\n`" + error + "`")
                    .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

                await channel.send({ embeds: [text] });
                return;
            }

            webhooks_list[channel_id] = webhook.id;
        }

        settings.webhooks_list = webhooks_list;

        fs.writeFileSync("./settings.json", JSON.stringify(settings));


        log.write(`A webhook for "${channel.name}"(${channel}) was successfully registred`, message.member, message.channel);

        return;
    } catch (error) {
        //log the error message.
        log.write(error, message.member, message.channel);

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
