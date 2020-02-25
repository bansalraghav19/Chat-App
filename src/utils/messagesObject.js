const generteObject = (username,text) => {
    return {
        username,
        text,
        CreatedAt: new Date().getTime()
    }
}

module.exports = {
    generteObject
}