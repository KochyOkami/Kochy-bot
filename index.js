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
const { Collection,
    EmbedBuilder,
    Routes } = require('discord.js');

const { REST } = require('@discordjs/rest');

const log = require('./logs/logBuilder.js');
const config = require('./config.js');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];


bot.login(process.env.DISCORD_TOKEN);

//-----------------------------------Discord------------------------------------------------

// Creating a collection for commands in client
bot.commands = new Collection();

//Declare all commands. 
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    bot.commands.set(command.data.name, command);
}

bot.on("ready", async () => {
    //set the presence of the bot
    bot.user.setPresence({
        status: "online",
        activities: [{ name: "la version" + config.bot_version }],
    });
    //Register all commands for the bot.
    const rest = new REST({
        version: '10'
    }).setToken(process.env.DISCORD_TOKEN);

    const TEST_GUILD_ID = false;
    const CLIENT_ID = bot.user.id;

    // rest.put(Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), { body: [] })
    //     .then(() => console.log('Successfully deleted all guild commands.'))
    //     .catch(console.error);

    //Load all commands.
    (async () => {
        try {
            if (TEST_GUILD_ID == false) {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID),
                    { body: commands },
                );
                log.write(`Successfully registered ${commands.length} application commands for global`);

            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID),
                    { body: commands },
                );
                log.write(`Successfully registered ${commands.length} application commands for development guild`);
            }
        } catch (error) {
            if (error) log.write(error);
        }
    })();

    //Say that the bot is ready.
    const channel = await bot.channels.fetch('988784456959672350');
    await channel.send("@here, I'm ready ^^");
    log.write(`${bot.user.tag} logged successfully.`);

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
    const accept = Array('jpg', 'png', 'gif', 'jpeg', 'webp', 'jpg');

    if (message.webhookId) return;
    if (message.member.id === bot.user.id) return;
    try {
        var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
        var links_list = eval(settings.links_list);
        var webhooks_list = eval(settings.webhooks_list);

        if (links_list[message.channel.id]) {
            if (message.attachments != undefined && message.attachments.size) {

                message.attachments.forEach(async function (attach) {
                    if (accept.indexOf(attach.name.split('.')[-1] != -1)) {
                        var name = await download(attach.url, attach.name);
                        var path = "./images/" + name.toString()

                        links_list[message.channel.id].forEach(async function (link) {

                            if (message.content != '') {
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
                            }
                        });
                    }

                })
            } else {
                if (message.content != '') {
                    links_list[message.channel.id].forEach(async function (link) {
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

    } catch (error) {
        log.write(error, message.member, message.channel);

    }
});

async function download(url, name) {

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
};

