const Discord = require('discord.js');
const bot = new Discord.Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "MessageContent",
        "GuildWebhooks"
    ]
});
//systemctl stop yaoicute.service

const fs = require('fs');
const request = require('request');
const {
    Collection,
    EmbedBuilder,
    Routes } = require('discord.js');

const { REST } = require('@discordjs/rest');

const log = require('./logs/logBuilder.js');
const config = require('./config.js');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];
const dotenv = require('dotenv');
dotenv.config();


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
}


bot.on("ready", async () => {
    try {
        //set the presence of the bot
        bot.user.setPresence({
            status: "online",
            activities: [{ name: "la version " + config.bot_version }],
        });

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

        //rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] })
        //  .then(() => console.log('Successfully deleted all commands.'))
        //.catch(console.error);

        TEST_GUILD_ID = false;

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
    if (interaction.commandName === 'restart') {
        const command = bot.commands.get(interaction.commandName);
        await command.execute(interaction); return;
    }
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
        await command.execute(interaction)
            .catch(
                //avoid sources of error.
                async function (error) {
                    log.write(error);
                    const text = new EmbedBuilder()
                        .setColor('#FF0000')
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
            .setColor('#FF0000')
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
        try {
            var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
            var cookie = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'));
            
            var links_list = eval(settings.links_list);
            var save_img_list = eval(settings.save_img_list);
            var i_path = ""
            console.log(cookie, message.author.id)

            if (cookie[message.author.id]){
                cookie[message.author.id] += settings.cookie_add
            }else{
                cookie[message.author.id] = settings.cookie_add
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
