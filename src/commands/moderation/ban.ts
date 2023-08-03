import { Guild, GuildMember, GuildMemberManager, Message, PermissionsBitField } from "discord.js";
import { ICommand } from "../../ExtendedClient";
import { UserScheme } from "../../models/models";

export const command: ICommand = {
    data: {
        name: 'ban',
        description: 'Ban a user',
        aliases: [],
        usage: '<user> <reason>',
        cooldown: 2,
        guildOnly: true,
        args: true,
        argsMinLength: 1,
        permissions: [ PermissionsBitField.Flags.BanMembers ]
    },

    async execute(message: Message, args: string[]) {
        const member = message.mentions.members?.first() || args[0];
        if (!member) {
            message.reply('you need to mention a user or id!');
            return;
        }

        const reason = args.slice(1).join(' ') || 'no reason provided';

        await banUser(message.guild!, member, reason);

        message.channel.send(`${member} has been banned. Reason: ${reason}`);
    }
};

async function banUser(guild: Guild, member: GuildMember | string, reason: string) {
    if (member instanceof GuildMember) {
        const userId = member.id;
        const ban = { reason, date: new Date() };
    
        await UserScheme.findOneAndUpdate(
            { userId },
            { $push: { 'punishments.bans': ban } },
            { upsert: true, new: true }
        );
    
        member.ban({ reason });
    } else {
        const userId = member;
        const ban = { reason, date: new Date() };
    
        await UserScheme.findOneAndUpdate(
            { userId },
            { $push: { 'punishments.bans': ban } },
            { upsert: true, new: true }
        );

        guild.members.ban(userId, { reason });
    }
}
