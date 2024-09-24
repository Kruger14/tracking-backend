// Initialize the socket connection
const socket = io();

// Check if geolocation is available in the browser
if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        // Send location to the server via Socket.io
        socket.emit("send-location", { latitude, longitude });
    },
        (error) => {
            console.log(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        });
}

// Initialize the map (Note: 'map' must be a declared variable)
const map = L.map("map").setView([0, 0], 10);

// Add OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Object to store markers for each user by their ID
const markers = {};

// Listen for location updates from the server
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // Set the map view to the user's latest location
    map.setView([latitude, longitude], 16);

    // If a marker already exists for the user, update its position
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);  // Corrected .setLatLng()
    } else {
        // Otherwise, create a new marker for the user
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Listen for disconnection of a user and remove their marker
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);  // Remove the user's marker from the map
        delete markers[id];  // Delete the marker from the markers object
    }
});
