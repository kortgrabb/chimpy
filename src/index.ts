import { ChannelType, IntentsBitField, PermissionsBitField } from 'discord.js';
import * as config from './config.json';
import { ExtendedClient } from './ExtendedClient';
import fs from 'node:fs'
import path from 'node:path'
import mongoose from 'mongoose'

export const client = new ExtendedClient({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages,
    ]
});

// connect to mongodb with ip not localhost
mongoose.connect('mongodb://127.0.0.1:27017/chimpy').then(() => {
    console.log('connected to mongodb');
}).catch((err) => {
    console.log(err);
});

// read and load all commands (ICommand)
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, `commands/${folder}`)).filter(file => file.endsWith('.ts'));

    console.log(`loading commands from folder: ${folder}`)

    for (const file of commandFiles) {
        const command = require(path.join(__dirname, `commands/${folder}/${file}`));
        client.commands.set(command.command.data.name, command.command);

        console.log(`loaded command: ${command.command.data.name}`)

        if (command.command.data.aliases) {
            for (const alias of command.command.data.aliases) {
                client.aliases.set(alias, command.command.data.name);

                console.log(`loaded alias: ${alias}`)
            }
        }
    }
}

// read and load all events (IEvent)
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.ts'));
for (const file of eventFiles) {
    const { event } = require(path.join(__dirname, `events/${file}`));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }

    console.log(`loaded event: ${event.name}`)
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const prefix = config.BOT_PREFIX
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;
    
    const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName)!);
    if (!command) return;

    if (command.data.guildOnly && message.channel.type === ChannelType.DM) {
        message.reply('I can\'t execute that command inside DMs!');
        return;
    }

    if (command.data.permissions) {
        const authorPerms = message.channel.type === ChannelType.GuildText ? message.member?.permissions : null;
        if (!authorPerms || !authorPerms.has(command.data.permissions)) {
            message.reply('You can not do this!');
            return;
        }
    }

    if (command.data.cooldown) {
        if (!client.cooldowns.has(command.data.name)) {
            client.cooldowns.set(command.data.name, new Map());
        }

        const now = Date.now();
        const timestamps = client.cooldowns.get(command.data.name)!;
        const cooldownAmount = (command.data.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id)! + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.data.name}\` command.`);
                return;
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    if (command.data.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.data.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.data.name} ${command.data.usage}\``;
        }

        message.channel.send(reply);
        return;
    }

    if (command.data.argsMinLength && args.length < command.data.argsMinLength) {
        let reply = `You didn't provide enough arguments, ${message.author}!`;

        if (command.data.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.data.name} ${command.data.usage}\``;
        }

        message.channel.send(reply);
        return;
    }

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(config.BOT_TOKEN);