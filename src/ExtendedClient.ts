// imports
import { Client, ClientEvents, Message, PermissionsBitField } from 'discord.js'

export interface ICommand {
    data: {
        name: string,
        description: string,
        aliases?: string[],
        usage?: string,
        cooldown?: number,
        guildOnly?: boolean,
        permissions?: bigint[],
        args?: boolean,
        argsMinLength?: number,
        argsMaxLength?: number,
    }

    execute(message: Message, args: string[]): Promise<void>;
}

export interface IEvent {
    name: keyof ClientEvents;
    once: boolean;
    execute(client: Client, ...args: any[]): Promise<void>;
}

export class ExtendedClient extends Client {
    public commands: Map<string, ICommand> = new Map();
    public events: Map<string, IEvent> = new Map();
    public aliases: Map<string, string> = new Map();
    public cooldowns: Map<string, Map<string, number>> = new Map();
} 