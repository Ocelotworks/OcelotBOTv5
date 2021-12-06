const {Interaction} = require('discord.js');
module.exports = class Command {

    // Metadata
    /**
     * The human-readable name of the command
     * @type {string}
     */
    name = "Unnamed Command";
    /**
     * Usage information formatted for the command parser
     * @abstract
     * @type {string}
     */
    usage = "command"
    /**
     * A short piece of help text shown when doing !help or on the website
     * @type {string|null}
     */
    detailedHelp = null
    /**
     * An example of how to use the command, markdown formattable.
     * @type {string|null}
     */
    usageExample = null
    /**
     * An example response to `usageExample`, markdown formattable.
     * @type {string|null}
     */
    responseExample = null
    /**
     * The number of rateLimit points this command adds to a user's score
     * @type {number}
     */
    rateLimit = 10
    /**
     * The number of points this command costs to use
     * @type {number}
     */
    pointsCost = 0
    /**
     * The help categories this command belongs to.
     * This can be arbitrary, however a new category requires these lang strings:
     * - `HELP_CATEGORY_X_LABEL`
     * - `HELP_CATEGORY_X_DESC`
     * @type {string[]}
     */
    categories = []
    /**
     * The command prefixes for this command, the first item in the array is treated as the 'main' command.
     * All aliases other than the first one are ignored for slash commands.
     * @type {string[]}
     */
    commands = []
    /**
     * Directory to load nested commands from.
     * @type {string|null}
     */
    nestedDir = null

    /**
     * The permissions the bot is required to have to run this command.
     * @see https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
     * @type {string[]}
     */
    requiredPermissions = []
    /**
     * The permissions the user is required to have to run this command.
     * @see https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
     * @type {string[]}
     */
    userPermissions = []


    /**
     * An optional middleware that runs for all this and all sub-commands of this command.
     * As with regular Middleware, return false to stop execution of the command.
     * @type {null|function(CommandContext, {}):boolean}
     */
    middleware = null
    /**
     * A custom error handler for this command, for syntax errors in the command parsing.
     * `context.error` contains the error information
     * @type {null|function(CommandContext)}
     */
    handleError = null
    /**
     * Function called when autocomplete is true on at least one argument
     * @type {null|function(string, Interaction, {})}
     */
    autocomplete = null
    /**
     * Actually run the command. Required if `nestedDir = null`
     * @type {null|function(CommandContext)}
     */
    run = null

    /**
     * The category used as a sub-command for collapsing multiple slash commands into one.
     * @type {null|string}
     */
    slashCategory = null
    /**
     * Metadata used to enhance the slash command stuff
     * @type {null|{[key: string]: {name?: string, autocomplete?: boolean, description?: boolean}}}
     */
    argDescriptions = null
    /**
     * Slash command data that adds a context menu action in the appropriate space.
     * `value` is which option is filled in by the context menu for this command.
     * @type {null|{type: "text"|"message"|"user", value: string}}
     */
    contextMenu = null

    /**
     * Requires the user/server to have `premium` or `serverPremium` enabled
     * @type {boolean}
     */
    premium = false
    /**
     * Requires the user to either be in the support server, or to have voted in the last 24 hours
     * depending on the setting of `restrictionType`
     * @type {boolean}
     */
    vote = false
    /**
     * Is the command hidden from the help list and from slash commands?
     * @type {boolean}
     */
    hidden = false
    /**
     * Is the command hidden from slash commands?
     * @type {boolean}
     */
    slashHidden = false
    /**
     * Disables the command, still shows as a slash command but greyed out
     * @type {boolean}
     */
    disabled = false
    /**
     * Disables the command in servers with `wholesome = 1`
     * @type {boolean}
     */
    unwholesome = false
    /**
     * Requires `admin = 1` to use.
     * @type {boolean}
     */
    adminOnly = false
    /**
     * Only works in Guild channels
     * @type {boolean}
     */
    guildOnly = false
    /**
     * Requires the user to have `settings.role` to use
     * @type {boolean}
     */
    settingsOnly = false
    /**
     * Disables the command in Synthetic contexts, e.g custom commands
     * @see SyntheticCommandContext
     * @type {boolean}
     */
    noSynthetic = false

    /**
     * Set automatically when loading the command, contains the pattern object.
     * @private
     * @type {null}
     */
    pattern = null
    /**
     * Set automatically when loading sub-commands. Contains an object map.
     * @private
     * @type {null}
     */
    subCommands = null

    constructor(bot){
        this.bot = bot;
    }

}