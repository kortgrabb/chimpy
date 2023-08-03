import { ICommand } from "../../ExtendedClient";
import { ChannelType, Message, PermissionsBitField } from "discord.js";

// purge command

export const command: ICommand = {
    data: {
        name: 'purge',
        description: 'purges messages',
        aliases: ['clear', 'clean', 'delete', 'prune', 'nuke'],
        usage: '<amount>',
        cooldown: 5,
        guildOnly: true,
        args: true,
        argsMinLength: 1,
        permissions: [ PermissionsBitField.Flags.Administrator ]
    },

    async execute(message,  args) {
        const amount = parseInt(args[0]);
        if (isNaN(amount)) {
            message.channel.send('Amount is not a number!');
            return;
        }

        if (amount < 1 || amount > 100) {
            message.channel.send('Amount must be between 1 and 100!');
            return;
        }

        if (message.channel.type == ChannelType.GuildText) {
            // bulk delete messages and filter out pinned messages and old
            await message.channel.bulkDelete(amount, true).then(messages => {
                let users = new Set();
                messages.forEach(m => {
                    users.add(m?.author);
                });

                // list all users and the corresponding amount of messages deleted
                let msg = `${messages.size} messages purged\n\n`;
                users.forEach(u => {
                    const count = messages.filter(m => m?.author == u).size;
                    msg += `${u} - ${count}\n`;
                });

                let reply = message.channel.send(msg);

                setTimeout(() => {
                    reply.then(m => {
                        m.delete();
                    });
                }, 3000);
            }).catch(err => {
                console.error(err);
                message.channel.send('Error purging messages!');
            });
        } else {
            message.channel.send('Channel is not a text channel!');
        }
    }
}