// template for new commands
import { ICommand } from "./ExtendedClient";
import { Message, PermissionsBitField } from "discord.js";

export const command: ICommand = {
    data: {
        name: 'template',
        description: 'template for new commands',
        aliases: ['t'],
        usage: 'template',
        cooldown: 5,
        guildOnly: true,
        args: false,
        argsMinLength: 0,
        permissions: [ PermissionsBitField.Flags.Administrator ]
    },

    async execute(message,  args) {
        // code
    }
}