const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop_remove")
        .setDescription("Remove a Role to buy in the shop")
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('the role to remove')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles || PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            var role = await interaction.options.getRole('role', true);
            let settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

            if (settings.shop_role.find(obj => { return obj.id === role.id })) {
                var object = settings.shop_role.find(obj => { return obj.id === role.id })
                var index = settings.shop_role.indexOf(object)
                console.log(index)
                settings.shop_role.splice(index, 1)

                var object2 = settings.shop_select.find(obj => { return obj.value === role.name })
                var index2 = settings.shop_select.indexOf(object2)
                settings.shop_select.splice(index2, 1)

                fs.writeFileSync("./settings.json", JSON.stringify(settings));
                const text = new EmbedBuilder()
                    .setColor('#52be80')
                    .setTitle('**Validation**')
                    .setDescription(`<@&${role.id}> has been delete from the shop.`)
                    .setFooter({ iconURL: interaction.user.avatarURL(), text: interaction.user.username})

                await interaction.editReply({ embeds: [text] });
                return;
            } else {
                const text = new EmbedBuilder()
                    .setColor('#C0392B')
                    .setTitle('**Error**')
                    .setDescription(`<@&${role.id}> is not in the shop :(`)
                    .setFooter({ iconURL: interaction.user.avatarURL(), text: interaction.user.username})

                await interaction.editReply({ embeds: [text] });
                return;
            }

        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /addrole : \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }

    }
};