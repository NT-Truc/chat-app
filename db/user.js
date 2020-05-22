let users = [];

//CRUD
function createUser(_id, username, room) {
    users.push({ _id, username, room });
    console.log(users);
}

const getUserInfo = (id) => {
    const user = users.find((_user) => {
        return (id === _user._id);
    });
    return user;
}
const getUsersInRoom = (room) => {
    // [{username,room}]
    const user_in_room = users.filter((user) => {
        return user.room === room;
    });
    return user_in_room;
};
const removeUser = (_id) => {
    users = users.filter((user) => {
        return user._id != _id;
    });
};
module.exports = {
    createUser,
    getUserInfo,
    getUsersInRoom,
    removeUser
}