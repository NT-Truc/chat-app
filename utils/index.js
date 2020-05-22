function genergateMessage(username, message) {
    const date = new Date();
    return {
        username,
        created_at: date.getTime(),
        message
    };
};
function genergateLocationMessage(username, lat, long) {
    const date = new Date();
    return {
        username,
        url: `https://www.google.com/maps?q=${lat},${long}`,
        created_at: date.getTime()
    };
}
module.exports = {
    genergateMessage,
    genergateLocationMessage
};
