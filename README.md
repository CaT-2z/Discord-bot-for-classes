# Discord-bot-for-classes
Discord bot to help with studying aka **Bernard**

## Installation
This guide is aimed at people with no prior knowledge of pip git or npm whatsoever.

Firstly, download the repository and place it in a folder.

This is a discord.js bot using node.js, download it at the [node.js website](https://nodejs.org/en/).
Once downloaded, open a Powershell window as administrator, navigate to the created folder, and type
```bash
npm i discord.js
```
For the discord bot to be able to stream audio, you'll need to download [ffmpeg](https://ffmpeg.org/).

Other dependencies are as follows:

 - Windows build tools 
```npm install --global --production --vs2015 --add-python-to-path windows-build-tools```

 - Event-stream
```npm i event-stream```

 - ffmpeg-static
```npm i ffmpeg-static```

 - The discord.js opus library 
```npm i discord.js @discordjs/opus```

 - sodium (for better audio performance)
```npm i sodium```

 - ytdl-core-discord for youtube streaming ability ```npm i ytdl-core-discord```

Don't forget to copy your [Discord application's token](https://discordapp.com/developers/applications) to the ```Token Here``` at the end of _app.js_

## Usage
To start the bot, use Powershell to open the _app.js_ file with node.js
```bash
node app.js
```
The command prompt will write a message similar to this:
```bash
Logged in as {your application's name}!
overridekey : {the current override key}
```
This override key is used for changing who the bot accepts inputs from.

***
## Commands
To command this discord bot use the `wyk` or `would you kindly` prefix followed by a command:

 - `wyk sort rolename` creates temporary voicechannels and puts guildmembers with the role _rolename_ to a voicechannel randomly, so that they end up in pairs. Use `wyk sort rolename (number)` to choose the size of the groups in one voicechannel _(defaults to 2)_ and/or use `wyk sort rolename | name1 name2 name3...` to make exceptions with people to not be sorted randomly. These people will instead be sorted in groups in the order you typed them in.
 
  - `wyk fromText` sort people into groups using the file *pairs.txt*. Each line in the text file corresponds to a voicechannel.
  
  - `wyk move rolename vc` Moves members of a certain role who are currently using a voice channel to move to the voicechannel vc.
  
  - `wyk private name1 name2...` creates a private voicechannel where the maximum user count is the number of names provided.
  
  - `wyk burn` destroys all created voicechannels, and everybody in them into the servers _**afk channel**_, if there is none, the members will simply disconnect from voice communications. You can give a voicechannel to put members into with `wyk burn vc`, _vc_ being the voicechannels name.
  
 - `wyk say word1 word2...` The bot connects to the voicechannel the user who sent the message is in, and says the pronounciation of the word(s). Afterwards they will disconnect, unless the option `autodc` is set to `false`. Keep in mind that there are some words which the bot can't get the sound file of due to the architecture of [oxford's](https://www.oxfordlearnersdictionaries.com/) media library. If the user is not using voice communication, the bot simply sends an embedded message with the link to the sound file in it.
 
 - `wyk stream youtubelink` The bot connects to the voicechannel of the user who sent the message and streams through it the youtube video's audio with said link. The bot accepts the whole link such as `https://www.youtube.com/watch?v=id` or `youtube.com/watch?v=id` or just the `id` itself.
 
 To deactivate the bot without disconnecting it type `Bernard silence` or `Freeze all motor functions`, to reactivate it type `Bring yourself back online`.
 
 **Admin commands**
 Admin commands are commands that use the *override key* as a prefix. These can be used to limit who can use the bot's commands:
  - `key clear` will turn on Whitelist mode. In Whitelist mode, only admins, the owner, and people in the Whitelisted users group can use the bot.
  - `key void` will turn on Whitelist+ mode. In it, only the whitelisted users can use the bot.
  - `key free` turns off Whitelist mode and generates a new key.
  - `key add name1 name2...` adds members to Whitelisted users group.
  - `key remove name1 name2` removes membes from Whitelisted users group.

