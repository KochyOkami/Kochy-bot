const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop_add")
        .setDescription("Add a Role to buy in the shop")
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('the role to add')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('price')
                .setDescription("The price of the role")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles || PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            var role = await interaction.options.getRole('role', true);
            var price = await interaction.options.getString('price', true);
            let settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

            if (settings.shop_role.find(obj => { return obj.id === role.id })) {
                var object = settings.shop_role.find(obj => { return obj.id === role.id })
                const text = new EmbedBuilder()
                    .setColor('#F39C12')
                    .setTitle('**Warning**')
                    .setDescription(`<@&${role.id}> was already in the shop to the price of  ` + '`' + object.price + '` 🍪')
                    .setFooter({ iconURL: interaction.user.avatarURL(), text: interaction.user.username})

                await interaction.editReply({ embeds: [text] });
                return;
            } else {
                settings.shop_role.push({
                    "name": role.name,
                    "id": role.id,
                    "price": price
                })

                settings.shop_select.push({
                    "label": "Rôle " + role.name,
                    "description": price + " 🍪",
                    "value": role.name
                })

                const text = new EmbedBuilder()
                    .setColor('#52be80')
                    .setTitle('**Validation**')
                    .setDescription(`<@&${role.id}> has been had to the shop to the price of ` + '`' + price + '` 🍪')
                    .setFooter({ iconURL: interaction.user.avatarURL(), text: interaction.user.username})

                await interaction.editReply({ embeds: [text] });
                fs.writeFileSync("./settings.json", JSON.stringify(settings));
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