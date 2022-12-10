const Discord = require('discord.js');
const bot = new Discord.Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "MessageContent",
        "GuildWebhooks",
        "GuildMembers"
    ]
});
//systemctl stop yaoicute.service

const fs = require('fs');
const requests = require('request');
const {
    Collection,
    EmbedBuilder,
    Routes,
    ActionRowBuilder,
    SelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    GuildMemberRoleManager,
    AttachmentBuilder
} = require('discord.js');

const { REST } = require('@discordjs/rest');

const log = require('./logs/logBuilder.js');
const config = require('./config.js');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];
const dotenv = require('dotenv');
dotenv.config();

var dateTime = require('node-datetime');
var dt = dateTime.create();


var Token = process.env.DISCORD_TOKEN2;

bot.login(Token);

//-----------------------------------Discord------------------------------------------------

// Creating a collection for commands in client
bot.commands = new Collection();

//Register all commands for the bot.
const rest = new REST({
    version: '10'
}).setToken(Token)


//Declare all commands. 
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    bot.commands.set(command.data.name, command)
    console.log(command.data.name)
}

bot.on("ready", async () => {
    try {
        //set the presence of the bot
        bot.user.setPresence({
            status: "online",
            activities: [{ name: "la version " + config.bot_version }],
        });
        /*rest.put(Routes.applicationCommands(bot.user.id), { body: [] })
            .then(() => console.log('Successfully deleted all commands.'))
            .catch(console.log("error")); */

        (async () => {
            //Load all commands.
            await rest.put(
                Routes.applicationCommands(bot.user.id),
                { body: commands })
                .then(log.write(`Successfully registered ${commands.length} application commands for global`))
                .catch(err => log.write(err));
        })();
        var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
        settings.bot_name = bot.user.username
        fs.writeFileSync("./settings.json", JSON.stringify(settings));
        requests.get(settings.cookie_serv + 'cookie_get.php', function (err, res, body) {
            if (err) console.log(err)
            try {
                if (res.statusCode === 200) //etc
                    var cookie = res.body
                fs.writeFileSync("./cookie.json", cookie)

            } catch (e) {
                log.write(e)
            }
        });

        try {
            //Say that the bot is ready
            var channel = await bot.channels.fetch('988784456959672350');
            await channel.send("@everyone I'm ready ^^");
            channel = await bot.channels.fetch('961894734752800819');
            await channel.send("I've restarted ^^");

        } catch (error) {
            log.write('Error when sending staring message:  ' + error);

        }

        log.write(`${bot.user.tag} logged successfully.`);

        var backup = await bot.channels.fetch('1035900999845543976')
        var interval = setInterval(function () {
            backup.send({
                content: "auto backup" + dt.format('Y-m-d H:M:S'),
                files: [{
                    attachment: "./cookie.json",
                    name: "cookie-backup" + dt.format('Y-m-d H:M:S') + ".json",
                    description: `auto backup.`
                },
                {
                    attachment: "./cookie_user.json",
                    name: "user-backup" + dt.format('Y-m-d H:M:S') + ".json",
                    description: `auto backup.`
                },
                {
                    attachment: "./daily.json",
                    name: "daily-backup" + dt.format('Y-m-d H:M:S') + ".json",
                    description: `auto backup.`
                },
                {
                    attachment: "./settings.json",
                    name: "settings-backup" + dt.format('Y-m-d H:M:S') + ".json",
                    description: `auto backup.`
                }],
            });
        }, 2 * 60 * 60 * 1000);

        var interval = setInterval(function () {
            var cookie = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'));
            var myJSONObject = { 'cookie': cookie, 'password': '91784SK8325k0r0lev' };

            //Custom Header pass
            var headersOpt = {
                "content-type": "application/json",
            };
            requests(
                {
                    method: 'post',
                    url: settings.cookie_serv + 'cookie_post.php',
                    form: myJSONObject,
                    headers: headersOpt,
                    json: true,
                }, function (error, response, body) {
                    //Print the Response
                    log.write('cookie send')
                });
        }, 5 * 60 * 1000);

        var interval = setInterval(function () {
            var cookie_user = JSON.parse(fs.readFileSync('./cookie_user.json', 'utf8'));
            var myJSONObject = { 'users': cookie_user, 'password': '91784SK8325k0r0lev' };
            //Custom Header pass
            var headersOpt = {
                "content-type": "application/json",
            };
            requests(
                {
                    method: 'post',
                    url: settings.cookie_serv + 'user_post.php',
                    form: myJSONObject,
                    headers: headersOpt,
                    json: true,
                }, function (error, response, body) {
                    //Print the Response
                    log.write('user send')
                });
        }, 5 * 60 * 1000);

        var cookie_user = JSON.parse(fs.readFileSync('./cookie_user.json', 'utf8'));
        var cookie = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'));
        for (let index = 0; index < cookie.length; index++) {
            var user = await bot.client.users.fetch(cookie[index]);
            var user_name = user.tag;
            var user_avatar = user.displayAvatarURL();
            cookie_user[user.id] = { 'name': user_name, 'avatar': user_avatar }

        }

        fs.writeFileSync("./cookie_user.json", JSON.stringify(cookie_user));
        //bot.emit("guildMemberAdd", bot.users.fetch("415881207901978624"));
    } catch (e) {
        log.write(e);
    }
});
/*
request.get('cookie_serv', function (err, res, body) {
                if (err) console.log(err)
                if (res.statusCode === 200) //etc
                    console.log(res.body)
            }); 
*/

bot.on('guildMemberAdd', member => {
    var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
    log.write(member)
    var guild = member.guild;
    var id = member.id;
    try {
        member.guild.roles.fetch(settings.waiting_role)
            .then(role => {
                member.roles.add(role, 'A role for avoid some trouble with image >w<')
                    .then(() => {
                        var interval = setTimeout(function () {
                            try {
                                guild.members.fetch(id)
                                    .then(mem => {
                                        mem.guild.roles.fetch(settings.waiting_role)
                                            .then(role => {
                                                mem.roles.remove(role, 'End of the waiting time: ' + settings.waiting_time)
                                                    .then(console.log('validation'))
                                                    .catch(err => console.log('error removing role'))
                                            })
                                    })
                                    .catch(err => console.log('unknow member'))

                            } catch (e) {
                                console.log(e)
                            }
                        }
                            , settings.waiting_time * 1000)
                    })
                    .catch(err => log.write(err));
            })
            .catch(err => console.log(err));
    } catch (e) {
        log.write(e);
    }

});


bot.on('interactionCreate', async interaction => {
    var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
    if (interaction.commandName === 'restart') {
        const command = bot.commands.get(interaction.commandName);
        await command.execute(interaction); return;
    }
    try {
        if (interaction.isSelectMenu()) {
            if (interaction.customId === 'shop_select') {
                const text = new EmbedBuilder()
                    .setColor('#52be80')
                    .setTitle('**Validation**')
                    .setDescription(`Are you sure you want to buy ${interaction.values} ?`)

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`yes_${interaction.values}`)
                            .setLabel('Yes')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('no')
                            .setLabel('No')
                            .setStyle(ButtonStyle.Danger),
                    );

                await interaction.update({ embeds: [text], components: [row] });

                //settings.shop_role.find(obj => { return obj.name === settings.shop_select[index].value; })
            }
        } else if (interaction.isButton()) {

            if (interaction.customId === 'no') {
                const text = new EmbedBuilder()
                    .setColor('#245078')
                    .setTitle('**Information**')
                    .setDescription(`Command canceled !`)

                await interaction.update({ embeds: [text], components: [] });

            }
            else if (interaction.customId === 'cancel_shop') {
                var values = ""
                for (let index = 0; index < settings.shop_select.length; index++) {
                    var object = settings.shop_role.find(obj => { return obj.name === settings.shop_select[index].value; })

                    values += `**Role ${object.name} (${object.price} :cookie:)**\n`
                    values += `You buy the role ${object.name}\n`
                }

                const text = new EmbedBuilder()
                    .setColor('#245078')
                    .setTitle('Shop')
                    .setDescription(values)
                await interaction.update({ embeds: [text], components: [] });
            }
            else if (interaction.customId === 'open_box') {
                var aleatoire = Math.floor(Math.random() * (100))
                var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
                /* requests.get(settings.cookie_serv + 'cookie_get.php', function (err, res, body) {
                    if (err) console.log(err)
                    if (res.statusCode === 200) //etc
                        var cookie = res.body
                    fs.writeFileSync("./cookie.json", cookie)
                }); */
                var cookie = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'));

                if (aleatoire <= settings.box_gain) {
                    const file = new AttachmentBuilder("./images/obj/box1cookie.png");
                    var cookie_win = Math.floor(Math.random() * (1_500))
                    cookie[interaction.user.id] = parseInt(cookie[interaction.user.id]) + cookie_win
                    fs.writeFileSync("./cookie.json", JSON.stringify(cookie));
                    var myJSONObject = { 'cookie': cookie, 'password': '91784SK8325k0r0lev' };

                    //Custom Header pass
                    var headersOpt = {
                        "content-type": "application/json",
                    };
                    requests(
                        {
                            method: 'post',
                            url: settings.cookie_serv + 'cookie_post.php',
                            form: myJSONObject,
                            headers: headersOpt,
                            json: true,
                        }, function (error, response, body) {
                            //Print the Response
                            log.write('cookie send')
                        });
                    const text = new EmbedBuilder()
                        .setColor('#6c3483 ')
                        .setTitle('**Win**')
                        .setDescription("Beautiful it's a big cookie jar with " + cookie_win + " cookies :cookie:")
                        .setImage(url = "attachment://box1cookie.png")
                        .setFooter({ iconURL: interaction.user.avatarURL(), text: interaction.user.tag + " | " + cookie[interaction.user.id] + '🍪 remained' })

                    await interaction.update({ embeds: [text], files: [file], components: [] })

                    var deleted = setTimeout(async () => { try { await interaction.deleteReply() } catch { } }, 60 * 1000)

                } else {
                    const file = new AttachmentBuilder("./images/obj/box1cat.png");
                    var cookie_lost = Math.floor(Math.random() * (1_000))

                    if (cookie_lost > cookie[interaction.user.id]) {
                        cookie[interaction.user.id] = 0
                    } else {
                        cookie[interaction.user.id] = parseInt(cookie[interaction.user.id]) - cookie_lost
                    }

                    fs.writeFileSync("./cookie.json", JSON.stringify(cookie));
                    var myJSONObject = { 'cookie': cookie, 'password': '91784SK8325k0r0lev' };

                    //Custom Header pass
                    var headersOpt = {
                        "content-type": "application/json",
                    };
                    requests(
                        {
                            method: 'post',
                            url: settings.cookie_serv + 'cookie_post.php',
                            form: myJSONObject,
                            headers: headersOpt,
                            json: true,
                        }, function (error, response, body) {
                            //Print the Response
                            log.write('cookie send')
                        });
                    const text = new EmbedBuilder()
                        .setColor('#6c3483 ')
                        .setTitle('**Losed**')
                        .setDescription("warning a cat exit of the box\nand steal you " + cookie_lost + " cookies :cookie:")
                        .setImage(url = "attachment://box1cat.png")
                        .setFooter({ iconURL: interaction.user.avatarURL(), text: interaction.user.tag + " | " + cookie[interaction.user.id] + '🍪 remained' })

                    await interaction.update({ embeds: [text], files: [file], components: [] })
                    var deleted = setTimeout(async () => { try { await interaction.deleteReply() } catch { } }, 60 * 1000)

                }

            }
            else if (interaction.customId.includes('yes_')) {
                //console.log(interaction)
                var value = interaction.customId.replace('yes_', '');
                var object = settings.shop_role.find(obj => { return obj.name === value; })
                var cookie = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'));

                if (cookie[interaction.user.id] >= object.price) {
                    var map = await interaction.member.roles.cache;
                    if (!map.find(obj => { return obj.id == object.id })) {
                        await interaction.member.roles.add(object.id)
                            .then(async function () {
                                log.write(`${object.name}(${object.id}) was add to ${interaction.user.username}}`)
                                cookie[interaction.user.id] = parseInt(cookie[interaction.user.id]) - object.price

                                fs.writeFileSync("./cookie.json", JSON.stringify(cookie));
                                const text = new EmbedBuilder()
                                    .setColor('#245078')
                                    .setTitle('**Congratulation 🥳**')
                                    .setDescription(`You have bought the role <@&${object.id}>`)
                                    .setFooter({ iconURL: interaction.user.avatarURL(), text: `You have ${cookie[interaction.user.id]} 🍪` })

                                await interaction.update({ embeds: [text], components: [] });
                            })
                            .catch(async err => await interaction.update({ content: err.toString(), embeds: [], components: [] }));

                    } else {
                        const text = new EmbedBuilder()
                            .setColor('#F39C12')
                            .setTitle('**Warning**')
                            .setDescription(`You already have the role <@&${object.id}>`)
                            .setFooter({ iconURL: interaction.user.avatarURL(), text: `You have ${cookie[interaction.user.id]} 🍪` })

                        await interaction.update({ embeds: [text], components: [] });
                    }

                    var myJSONObject = { 'cookie': cookie, 'password': '91784SK8325k0r0lev' };

                    //Custom Header pass
                    var headersOpt = {
                        "content-type": "application/json",
                    };
                    requests(
                        {
                            method: 'post',
                            url: settings.cookie_serv + 'cookie_post.php',
                            form: myJSONObject,
                            headers: headersOpt,
                            json: true,
                        }, function (error, response, body) {
                            //Print the Response
                            log.write('cookie send')
                        });
                } else {
                    const text = new EmbedBuilder()
                        .setColor('#F39C12')
                        .setTitle('**Warning**')
                        .setDescription(`You don't have enought cookie to buy <@&${object.id}>!`)
                        .setFooter({ iconURL: interaction.user.avatarURL(), text: `You have ${cookie[interaction.user.id]} 🍪` })

                    await interaction.update({ embeds: [text], components: [] });
                }
            }
        }

        if (!interaction.isChatInputCommand()) return;

        const command = bot.commands.get(interaction.commandName);
        if (!command) return;

        //Catch all command options if their value is existing and log the command call.
        if (interaction.options) {
            let options = "";
            for (let i = 0; i < interaction.options.data.length; i++) {
                options += "'" + interaction.options.data[i].value + "' ";
            }
            log.write('Command: /' + interaction.commandName + ' ' + options, interaction.member, interaction.channel);

        } else {
            log.write('Command: /' + interaction.commandName, interaction.member, interaction.channel);
        }

        //execute the command.
        await command.execute(interaction)
            .catch(
                //avoid sources of error.
                async function (error) {
                    log.write(error);
                    const text = new EmbedBuilder()
                        .setColor('#C0392B')
                        .setTitle('**Error**')
                        .setDescription(`There was an error executing /` + interaction.commandName + ` : \n` + '```' + error + '```')
                    await interaction.channel.send({ embeds: [text] })
                        .then(msg => {
                            msg.delete({ timeout: 15000 })
                        })
                })

    } catch (error) {
        log.write(error);
        const text = new EmbedBuilder()
            .setColor('#C0392B')
            .setTitle('**Error**')
            .setDescription(`There was an error executing /` + interaction.commandName + ` : \n` + '```' + error + '```')
        await interaction.channel.send({ embeds: [text] })
            .then(msg => {
                msg.delete({ timeout: 15000 })
            })
    }
});

bot.on("messageCreate", async (message) => {
    try {
        const accept = Array('jpg', 'png', 'gif', 'jpeg', 'webp', 'jpg', 'mp4', 'mov');

        if (message.webhookId) return;
        if (message.author.id == bot.user.id || message.author.id == '967727996834287647') return;
        var aleatoir = Math.floor(Math.random() * (10_000))
        var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
        if ((aleatoir <= settings.box_chance)) {
            //(aleatoir <= settings.box_chance) {
            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`open_box`)
                        .setLabel('Open')
                        .setStyle(ButtonStyle.Success),
                );
            const file = new AttachmentBuilder("./images/obj/box1.png");
            const text = new EmbedBuilder()
                .setColor('#6c3483 ')
                .setTitle('**A misterious box appear**')
                .setDescription("Do you want to open it :thinking:")
                .setImage(url = "attachment://box1.png")

            await message.channel.send({ embeds: [text], files: [file], components: [button] })
        }
        try {
            var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
            var cookie = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'));
            var links_list = eval(settings.links_list);
            var anonym_link = eval(settings.anonym_link);
            var save_img_list = eval(settings.save_img_list);
            var i_path = ""

            if (cookie[message.author.id]) {
                cookie[message.author.id] = parseInt(cookie[message.author.id]) + settings.cookie_add

                var cookie_user = JSON.parse(fs.readFileSync('./cookie_user.json', 'utf8'));
                var user_name = message.author.tag;
                var user_avatar = message.author.displayAvatarURL()
                cookie_user[message.author.id] = { 'name': user_name, 'avatar': user_avatar }
                fs.writeFileSync("./cookie_user.json", JSON.stringify(cookie_user));
            } else {
                cookie[message.author.id] = settings.cookie_add
                var cookie_user = JSON.parse(fs.readFileSync('./cookie_user.json', 'utf8'));
                var user_name = message.author.tag;
                var user_avatar = message.author.displayAvatarURL()
                cookie_user[message.author.id] = { 'name': user_name, 'avatar': user_avatar }
                fs.writeFileSync("./cookie_user.json", JSON.stringify(cookie_user));
            }

            fs.writeFileSync("./cookie.json", JSON.stringify(cookie));

            if (links_list[message.channel.id]) {
                if (message.attachments.size > 0 && message.attachments.size <= 8388000) {

                    message.attachments.forEach(async function (attach) {
                        log.write(attach, message.member, message.channel)
                        if (accept.indexOf(attach.name.split('.')[-1] != -1)) {
                            var name = await download(attach.url, attach.name);
                            var path = "./images/" + name.toString()
                            i_path = path
                            var name_i = attach.name;
                            var author_i = message.author.tag;
                            console.log(settings.category[message.channel.id]);
                            if (settings.category[message.channel.id]) {
                                var category = settings.category[message.channel.id];
                                var myJSONObject = { 'url': attach.url, 'name': name_i.normalize('NFC'), 'category': category, 'author': author_i.normalize('NFC'), 'password': '91784SK8325k0r0lev' };
                                console.log(myJSONObject);
                                //Custom Header pass
                                // home/kochy-okami/Desktop/serv/
                                var headersOpt = {
                                    "content-type": "application/json",
                                };
                                requests(
                                    {
                                        method: 'post',
                                        url: settings.cookie_serv + '/pavlovitch/upload_image.php',
                                        form: myJSONObject,
                                        headers: headersOpt,
                                        json: true,
                                    }, function (error, response, body) {
                                        //Print the Response
                                        try {
                                            if (body.startsWith('wrong category')) {
                                                log.write(body)
                                            } else if (body.startsWith('wrong password')) {
                                                log.write('wrong password')
                                            }
                                            else { log.write(body) }
                                        } catch (e) {
                                            console.log(e);
                                        }
                                    });
                            }

                            links_list[message.channel.id].forEach(async function (link) {

                                if (message.content != '') {
                                    find_webhook(message, link)
                                        .then(
                                            async function (webhook) {
                                                await webhook.send({
                                                    content: message.content,
                                                    files: [{
                                                        attachment: path,
                                                        name: name,
                                                        description: `Image by ${message.member.displayName}`
                                                    }],
                                                    content: message.content,
                                                    username: message.member.displayName,
                                                    avatarURL: message.author.avatarURL()
                                                })
                                                    .then(log.write(`File ${name} send to channel ${link}`, message.member, message.channel))
                                                    .catch(err => log.write(err));
                                            }
                                        )
                                        .catch(err => log.write(err));

                                } else {
                                    find_webhook(message, link)
                                        .then(
                                            async function (webhook) {
                                                await webhook.send({
                                                    files: [{
                                                        attachment: path,
                                                        name: name,
                                                        description: `Image by ${message.member.displayName}`
                                                    }],
                                                    content: message.content,
                                                    username: message.member.displayName,
                                                    avatarURL: message.author.avatarURL()
                                                })
                                                    .then(log.write(`File ${name} send to channel ${link}`, message.member, message.channel))
                                                    .catch(err => log.write(err));
                                            }
                                        )
                                        .catch(err => log.write(err));
                                }
                            });


                        }
                    })
                } else {
                    if (message.content != '') {
                        links_list[message.channel.id].forEach(async function (link) {
                            find_webhook(message, link)
                                .then(
                                    async function (webhook) {
                                        await webhook.send({
                                            content: message.content,
                                            username: message.member.displayName,
                                            avatarURL: message.author.avatarURL()
                                        })
                                            .then(log.write(message.content, message.member, message.channel))
                                            .catch(err => log.write(err));
                                    }
                                )
                                .catch(err => log.write(err));
                        });
                    }
                }
            }
            if (save_img_list[message.channel.id]) {
                var blacklist = settings.blacklist;
                if (blacklist.indexOf(message.author.id) == -1) {
                    if (message.attachments.size > 0 && message.attachments.size <= 8388000) {
                        message.attachments.forEach(async function (attach) {
                            log.write(attach, message.member, message.channel)
                            if (accept.indexOf(attach.name.split('.')[-1] != -1)) {
                                var name = await download(attach.url, attach.name);
                                var path = "./images/" + name.toString()
                                i_path = path
                                save_img_list[message.channel.id].forEach(async function (link) {
                                    console.log('img save detected')
                                    //find webhook
                                    find_webhook(message, link)
                                        .then(
                                            //send the message
                                            async function (webhook) {
                                                await webhook.send({
                                                    content: message.content,
                                                    files: [{
                                                        attachment: path,
                                                        name: name,
                                                        description: `Image by ${message.member.displayName}`
                                                    }],
                                                    username: message.member.displayName,
                                                    avatarURL: message.author.avatarURL()
                                                })
                                                    .then(log.write(`File ${name} send to channel ${link}`, message.member, message.channel))
                                                    .catch(err => log.write(err));
                                            }
                                        )
                                        .catch(err => log.write(err));
                                });
                            }
                        });
                    }

                    //if the message start with a link  (only https:// links).
                    if (message.content.startsWith('https://')) {
                        //search all channel to send messages.
                        save_img_list[message.channel.id].forEach(async function (link) {
                            //send the message with the webhook.
                            var webhook = await find_webhook(message, link)
                            await webhook.send({
                                content: message.content,
                                username: message.member.displayName,
                                avatarURL: message.author.avatarURL()
                            })
                                .then(log.write(`${message.content} send to channel ${link}`, message.member, message.channel))
                                .catch(err => log.write(err));
                        });
                    }
                }
            }

            if (anonym_link[message.channel.id]) {
                if (message.attachments.size > 0 && message.attachments.size <= 8388000) {
                    message.attachments.forEach(async function (attach) {
                        log.write(attach, message.member, message.channel)
                        if (accept.indexOf(attach.name.split('.')[-1] != -1)) {
                            var name = await download(attach.url, attach.name);
                            var path = "./images/" + name.toString()
                            i_path = path
                            anonym_link[message.channel.id].forEach(async function (link) {
                                console.log('img anony save detected')
                                //find webhook
                                find_webhook(message, link)
                                    .then(
                                        //send the message
                                        async function (webhook) {
                                            await webhook.send({
                                                content: message.content,
                                                files: [{
                                                    attachment: path,
                                                    name: name,
                                                }]
                                            })
                                                .then(log.write(`Anonyme file ${name} send to channel ${link}`, message.member, message.channel))
                                                .catch(err => log.write(err));
                                        }
                                    )
                                    .catch(err => log.write(err));
                            });
                        }
                    });
                }
            }
            //try to delete the downloaded image.
            if (fs.existsSync(i_path)) {
                fs.unlinkSync(i_path)
                    .catch(err => log.write(err));
            }

        } catch (error) {
            log.write(error, message.member, message.channel);
        }

    } catch (e) {
        log.write(e + ' ' + message);
    }

});

async function download(url, name) {
    /**
   * Download a file on the server and return the name of the downloaded file. 
   * If the name of the file is unknown, create a new name bases on 'YaoiCute_botImg_(randint)'
   * 
   * @param  {String} name  The original name of the file
   * @param  {String} url   The URL to download the file
   * @return {String}       The name of the downloaded file
   */
    try {
        if (name.includes('unknown')) {
            name = ('YaoiCute_botImg_' + Math.random().toString(36).substring(2) + '.' + name.split('.').pop(0));
        }
        var file = fs.createWriteStream('./images/' + name);
        return new Promise((resolve, reject) => {
            var responseSent = false; // flag to make sure that response is sent only once.
            requests.get(url)
                .pipe(file)
                .on('finish', () => {
                    if (responseSent) return;
                    responseSent = true;
                    file.close();
                    console.log(`${name} downloaded successfully.`);
                    resolve(name);
                })
                .on('error', err => {
                    if (responseSent) return;
                    responseSent = true;
                    reject(err);
                });
        })

    } catch (e) {
        log.write(e + ' ' + name)
    }
};

async function find_webhook(message, channel_id) {
    /**
     * Create a webhook for the specified channel if he is not already registered to the webhook server.
     * 
     * @param {Discord.Message} message The message who the command process is associated with.
     * @param {string} channel_id The ID of the channel who the webhook will be associated with.
     * @return  Return nothings, but the webhook_list has been edited.
     */
    const channel = await bot.channels.fetch(channel_id);
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
                    var wb = await bot.fetchWebhook(id);
                    wb.delete('They have too much webhook :(');
                    log.write('webhook ' + Array.from(wbs.values()).filter(Webhook => Webhook.id === id) + 'has been deleted');
                });
            } else { var webhook_id = webhooks_already_registered[0] }

            var webhook = await bot.fetchWebhook(webhook_id)
            var chan = await bot.channels.fetch(webhook.channelId)
            console.log(webhook.name + ` has been find in #` + chan.name + `(${webhook.channelId})`)

        } else {
            var webhook = await channel.createWebhook({
                name: 'YaoiCute_bot',
                avatar: config.avatar,
                reason: 'Need a cool Webhook to send beautiful images UwU'
            })
                .then(log.write(`A webhook has been registered for #${channel.name}(${channel_id}).`))
                .catch(async function () {
                    log.write(error, message.member, message.channel);

                    //editReply the error message.
                    const text = new EmbedBuilder()
                        .setColor('#C0392B')
                        .setTitle('**Error**')
                        .setDescription("error:\n`" + error + "`")
                        .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

                    await channel.send({ embeds: [text] })
                        .then(msg => {
                            msg.delete({ timeout: 15000 })
                        })
                    return;
                })
        }
        return webhook;

    } catch (error) {
        //log the error message.
        log.write(error, message.member, message.channel);

        //editReply the error message.
        const text = new EmbedBuilder()
            .setColor('#C0392B')
            .setTitle('**Error**')
            .setDescription("error:\n`" + error + "`")
            .setFooter({ text: 'link `arg1` `arg2`  arg* must be a channel id' })

        await channel.send({ embeds: [text] })
            .then(msg => {
                msg.delete({ timeout: 15000 })
            })

        return;
    }
};
