module.exports = (context)=> {
    if (context.getSetting(`${context.command}.override`)) {
        context.send(context.getSetting(`${context.command}.override`));
        return false;
    }
    return true;
};