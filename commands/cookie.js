const { EmbedBuilder, MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const log = require('../logs/logBuilder.js');
const fs = require('fs');
const { PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
var requests = require('request');
const { request } = require('undici');
const { type } = require('os');
const { isNull } = require('util');

// Warn if overriding existing method
if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;
    // if the argument is the same array, we can be sure the contents are same as well
    if (array === this)
        return true;
    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false });

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cookie")
        .setDescription("For see the amount of your cookie of someone else.")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('the user')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
            if (settings.cookie_status == 'off') {
                const text = new EmbedBuilder()
                    .setColor('#C0392B')
                    .setTitle(`**Sorry**`)
                    .setDescription(`Cookie system is in maintenance mode,  please wait for the next update.`)
                    .setThumbnail('attachment://dead-cat.png')
                await interaction.editReply({ embeds: [text], files: [`./images/obj/dead-cat.png`] });
            } else {
                var user = interaction.user;
                if (await interaction.options.getUser('user', false)) {
                    user = await interaction.options.getUser('user', true);
                }
                try {
                    var cookie = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'));
                    console.log(cookie.hasOwnProperty(user.id))
                    if (!cookie.hasOwnProperty(user.id)) {
                        cookie[user.id] = 0
                        fs.writeFileSync("./cookie.json", JSON.stringify(cookie))
                        var cookie_user = JSON.parse(fs.readFileSync('./cookie_user.json', 'utf8'));
                        var user_name = user.tag;
                        var user_avatar = user.displayAvatarURL();
                        console.log(cookie_user)
                        cookie_user[user.id] = { 'name': user_name, 'avatar': user_avatar }
                        fs.writeFileSync("./cookie_user.json", JSON.stringify(cookie_user));
                    }

                    var cookie_user = JSON.parse(fs.readFileSync('./cookie_user.json', 'utf8'));
                    var user_name = user.tag;
                    var user_avatar = user.displayAvatarURL();
                    console.log(cookie_user)
                    cookie_user[user.id] = { 'name': user_name, 'avatar': user_avatar }
    
                    fs.writeFileSync("./cookie_user.json", JSON.stringify(cookie_user));
                    var toplevel = top(user.id)
                    console.log(cookie[user.id].toString().length)
                    // Create a 700x250 pixel canvas and get its context
                    // The context will be used to modify the canvas
                    const canvas = Canvas.createCanvas(700, 250);
                    const context = canvas.getContext('2d');

                    const background = await Canvas.loadImage('./images/obj/cookie-parts/background.png');
                    // This uses the canvas dimensions to stretch the image onto the entire canvas
                    context.drawImage(background, 0, 0, canvas.width, canvas.height);

                    // Set the color of the stroke
                    context.fillStyle = '#245078';

                    // Draw a rectangle with the dimensions of the entire canvas
                    context.fillRect(0, 0, 9, canvas.height);


                    const cookie_jar = await Canvas.loadImage('./images/obj/cookie-parts/cookie_jar.png');

                    // This uses the canvas dimensions to stretch the image onto the entire canvas
                    context.drawImage(cookie_jar, 60, 50, cookie_jar.width / 3, cookie_jar.height / 3);

                    context.font = `55px Revue`;
                    context.fillStyle = '#FFF';
                    context.fillText('Cookie Jar', canvas.width / 2 - 70, 75);

                    context.font = applyText(canvas, user.tag.replace(/[^a-zA-Z0-9&\/\\#,+()$~%.'":*?<>{}]/g, ''));
                    context.fillStyle = '#245078';
                    context.fillText(user.tag.replace(/[^a-zA-Z0-9&\/\\#,+()$~%.'":*?<>{}]/g, ''), canvas.width / 3.3, canvas.height / 1.6);

                    context.font = `35px Revue`;
                    context.fillStyle = '#7b8e91';
                    context.fillText(cookie[user.id].toString(), canvas.width / 3.3, canvas.height - 50);

                    const cookie_img = await Canvas.loadImage('./images/obj/cookie-parts/cookie.png');
                    // This uses the canvas dimensions to stretch the image onto the entire canvas
                    context.drawImage(cookie_img, canvas.width / 3.3 + (24 * cookie[user.id].toString().length), canvas.height - 79, cookie_img.width / 2, cookie_img.height / 2);

                    context.font = `35px Revue`;
                    context.fillStyle = '#7b8e91';
                    context.fillText('Place: #' + toplevel.toString(), canvas.width / 3.3 + (25 * cookie[user.id].toString().length) + cookie_img.width / 1.5, canvas.height - 50);

                    const circle = {
                        x: 240,
                        y: 57,
                        radius: 30,
                    }
                    context.beginPath();
                    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, true);
                    context.closePath();
                    context.clip();

                    // Using undici to make HTTP requests for better performance
                    const avatar = await Canvas.loadImage(interaction.user.displayAvatarURL({ extension: 'jpg' }));

                    // Compute aspectration
                    const aspect = avatar.height / avatar.width;
                    // Math.max is ued to have cover effect use Math.min for contain
                    const hsx = circle.radius * Math.max(1.0 / aspect, 1.0);
                    const hsy = circle.radius * Math.max(aspect, 1.0);
                    // x - hsl and y - hsy centers the image
                    context.drawImage(avatar, circle.x - hsx, circle.y - hsy, hsx * 2, hsy * 2);
                    // Use the helpful Attachment class structure to process the file for you
                    const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'profile-image.png' });

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
                    //.setAuthor({ name: `${interaction.user.username}`, iconURL: `${interaction.user.avatarURL({ dynamic: true, size: 512 })}` })
                    await interaction.editReply({ files: [attachment] });
                    return;

                } catch (error) {
                    log.write(error);
                    const text = new EmbedBuilder()
                        .setColor('#C0392B')
                        .setTitle('**Error**')
                        .setDescription(`There was an error executing /cookie : \n` + '```' + error + '```')
                    await interaction.editReply({ embeds: [text] });
                    return;
                }
            }


        } catch (error) {
            log.write(error);
            const text = new EmbedBuilder()
                .setColor('#C0392B')
                .setTitle('**Error**')
                .setDescription(`There was an error executing /cookie : \n` + '```' + error + '```')
            await interaction.editReply({ embeds: [text] });
            return;
        }

    }
};

function top(user) {
    var top = Array();
    var cookie = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'));

    for (let i in cookie) {
        top.push([cookie[i], i])
    }

    top.sort(function (a, b) {
        return b[0] - a[0];
    });

    var a = [cookie[user], user]
    var toplevel = 0

    while (toplevel < top.length && !top[toplevel].equals(a)) {
        toplevel++
    }
    return toplevel + 1
}

const applyText = (canvas, text) => {
    const context = canvas.getContext('2d');

    // Declare a base size of the font
    let fontSize = 55;

    do {
        // Assign the font to the context and decrement it so it can be measured again
        context.font = `${fontSize -= 10}px Revue`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (context.measureText(text).width > canvas.width - 200);

    // Return the result to use in the actual canvas
    return context.font;
};