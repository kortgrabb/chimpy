import { Message, GuildMember, PermissionsBitField } from 'discord.js';
import { UserScheme } from '../../models/models';
import { ICommand } from '../../ExtendedClient';

export const command: ICommand = {
    data: {
        name: 'mute',
        description: 'mute a user',
        aliases: ['timeout', 'silence', 'shutup'],
        usage: '<user> <time> <reason>',
        cooldown: 2,
        guildOnly: true,
        args: true,
        argsMinLength: 1,
        permissions: [ PermissionsBitField.Flags.MuteMembers ]
    },

    async execute(message: Message, args: string[]) {
        const member = message.mentions.members?.first();
        if (!member) {
            message.reply('you need to mention a user!');
            return;
        }

        let time = args[1] || '10m';
        const reason = args.slice(2).join(' ') || 'no reason provided';

        if (time === '-1') {
            await unmuteUser(member, reason);
            message.channel.send(`${member} has been unmuted. Reason: ${reason}`);
            return;
        }

        const timeNumber = parseTime(time);
        if (timeNumber === null) {
            message.reply('invalid time format! Use m for minutes, h for hours, d for days.');
            return;
        }

        await muteUser(member, timeNumber, reason);
        message.channel.send(`${member} has been muted for ${time}. Reason: ${reason}`);
    }
};

async function muteUser(member: GuildMember, time: number, reason: string) {
    const userId = member.id;
    const mute = { reason, date: new Date() };
    

    await UserScheme.findOneAndUpdate(
        { userId },
        { $push: { 'punishments.mutes': mute } },
        { upsert: true }
    );

    timeoutUser(member, time, reason);
}

async function unmuteUser(member: GuildMember, reason: string) {
    const userId = member.id;

    // remove the last mute from the user's punishments
    await UserScheme.findOneAndUpdate(
        { userId },
        { $pop: { 'punishments.mutes': 1 } }
    );

    timeoutUser(member, null, reason);
}

function timeoutUser(member: GuildMember, time: number | null, reason: string) {
    if (time === null) {
        member.timeout(null, reason); // Unmute the member
    } else {
        member.timeout(time, reason); // Mute the member for the specified time
    }
}

function parseTime(time: string): number | null {
    const timeSuffix = time.slice(-1);
    const timeValue = parseInt(time.slice(0, -1), 10);

    if (isNaN(timeValue)) return null;

    switch (timeSuffix) {
        case 'm': return timeValue * 60 * 1000;
        case 'h': return timeValue * 60 * 60 * 1000;
        case 'd': return timeValue * 24 * 60 * 60 * 1000;
        default: return null;
    }
}
