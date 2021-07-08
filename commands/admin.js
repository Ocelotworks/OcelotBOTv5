module.exports = {
    name: "Admin",
    usage: "admin",
    detailedHelp: "Can only be used by Bot Admins.",
    categories: ["tools"],
    commands: ["admin", "adm", "mgt"],
    hidden: true,
    adminOnly: true,
    nestedDir: "admin",
};