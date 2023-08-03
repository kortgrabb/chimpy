import { client } from "../..";
import { ICommand } from "../../ExtendedClient";
import { Message } from "discord.js";

export const command: ICommand = {
    data: {
        name: 'ping',
        description: 'shows the bot\'s ping',
        aliases: ['p'],
        usage: 'ping',
        cooldown: 2,
        guildOnly: true,
        args: false,
        argsMinLength: 0,
    },

    async execute(message: Message, args) {

        const reply = await message.channel.send('Pinging...');
        const latency = reply.createdTimestamp - message.createdTimestamp;

        reply.edit(`🏓 Pong! API latency: ${client.ws.ping}ms \nBot latency: ${latency}ms 🚀`);
    }
}
