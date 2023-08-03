import { IEvent } from "../ExtendedClient";
import { GuildScheme } from "../models/models";

export const event: IEvent = {
    name: 'ready',
    once: true,

    async execute(client) {
        console.log(`Logged in as ${client.user?.tag}!`);

        // loop through all guilds and check if they exist in the database
        client.guilds.cache.forEach(async (guild) => {
            const guildData = await GuildScheme.findOne({ guildId: guild.id });
            if (!guildData) {
                console.log(`Guild ${guild.name} (${guild.id}) not found in database. Creating...`);
                const newGuild = new GuildScheme({ guildId: guild.id });
                await newGuild.save();
                console.log(`Guild ${guild.name} (${guild.id}) created!`);
            }
        });
    }
}