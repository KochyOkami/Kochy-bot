const Discord = require('discord.js');
const bot = new Discord.Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "MessageContent",
        "GuildWebhooks"
    ]
});

const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const request = require('request');
const {
    Collection,
    EmbedBuilder,
    Routes } = require('discord.js');

const { REST } = require('@discordjs/rest');

const log = require('/home/pi/Desktop/Kochy-bot/logs/logBuilder.js');
const config = require('/home/pi/Desktop/Kochy-bot/config.js');

const commandFiles = fs.readdirSync('/home/pi/Desktop/Kochy-bot/commands').filter(file => file.endsWith('.js'));
const commands = [];


bot.login(process.env.DISCORD_TOKEN);

//-----------------------------------Discord------------------------------------------------

// Creating a collection for commands in client
bot.commands = new Collection();

//Declare all commands. 
for (const file of commandFiles) {
    const command = require(`/home/pi/Desktop/Kochy-bot/commands/${file}`);
    commands.push(command.data.toJSON());
    bot.commands.set(command.data.name, command);
}

bot.on("ready", async () => {
    try {
        //set the presence of the bot
        bot.user.setPresence({
            status: "online",
            activities: [{ name: "la version " + config.bot_version }],
        })

        //Register all commands for the bot.
        const rest = new REST({
            version: '10'
        }).setToken(process.env.DISCORD_TOKEN)

        var TEST_GUILD_ID = "948170961360916540";
        const CLIENT_ID = bot.user.id;

        // rest.put(Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), { body: [] })
        //     .then(() => console.log('Successfully deleted all guild commands.'))
        //     .catch(console.error);

        TEST_GUILD_ID = false;

        //Load all commands.
        try {
            if (TEST_GUILD_ID == false) {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID),
                    { body: commands },
                )
                    .catch(err => log.write(err))
                    .then(log.write(`Successfully registered ${commands.length} application commands for global`));

            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID),
                    { body: commands },
                )
                    .catch(err => log.write(err))
                    .then(log.write(`Successfully registered ${commands.length} application commands for global`));
            }
        } catch (error) {
            log.write(error)
        }

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
    } catch (e) {
        log.write(e);
    }
});


bot.on('interactionCreate', async interaction => {
    try {
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
        try {
            await command.execute(interaction);
        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /` + interaction.commandName + ` : \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
        }
        //avoid sources of error.
    } catch (error) {
        log.write(error);
        const text = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('**Error**')
            .setDescription(`There was an error executing /` + interaction.commandName + ` : \n` + '```' + error + '```')
        await interaction.editReply({ embeds: [text] });
    }
});

bot.on("messageCreate", async (message) => {
    try {
        const accept = Array('jpg', 'png', 'gif', 'jpeg', 'webp', 'jpg', 'mp4');

        if (message.webhookId) return;
        if (message.member.id === bot.user.id) return;
        try {
            var settings = JSON.parse(fs.readFileSync('/home/pi/Desktop/Kochy-bot/settings.json', 'utf8'));
            var links_list = eval(settings.links_list);
            var save_img_list = eval(settings.save_img_list);
            var webhooks_list = eval(settings.webhooks_list);
            var i_path = ""
            if (links_list[message.channel.id]) {
                if (message.attachments != undefined && message.attachments.size) {
                    log.write(message.attachments, message.member, message.channel)
                    message.attachments.forEach(async function (attach) {
                        if (accept.indexOf(attach.name.split('.')[-1] != -1)) {
                            var name = await download(attach.url, attach.name);
                            var path = "/home/pi/Desktop/Kochy-bot/images/" + name.toString()
                            i_path = path

                            links_list[message.channel.id].forEach(async function (link) {

                                if (message.content != '') {
                                    if (!webhooks_list.hasOwnProperty(link)) {
                                        await create_webhook(message, message.channelId)
                                        settings = JSON.parse(fs.readFileSync('/home/pi/Desktop/Kochy-bot/settings.json', 'utf8'));
                                        webhooks_list = eval(settings.webhooks_list);
                                    }
                                    console.log(webhooks_list[link])
                                    var webhook = await bot.fetchWebhook(webhooks_list[link]);
                                    await webhook.send({
                                        content: message.content,
                                        files: [{
                                            attachment: path,
                                            name: name,
                                            description: `Image by ${message.member.displayName}`
                                        }
                                        ],
                                        content: message.content,
                                        username: message.member.displayName,
                                        avatarURL: message.author.avatarURL()
                                    });
                                    log.write(`File ${name} send to channel ${webhooks_list[link]}`, message.member, message.channel);
                                } else {
                                    if (!webhooks_list.hasOwnProperty(link)) {
                                        await create_webhook(message, message.channelId)
                                        settings = JSON.parse(fs.readFileSync('/home/pi/Desktop/Kochy-bot/settings.json', 'utf8'));
                                        webhooks_list = eval(settings.webhooks_list);
                                    }
                                    console.log(webhooks_list[link])
                                    var webhook = await bot.fetchWebhook(webhooks_list[link]);
                                    await webhook.send({
                                        files: [{
                                            attachment: path,
                                            name: name,
                                            description: `Image by ${message.member.displayName}`
                                        }
                                        ],
                                        content: message.content,
                                        username: message.member.displayName,
                                        avatarURL: message.author.avatarURL()
                                    });
                                    log.write(`File ${name} send to channel ${webhooks_list[link]}`, message.member, message.channel);
                                }
                            });
                        }

                    })
                } else {
                    if (message.content != '') {
                        links_list[message.channel.id].forEach(async function (link) {
                            if (!webhooks_list.hasOwnProperty(link)) {
                                await create_webhook(message, message.channelId)
                                settings = JSON.parse(fs.readFileSync('/home/pi/Desktop/Kochy-bot/settings.json', 'utf8'));
                                webhooks_list = eval(settings.webhooks_list);
                            }
                            var webhook = await bot.fetchWebhook(webhooks_list[link]);
                            await webhook.send({
                                content: message.content,
                                username: message.member.displayName,
                                avatarURL: message.author.avatarURL()
                            });
                            log.msg(message.content, message.member, await bot.channels.fetch(link, false))
                        });

                    }
                }
            }
            if (save_img_list[message.channel.id]) {
                var blacklist = settings.blacklist;
                if (!blacklist.indexOf(message.author.id)) {
                    if (message.attachments != undefined && message.attachments.size) {
                        message.attachments.forEach(async function (attach) {
                            if (accept.indexOf(attach.name.split('.')[-1] != -1)) {
                                var name = await download(attach.url, attach.name);
                                var path = "/home/pi/Desktop/Kochy-bot/images/" + name.toString()
                                i_path = path
                                save_img_list[message.channel.id].forEach(async function (link) {
                                    console.log('img save detected')
                                    if (!webhooks_list.hasOwnProperty(link)) {
                                        await create_webhook(message, message.channelId)
                                        settings = JSON.parse(fs.readFileSync('/home/pi/Desktop/Kochy-bot/settings.json', 'utf8'));
                                        webhooks_list = eval(settings.webhooks_list);

                                    }
                                    var webhook = await bot.fetchWebhook(webhooks_list[link]);
                                    await webhook.send({
                                        content: message.content,
                                        files: [{
                                            attachment: path,
                                            name: name,
                                            description: `Image by ${message.member.displayName}`
                                        }
                                        ],
                                        username: message.member.displayName,
                                        avatarURL: message.author.avatarURL()
                                    });
                                    log.write(`File ${name} send to channel ${webhooks_list[link]}`, message.member, message.channel);
                                });
                            }
                        });
                    }

                    //if the message start with a link  (only https:// links).
                    if (message.content.startsWith('https://')) {
                        //search all channel to send messages.
                        save_img_list[message.channel.id].forEach(async function (link) {
                            //find or create the webhook in the channel if it,s inexistent.
                            if (!webhooks_list.hasOwnProperty(link)) {
                                await create_webhook(message, message.channelId)
                                settings = JSON.parse(fs.readFileSync('/home/pi/Desktop/Kochy-bot/settings.json', 'utf8'));
                                webhooks_list = eval(settings.webhooks_list);
                            }

                            //send the message with the webhook.
                            var webhook = await bot.fetchWebhook(webhooks_list[link]);
                            await webhook.send({
                                content: message.content,
                                username: message.member.displayName,
                                avatarURL: message.author.avatarURL()
                            });
                            log.write(`${message.content} was send to channel ${webhooks_list[link]}`, message.member, message.channel);
                        });
                    }
                }

            }
            //try to delete the downloaded image.
            try {
                if (fs.existsSync(i_path)) {
                    fs.unlinkSync(i_path)
                }
            } catch (e) { log.write(e) }

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
   * If the name of the file is unknown, create a new name bases on 'KochyBotImg_(randint)'
   * 
   * @param  {String} name  The original name of the file
   * @param  {String} url   The URL to download the file
   * @return {String}       The name of the downloaded file
   */
    try {
        if (name.includes('unknown')) {
            name = ('KochyBotImg_' + Math.random().toString(36).substring(2) + '.' + name.split('.').pop(0));
        }
        var file = fs.createWriteStream('images/' + name);
        return new Promise((resolve, reject) => {
            var responseSent = false; // flag to make sure that response is sent only once.
            request.get(url)
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

async function create_webhook(message, channel_id) {

    /**
     * Create a webhook for the specified channel if he is not already registered to the webhook server.
     * 
     * @param {Discord.Message} message The message who the command process is associated with.
     * @param {string} channel_id The ID of the channel who the webhook will be associated with.
     * @return  Return nothings, but the webhook_list has been edited.
     */

    try {
        const channel = await bot.channels.fetch(channel_id);
        //check if the channel already have a webhook.
        var wbs = await channel.fetchWebhooks()

        var settings = JSON.parse(fs.readFileSync('/home/pi/Desktop/Kochy-bot/settings.json', 'utf8'));
        var webhooks_list = eval(settings.webhooks_list);

        //find all webhooks who named KochyBot.
        if (wbs.find(Webhook => Webhook.name === 'KochyBot')) {

            var webhooks_already_registered = [];
            Array.from(wbs.values()).filter(Webhook => Webhook.name === 'KochyBot').forEach(function (webhook) { webhooks_already_registered.push(webhook.id); });

            if (webhooks_already_registered.length > 1) {
                //keep the first if multiple webhooks are found.
                webhooks_list[channel_id] = webhooks_already_registered[0];
                delete webhooks_already_registered[0];

                //delete all the other webhooks.
                webhooks_already_registered.forEach(async function (id) {
                    var wb = await bot.fetchWebhook(id);
                    wb.delete('They have too much webhook :(');
                    log.write('webhook ' + wbs.values().filter(Webhook => Webhook.id === id) + 'has been deleted');
                });
            } else { webhooks_list[channel_id] = webhooks_already_registered[0]; }


            log.write(`A webhook has been registered for "${channel.name}" (${channel_id}).`);

        } else {

            try {
                var webhook = await channel.createWebhook({
                    name: bot.user.username,
                    avatar: bot.user.avatar,
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

        fs.writeFileSync("/home/pi/Desktop/Kochy-bot/settings.json", JSON.stringify(settings));


        log.write(`A webhook for "${channel.name}"(${channel}) was successfully registred`, message.member, message.channel);

        var fresh_linked_channel = await bot.fetchWebhook(webhooks_list[channel_id]);

        const text = new EmbedBuilder()
            .setColor('#245078')
            .setTitle('**Information**')
            .setDescription(`This channel has been linked to ${channel} in server ${channel.guild.name}`)
            .setFooter({ text: 'unlink to unlink this channel' })

        await fresh_linked_channel.send({ embeds: [text] });
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
