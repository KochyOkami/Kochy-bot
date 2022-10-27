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
          var webhook = await find_webhook(interaction, link2);
                        
          var text = new EmbedBuilder()
                .setColor('#245078')
                .setTitle('**Information**')
                .setDescription(`This channel has been linked to ${link1}`)
                .setFooter({ text: '/unlink to unlink this channel' })
                          
          await webhook.send(text)
          
          var webhook = await find_webhook(interaction, link1)
          text = new EmbedBuilder()
                .setColor('#245078')
                .setTitle('**Information**')
                .setDescription(`This channel has been linked to ${link2}`)
                .setFooter({ text: '/unlink to unlink this channel' })
                          
          await webhook.send(text)

        } else if (!links_list[link1] && links_list[link2]) {
            links_list[link1] = Array(link2);

            var webhook = await find_webhook(interaction, link2)

            var text = new EmbedBuilder()
                .setColor('#245078')
                .setTitle('**Information**')
                .setDescription(`This channel has been linked to ${link1}`)
                .setFooter({ text: '/unlink to unlink this channel' })
                          
          await webhook.send(text)

          if (links_list[link2].indexOf(link1) > -1) {
            var text = new EmbedBuilder()
              .setColor('#F39C12')
              .setTitle('**Warning**')
              .setDescription(`<#${link1}> is already linked to:`)
              .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

            await interaction.editReply({ embeds: [text] });
            return;

          } else {
            links_list[link2].push(link1);
            var webhook = await find_webhook(interaction, link1)

            var text = new EmbedBuilder()

                .setColor('#245078')
                .setTitle('**Information**')
                .setDescription(`This channel has been linked to ${link2}`)
                .setFooter({ text: '/unlink to unlink this channel' })
                          
            await webhook.send(text)
          }

        } else if (links_list[link1] && !links_list[link2]) {
            links_list[link2] = Array(link1);

            var webhook = await find_webhook(interaction, link1)

            var text = new EmbedBuilder()

                .setColor('#245078')
                .setTitle('**Information**')
                .setDescription(`This channel has been linked to ${link2}`)
                .setFooter({ text: '/unlink to unlink this channel' })
                          
            await webhook.send(text)

          if (links_list[link1].indexOf(link2) > -1) {
            var text = new EmbedBuilder()
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
            var webhook = await find_webhook(interaction, link2)

            const text = new EmbedBuilder()

                .setColor('#245078')
                .setTitle('**Information**')
                .setDescription(`This channel has been linked to ${link1}`)
                .setFooter({ text: '/unlink to unlink this channel' })
                          
            await webhook.send(text)
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

            var webhook = await find_webhook(interaction, link2)

             const text = new EmbedBuilder()

                .setColor('#245078')
                .setTitle('**Information**')
                .setDescription(`This channel has been linked to ${link1}`)
                .setFooter({ text: '/unlink to unlink this channel' })
                          
             await webhook.send(text)
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

            var webhook = await find_webhook(interaction, link1)

          const text = new EmbedBuilder()

                .setColor('#245078')
                .setTitle('**Information**')
                .setDescription(`This channel has been linked to ${link2}`)
                .setFooter({ text: '/unlink to unlink this channel' })
                          
          await webhook.send(text)
          }

        }
      } else {
        if (!links_list[link1]) {
          links_list[link1] = Array(link2);

          var webhook = await find_webhook(interaction, link2)

          const text = new EmbedBuilder()

                .setColor('#245078')
                .setTitle('**Information**')
                .setDescription(`This channel has been linked to ${link1}`)
                .setFooter({ text: '/unlink to unlink this channel' })
                          
          await webhook.send(text)

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
            var webhook = await find_webhook(interaction, link2)

          const text = new EmbedBuilder()

                .setColor('#245078')
                .setTitle('**Information**')
                .setDescription(`This channel has been linked to ${link1}`)
                .setFooter({ text: '/unlink to unlink this channel' })
                          
          await webhook.send(text)
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
