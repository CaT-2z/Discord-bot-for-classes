const Discord = require('Discord.js');
const client = new Discord.Client();
var sorted = false;
var isListening = true;
var sortParent;
var sortArray;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

function messageReader(msg) {
    if ((msg.content.includes('silence') || msg.content.includes('shut up')) && msg.content.startsWith('Bernard')) {
        isListening = false;
        msg.channel.send('shutting down');
    }
    if (msg.content.startsWith('wyk') || msg.content.toLowerCase().startsWith('would you kindly')) {
        if (msg.content.includes('myroles')) {
            msg.member.roles.cache.each(fn => msg.channel.send(fn.name, 'Role'));
        }
        if (msg.content.includes('sort')) {
            vcSort(msg);
        }
        if (msg.content.includes('burn') && sorted) {
            vcBurn(msg);
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
    }
    if (msg.content.toLowerCase().startsWith('scp')) {
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
function vcSort(msg) {
    let role;
    let names = [];
    if (msg.content.includes('|')) {
        const vc = msg.content.match(/sort .*/).toString().slice(5, msg.content.search(/\|/) - 5);
        names = msg.content.slice(msg.content.search(/\|/) + 2).split(', ');
        role = msg.channel.guild.roles.cache.find(x => {
            return RegExp(vc, 'i').test(x.name);
        });
        console.log(vc);
    }
    else {
        const vc = msg.content.match(/sort .*/).toString().slice(5);
        console.log(vc);
        role = msg.channel.guild.roles.cache.find(x => {
            return RegExp(vc, 'i').test(x.name);
        });
    }
    if (role) {
        promises = [];
        for (var i = 0; i < names.length; i++) {
            names[i] = role.members.find(member => {
                return RegExp(names[i],'i').test(member.displayName);
            }, 'GuildMember');
        }
        names = names.filter(x => x != null && x.voice.channel);
        let memberArray = [];
        let channelArray = [];
        let parent;
        role.members.each(member => {
            if (member.presence.status === 'online' && member.voice.channel && names.indexOf(member) == -1) {
                memberArray.push(member)
            }
        }, 'GuildMember');
        memberArray.sort(() => Math.random() - 0.5);
        msg.channel.guild.channels.create('Pair', {
            type: 'category',
            reason: 'work in pairs',
        }).then((createdChannel) => {
            parent = createdChannel;
            var promises = []
            for (var i = 0; i < Math.ceil(memberArray.length / 2); i++) {
                promises.push(msg.channel.guild.channels.create(`Pair group ${i + 1}`, {
                    type: 'voice',
                    parent: createdChannel,
                }).then((channel) => {
                    channelArray.push(channel);
                }));
            }
            Promise.all(promises).then(() => {
                promises = [];
                for (var i = 0; i < memberArray.length; i++) {
                    promises.push(memberArray[i].voice.setChannel(channelArray[i % channelArray.length])
                        .then((person) => console.log(`${person.displayName} moved to ${channelArray[i % channelArray.length].name}`))
                        .catch(err => console.log('couldn\'t do it')));
                };
                Promise.all(promises).then(() => {
                    promises = []
                    console.log(names);
                    for (var j = 0; j < Math.ceil(names.length / 2); j++) {
                        promises.push(msg.channel.guild.channels.create(`Custom pair group ${j + 1}`, {
                            type: 'voice',
                            parent: createdChannel,
                        }).then((channel) => {
                            channelArray.push(channel);
                            names[j * 2].voice.setChannel(channel).then((name) => console.log(`${name.displayName} moved to ${channel.name}`))
                                .catch(err => console.log(err));
                            if (names[j * 2 + 1]) {
                                names[j * 2 + 1].voice.setChannel(channel).then((name) => console.log(`${name.displayName} moved to ${channel.name}`))
                                    .catch(err => console.log(err));
                            }
                        }));
                    }
                    j = 0;
                    Promise.all(promises)
                        .then(() => {
                            sortParent = parent;
                            sortArray = channelArray;
                            sorted = true;
                        });
                });
        })
        }).catch(err => console.log(err));
    }
    else {
        msg.channel.send(`couldn\'t find role with name ${vc}`);
    }
}
function vcBurn(msg) {
    promises = []
    let word;
    if (!(msg.content.endsWith('burn') && msg.content.length < 13)) {
        word = msg.content.match(/burn .*/).toString().slice(5);
    }
    let burnChannel = msg.channel.guild.channels.cache.find((channel) => {
        return RegExp(word, 'i').test(channel.name) && channel.type === 'voice';
    }, 'GuildChannel');
    console.log(burnChannel);
    if (!burnChannel) {
        burnChannel = msg.channel.guild.afkChannel;
    }
    promises.push(sortArray.forEach((channel) => {
        channel.members.each((member) => {
            member.voice.setChannel(burnChannel);
        }, 'GuildMember');
        channel.delete();
    }));
    promises.push(sortParent.delete());
    Promise.all(promises).then(() => {
        sorted = false;
        console.log('Deleted all channels');
    });
}
client.on('message', msg => {
    if ((msg.author != client.user) && isListening) {
        messageReader(msg)
    }
    else if ((msg.author != client.user) && msg.content.match(/bring yourself back online/i)) {
        isListening = true;
        msg.channel.send('waking up');
    }
});

client.login('Njg5NDk4MjU1ODQyNzM4MjU5.XnDvag.MIO8fQao3gKAOKDd7NYFNrtd-VQ');