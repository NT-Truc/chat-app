const socket = io();

//elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");




//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;


const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});
const _id = Date.now() + username.replace(/\s/g, "") + Math.random;

socket.on("message", (message_info) => {
    console.log(message_info);
    const { message, created_at, username: _username } = message_info;
    const isMyMessage = username === _username;
    const html = Mustache.render(messageTemplate, {
        message,
        created_at: moment(created_at).format("hh:mm A"),
        username: _username,
        right: isMyMessage ? "right" : "left",
    });
    //console.log()

    $messages.innerHTML = $messages.innerHTML + html;
    autoscroll();
    // $messages.insertAdjacentElement('beforeend', html);
});

socket.on("locationMessage", (location_info) => {
    const { username, url, created_at } = location_info;
    const html = Mustache.render(locationMessageTemplate, {
        url,
        created_at: moment(created_at).format("hh:mm A"),
    });
    $messages.innerHTML = $messages.innerHTML + html;
});


$messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    //disable button after send message
    $messageFormButton.setAttribute("disabled", "disabled")

    const message = event.target.elements.message.value;
    if (message.trim() === "") {
        $messageFormButton.removeAttribute("disabled");
        return;
    }
    socket.emit("sendMessage", message, (error) => {
        //enable
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }
        console.log("Message was delivered!");
    });

});

document.querySelector("#send-location").addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not support by your brower");
    }
    //Disable button
    $sendLocationButton.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position);
        socket.emit("sendLocation", {
            lat: position.coords.latitude,
            long: position.coords.longitude,
        }, () => {
            console.log("Location share!")
        });
    });
    $sendLocationButton.removeAttribute("disabled");
});

socket.emit("joinRoom", {
    username,
    room,
});

socket.on("roomData", ({ room, users }) => {
    console.log(room, users);
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    $sidebar.innerHTML = html;
});

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
};

// document.querySelector("#increment").addEventListener("click", () => {
//     console.log("CLICKED");
//     socket.emit("increment");
//});