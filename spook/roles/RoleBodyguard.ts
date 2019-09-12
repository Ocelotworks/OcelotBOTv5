import Role from "./Role";
import {User} from "discord.js";

export default class RoleBodyguard extends Role{


    getDesc(): string {
        return "Your goal is to stop {{user}} from being spooked.";
    }

    getName(): string {
        return "Bodyguard";
    }

    handlePick(users: User[]) {

    }

    checkRequirements(spook: Object): boolean {
        return false;
    }

}