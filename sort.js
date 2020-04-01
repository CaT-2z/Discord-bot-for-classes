const fs = require('fs');

const pairTxt = './pairs.txt';
var sorted = false;
var sortParent = [];
var sortArray = [];

async function sortFromText(msg) {
    parent = await msg.guild.channels.create('pair', {
        type: 'category',
    });
    var charray = [];
    sortParent.push(parent);
    var i = 0;
    fs.createReadStream(pairTxt, { flags: 'r' })
        .pipe(es.split())
        .pipe(es.map(function (line, cb) {
            var users = line.split(' ');
            for (var y = 0; y < users.length; y++) {
                users[y] = msg.guild.members.cache.find(x => RegExp(users[y], 'i').test(x.displayName), 'GuildMember');
            }
            users = users.filter(x => x != null);
            msg.guild.channels.create(`Custom pair group ${i + 1}`, {
                type: 'voice',
                parent: parent,
            }).then(channel => {
                i++;
                charray.push(channel);
                for (user of users) {
                    user.voice.setChannel(channel);
                }
            });
            cb(null, line)
        }))
        .on('end', function () {
            sortArray.push(...charray);
            sorted = true;
            console.log('Finish reading.');
        })
}

function vcSort(msg) {
    let role;
    let names = [];
    let number = 2;
    let vc;
    if (/\(\d\)/i.test(msg.content)) {
        number = parseInt(/\(\d\)/i.exec(msg.content)[0].slice(1, 2), 10);
        console.log(number);
        vc = msg.content.match(/sort .*/).toString().slice(5, msg.content.search(/\(/) - 5);
    }
    if (msg.content.includes('|')) {
        if (!vc) {
            vc = msg.content.match(/sort .*/).toString().slice(5, msg.content.search(/\|/) - 5);
        }
        names = msg.content.slice(msg.content.search(/\|/) + 2).split(', ');
        role = msg.channel.guild.roles.cache.find(x => {
            return RegExp(vc, 'i').test(x.name);
        });
        console.log(vc);
    }
    else {
        if (!vc) {
            vc = msg.content.match(/sort .*/).toString().slice(5);
        }
        console.log(vc);
        role = msg.channel.guild.roles.cache.find(x => {
            return RegExp(vc, 'i').test(x.name);
        });
    }
    if (role) {
        promises = [];
        for (var i = 0; i < names.length; i++) {
            names[i] = role.members.find(member => {
                return RegExp(names[i], 'i').test(member.displayName);
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
            for (var i = 0; i < Math.ceil(memberArray.length / number); i++) {
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
                    for (var j = 0; j < Math.ceil(names.length / 2); j++) {
                        promises.push(msg.channel.guild.channels.create(`Custom pair group ${j + 1}`, {
                            type: 'voice',
                            parent: createdChannel,
                        }).then((channel) => {
                            channelArray.push(channel);
                            for (var i = 0; i < number; i++) {
                                if (names.length > 0) {
                                    names.shift().voice.setChannel(channel).then((name) => console.log(`${name.displayName} moved to ${channel.name}`))
                                        .catch(err => console.log(err));
                                }
                            }
                        }));
                    }
                    j = 0;
                    Promise.all(promises)
                        .then(() => {
                            sortParent.push(parent);
                            sortArray.push(...channelArray);
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

function private(msg){
    var names = []
    names.push(msg.content.match(/private .*/i).toString().slice(8).slice(' '));
    for (i in names) {
        names[i] = msg.guild.members.cache.find(y => RegExp(names[i], 'i').test(y.displayName));
    }
    names.push(msg.member);
    names.filter(x => x != null);
    msg.guild.channels.create('Private', {
        type: 'category',
    })
        .then(parent => {
            sortParent.push(parent);
            msg.guild.channels.create('Private channel', {
                type: 'voice',
                userLimit: names.length,
                parent: parent,
            }).then(channel => {
                sortArray.push(channel);
                for (name of names) {
                    name.voice.setChannel(channel);
                };
            })
        }
        )
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
    }));
    for (parent of sortParent) {
        promises.push(parent.delete());
    }
    Promise.all(promises).then(() => {
        promises = [];
        for (channel of sortArray) {
            promises.push(channel.delete());
        }
        Promise.all(promises).then(() => {
            sorted = false;
            sortArray = [];
            sortParent = [];
            console.log('Deleted all channels');
        });
    });
}

module.exports.vcSort = vcSort;
module.exports.sortFromText = sortFromText;
module.exports.private = private;
module.exports.vcBurn = vcBurn;