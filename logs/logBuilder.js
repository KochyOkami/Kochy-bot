const fs = require('fs');
var dateTime = require('node-datetime');
var dt = dateTime.create();



fs.writeFile('logs/errors.log', "-".repeat(20) + "Start Log " + dt.format('Y-m-d H:M:S') + "-".repeat(20) + "\n", { flag: 'a+' }, (err) => {
    if (err) {
        console.error(err)
        return
    }
})


async function write(message, author = undefined, channel = undefined) {
    var date = dt.format('Y-m-d H:M:S');
    if (typeof message === 'object' && message !== null && 'toString' in message) {
        var message = message.toString();
    }

    if (author === undefined && channel === undefined) {
        await fs.appendFile('logs/errors.log', `${date}: ${message}\n`, (err) => {
            if (err) {
                console.error(err)
                return;
            }
            console.log(date + ": " + message);
            return;
        })
    }
    if (channel === undefined && author != undefined) {
        await fs.appendFile('logs/errors.log', `${date}: ${message} by ${author.user.tag}(${author})\n`, (err) => {
            if (err) {
                console.error(err)
                return;
            }
            console.log(`${date}: ${message} by ${author.user.tag}(${author})`);
            return;
        })
    }

    if (channel != undefined && author != undefined) {
        await fs.appendFile('logs/errors.log', `${date}: ${message} by ${author.user.tag}(${author}) in channel ${channel.name}(${channel})\n`, (err) => {
            if (err) {
                console.error(err)
                return;
            }
            console.log(`${date}: ${message} by ${author.user.tag}(${author}) in channel ${channel.name}(${channel})`);
            return;
        })
    }

};

async function msg(message, author = undefined, channel = undefined) {
    var date = dt.format('Y-m-d H:M:S');
    if (typeof message === 'object' && message !== null && 'toString' in message) {
        var message = message.toString();
    }

    if (author === undefined && channel === undefined) {
        await fs.appendFile('logs/msg.log', `${date}: ${message}\n`, (err) => {
            if (err) {
                console.error(err)
                return;
            }
            console.log(date + ": " + message);
            return;
        })
    }
    if (channel === undefined && author != undefined) {
        await fs.appendFile('logs/msg.log', `${date}: ${message} by ${author.user.tag}(${author})\n`, (err) => {
            if (err) {
                console.error(err)
                return;
            }
            console.log(`${date}: ${message} by ${author.user.tag}(${author})`);
            return;
        })
    }

    if (channel != undefined && author != undefined) {
        await fs.appendFile('logs/msg.log', `${date}: ${message} by ${author.user.tag}(${author}) in channel ${channel.name}(${channel})\n`, (err) => {
            if (err) {
                console.error(err)
                return;
            }
            console.log(`${date}: ${message} by ${author.user.tag}(${author}) in channel ${channel.name}(${channel})`);
            return;
        })
    }

};

module.exports = {
    write,
    msg
}
