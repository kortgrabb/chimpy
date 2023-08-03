import { ICommand } from "../../ExtendedClient";
import { ChannelType, Message, PermissionsBitField } from "discord.js";

export const command: ICommand = {
    data: {
        name: 'echo',
        description: 'echoes the message in channel',
        aliases: ['e'],
        usage: 'echo <channel> <...message>',
        cooldown: 3,
        guildOnly: true,
        permissions: [ PermissionsBitField.Flags.Administrator ],
        args: true,
        argsMinLength: 2,
    },

    async execute(message,  args) {
        // get channel in cache by name or id
        const channel = message.guild?.channels.cache.get(args[0]) || message.guild?.channels.cache.find(c => c.name === args[0]);
        if (!channel) {
            message.channel.send('Channel not found!');
            return;
        }

        if (channel.type == ChannelType.GuildText) {
            // remove channel from args
            args.shift();
            // send message to channel
            channel.send(args.join(' '));
        } else {
            message.channel.send('Channel is not a text channel!');
        }
    }
}