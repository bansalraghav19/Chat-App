const Users = []

const addUser = ({_Id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    
    if(!username || !room){
        return {
            error: 'Username and Room are Required'
        }
    }

    if(username === 'admin'){
        return {
            error: 'Username Cannot Be Admin'
        }
    }

    const check = Users.find( (users) => {
        return users.room === room && users.username === username 
    })

    if(check){
        return {
            error: 'Username Already Exists'
        }
    }

    const user = { _Id, username, room}

    Users.push(user)

    return { user }
}

const removeUser = (_Id) => {
    const index = Users.findIndex( (user) => user._Id === _Id)

    if(index !== -1){
        return Users.splice(index, 1)[0]
    }
}

const getUser = (_Id) => {
    return Users.find( (user) => user._Id === _Id)
}

const getUserInRoom = (room) => {
    return Users.filter( (user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}