const Discord = require('Discord.js');
const fs = require('fs');
const client = new Discord.Client();
const ytdl = require('ytdl-core-discord');
const es = require('event-stream');
const sort = require('./sort.js');

var isListening = true;
var canSpeak = true;

//Enable autodisconnect
var autodc = true;

var overrideKey;
var whiteListedUsers = new Set();
var isWhiteListed;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    overrideKey = Math.random().toString(36).substring(7, 15);
    console.log(`overridekey : ${overrideKey}`);
});

function overrides(msg) {
    if (!whiteListedUsers.has(msg.member.id)) {
        whiteListedUsers.add(msg.member.id);
    }
    msg.channel.send('Override accepted,');
    msg.content = msg.content.slice(overrideKey.length + 1);
    console.log(msg.content);
    switch (msg.content.split(' ')[0]) {
        case 'clear':
            isWhiteListed = 1;
            console.log('Whitelist on');
            msg.channel.send('Whitelist on');
            break;
        case 'void':
            isWhiteListed = 2;
            console.log('Whitelist+ on');
            msg.channel.send('Giving over manual control');
            break;
        case 'free':
            isWhiteListed = 0;
            console.log('Whitelist off');
            msg.channel.send('Whitelist turned off');
            overrideKey = Math.random().toString(36).substring(7, 15);
            console.log(`overridekey : ${overrideKey}`);
            break;
        case 'add':
            names = msg.content.split(' ')
            names.shift();
            for (name of names) {
                x = msg.guild.members.cache.find(n => RegExp(name, i).test(n.name));
                if (!whiteListedUsers.has(x.id)) {
                    whiteListedUsers.add(x.id);
                }
            }
            break;
        case 'remove':
            names = msg.content.split(' ')
            names.shift();
            for (name of names) {
                x = msg.guild.members.cache.find(n => RegExp(name, i).test(n.name));
                if (whiteListedUsers.has(x.id)) {
                    whiteListedUsers.delete(x.id);
                }
            }
            break;
        default:
            break;
    }
}

function validate(member) {
    if (isWhiteListed === 1) {
        if (whiteListedUsers.has(member.id) || member === member.guild.owner || member.permissions.has(0x00000008, true)) {
            return true;
        }
        else { return false; }
    }
    if (isWhiteListed === 2) {
        if (whiteListedUsers.has(member.id)) {
            return true;
        }
        else { return false; }
    }
    if (isWhiteListed === 3) {

    }
    else {
        return true;
    }
}

async function streamYt(connection, url) {
    const dispatcher = connection.play(await ytdl(url), { type: 'opus' });
    dispatcher.on('finish', () => {
        if (autodc) {
            connection.disconnect();
        }
    });

}

function messageReader(msg) {
    if (((msg.content.includes('silence') || msg.content.includes('shut up')) && msg.content.startsWith('Bernard')) || msg.content.match(/freeze all motor functions/i)) {
        isListening = false;
        msg.channel.send('shutting down');
    }
    if (msg.content.startsWith('wyk') || msg.content.toLowerCase().startsWith('would you kindly')) {
        if (msg.content.includes('myroles')) {
            msg.member.roles.cache.each(fn => msg.channel.send(fn.name, 'Role'));
        }
        if (msg.content.includes('sort')) {
            sort.vcSort(msg);
        }
        if (msg.content.includes('fromText')) {
            sort.sortFromText(msg);
        }
        if (msg.content.includes('burn')) {
            sort.vcBurn(msg);
        }
        if (msg.content.includes('voice')) {
            if (msg.channel instanceof Discord.TextChannel) {
                msg.channel.guild.channels.cache.each(fn => {
                    if (fn.type === 'voice') {
                        msg.channel.send(fn.name);
                    }
                }, 'GuildChannel');
            }
        }
        if (msg.content.includes('move')) {
            const operators = msg.content.match(/move .*/).toString().slice(5).split(' ');
            const role = msg.channel.guild.roles.cache.find(x => {
                return RegExp(operators[0], 'i').test(x.name);
            });
            const channel = msg.channel.guild.channels.cache.find((channel) => {
                return RegExp(operators[1], 'i').test(channel.name) && channel.type === 'voice';
            }, 'GuildChannel');
            role.members.each(member => {
                if (member.presence.status === 'online' && member.voice.channel) {
                    member.voice.setChannel(channel);
                }
            }, 'GuildMember');        
        }
        if (msg.content.includes('say')) {
            if (msg.member) {
                say(msg);
            }
            else {
                msg.channel.send('You can only use this command on a server.');
            }
        }
        if (msg.content.includes('togglespeak')) {
            if (canSpeak) {
                canSpeak = false;
            }
            else {
                canSpeak = true;            }
            console.log(`Speaking is now set to ${canSpeak}`);
        }
        if (msg.content.includes('stream')) {
            if (msg.member.voice.channel) {
                const link = msg.content.match(/stream .*/i).toString().slice(7);
                console.log(link);
                if (link.startsWith('https://')) {
                    msg.member.voice.channel.join().then(channel => {
                        streamYt(channel, link);
                    }).catch(err => console.log(err));
                }
                else if (link.startsWith('youtube')) {
                    msg.member.voice.channel.join().then(channel => {
                        streamYt(channel, 'https://www.' + link);
                    }).catch(err => console.log(err));
                }
                else if (link.length === 11) {
                    msg.member.voice.channel.join().then(channel => {
                        streamYt(channel, 'https://www.youtube.com/watch?v=' + link);
                    }).catch(err => console.log(err));
                }
                else {
                    msg.channel.send('Stream only accepts valid links.');
                }
            }
            else {
                msg.channel.send('Must be in voiceChannel.');
            }
        }
        if (msg.content.includes('private')) {
            sort.private(msg);
        }          
    }
    if (msg.content.toLowerCase().startsWith('.scp')) {
        if (!isNaN((line = msg.content.split(' ')[1]))) {
            if (line.length < 2) {
                msg.channel.send(`http://www.scp-wiki.net/scp-00${line} `);
            }
            else if (line.length < 3) {
                msg.channel.send(`http://www.scp-wiki.net/scp-0${line} `);
            }
            else {
                msg.channel.send(`http://www.scp-wiki.net/scp-${line} `);
            }
        }
        else {
            msg.channel.send('Scp must be a number');
        }
    }
}

async function speak(channel, words) {
    const baseUrl = 'https://www.oxfordlearnersdictionaries.com/media/english/uk_pron_ogg/';
    const vc = await channel.join();
    console.log(words.length);
    var word;
    if (words.length !== 0) {
        word = words.shift();
        console.log(word);
        var newUrl = baseUrl + word[0] + '/' + pad(word, 3) + '/' + pad(word, 5) + '/' + word + '__gb_1.ogg';
        const dispatcher = vc.play(newUrl);
        dispatcher.on('finish', () => {
            if (autodc) {
                speak(channel, words);
            }
        });
    }
    else {
        vc.disconnect();
    }
    return true;
}

function say(msg) {
    const words = msg.content.match(/say .*/i).toString().slice(4).split(' ');
    console.log(words);
    const baseUrl = 'https://www.oxfordlearnersdictionaries.com/media/english/uk_pron_ogg/';
    const channel = msg.member.voice.channel;
    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Pronunciation of ${words[0]}`)
        .setURL(baseUrl + words[0][0] + '/' + pad(words[0], 3) + '/' + pad(words[0], 5) + '/' + words[0] + '__gb_1.ogg')
        .attachFiles(['./resources/ww.png', './resources/hfuzz.jpg'])
        .setAuthor('Bernard', `attachment://ww.png`)
        .setThumbnail('attachment://hfuzz.jpg');
    if (channel) {
        if (canSpeak) {
            speak(channel, words);
        }
        else {
            msg.channel.send(exampleEmbed);
        }
    }
    else {
        msg.channel.send(exampleEmbed);
    }
}

function pad(word, n) {
    if (word.length < n) {
        let newWord = word;
        for (i = 0; i < (n - word.length); i++) {
            newWord += '_';
        }
        return newWord;
    }
    else {
        return word.slice(0, n);
    }
}
client.on('message', msg => {
    if (msg.content.startsWith(overrideKey) ) {
        overrides(msg);
    }
    else if ((msg.author != client.user) && isListening) {
        messageReader(msg)
    }
    else if ((msg.author != client.user) && msg.content.match(/bring yourself back online/i)) {
        isListening = true;
        msg.channel.send('waking up');
    }
});

process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));
client.login('Njg5NDk4MjU1ODQyNzM4MjU5.XnDvag.MIO8fQao3gKAOKDd7NYFNrtd-VQ');