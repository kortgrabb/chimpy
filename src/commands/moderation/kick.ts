import { PermissionsBitField, Message, GuildMember } from "discord.js";
import { ICommand } from "../../ExtendedClient";
import { UserScheme } from "../../models/models";

export const command: ICommand = {
    data: {
        name: 'kick',
        description: 'Kick a user',
        aliases: [],
        usage: '<user> <reason>',
        cooldown: 2,
        guildOnly: true,
        args: true,
        argsMinLength: 1,
        permissions: [ PermissionsBitField.Flags.KickMembers ]
    },

    async execute(message: Message, args: string[]) {
        const member = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        if (!member) {
            message.reply('you need to mention a user or id!');
            return;
        }

        const reason = args.slice(1).join(' ') || 'no reason provided';

        await kickUser(member, reason);
        message.channel.send(`${member} has been kicked. Reason: ${reason}`);
    }
};

async function kickUser(member: GuildMember, reason: string) {
    const userId = member.id;
    const kick = { reason, date: new Date() };

    await UserScheme.findOneAndUpdate(
        { userId },
        { $push: { 'punishments.kicks': kick } },
        { upsert: true, new: true }
    );

    member.kick(reason);
}
