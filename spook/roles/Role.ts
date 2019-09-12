import {User} from "discord.js";

export default abstract class Role{

    bot: any;

    constructor(bot){
        this.bot = bot;
    }

    abstract getName(): string;
    abstract getDesc(): string;
    abstract handlePick(users: User[]): void;
    abstract checkRequirements(spook: Object): boolean;
}