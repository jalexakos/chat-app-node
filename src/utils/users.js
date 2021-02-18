const users = []

// addUser

const addUser = ({ id, username, room }) => {
    // Clean the data
    
    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }
    
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

// removeUser

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

// getUser

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

// getUsersInRoom

const getUsersInRoom = (room) => {
    // room = room.trim().toLowerCase() <-- not needed because it would be coming from the server - no way it would be incorrectly typed
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}