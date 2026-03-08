const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 3000 });

server.on("connection", (socket) => {
    console.log("A user joined the chat");

    socket.on("message", (message) => {
        // Convert Buffer to string
        const dataString = message.toString();
        console.log("Relaying:", dataString);

        // Broadcast to all connected clients
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                // We send the exact JSON string back to everyone
                client.send(dataString);
            }
        });
    });

    socket.on("close", () => console.log("A user left"));
});

console.log("FlyNotes Server running on ws://localhost:3000");