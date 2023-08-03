import mongoose from "mongoose";

const userActionSchema = new mongoose.Schema({
    actionType: {
        type: String,
        enum: ['warn', 'mute', 'kick', 'ban'],
        required: true,
    },
    reason: String,
    date: {
        type: Date,
        default: Date.now,
    },
});

const guildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    users: [String],
    prefix: {
        type: String,
        required: true,
        default: '!',
    },
    greeting: {
        welcomeChannelId: {
            type: String,
            default: null,
        },
        welcomeMessage: {
            type: String,
            default: 'Welcome {user} to {guild}!',
        },
        leaveChannelId: {
            type: String,
            default: null,
        },
        leaveMessage: {
            type: String,
            default: '{user} has left {guild}!',
        },
    },
    moderation: {
        logChannelId: {
            type: String,
            default: null,
        },
        logEnabled: {
            type: Boolean,
            default: false,
        },
        logIgnoreChannels: [String],
        logIgnoreUsers: [String],
        logIgnoreRoles: [String],
        staffRoleIds: [String],
    },
}, {
    timestamps: true,
});

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    punishments: {
        warns: [userActionSchema],
        mutes: [userActionSchema],
        kicks: [userActionSchema],
        bans: [userActionSchema],
    }                                                                   
}, {
    timestamps: true, 
});

export const GuildScheme = mongoose.model('Guild', guildSchema);
export const UserScheme = mongoose.model('User', userSchema);