const WebSocket = require("ws");

// Note: Render dynamically assigns ports. It's best practice to use process.env.PORT
const PORT = process.env.PORT || 3000;
const server = new WebSocket.Server({ port: PORT });

// --- NEW: Function to send message to Discord ---
async function sendToDiscord(username, text) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return; // If you haven't added the URL in Render yet, it just skips this

    const payload = {
        username: username,
        content: text
    };

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error("Discord webhook error:", error);
    }
}
// -------------------------------------------------

server.on("connection", (socket) => {
    console.log("A user joined the chat");

    socket.on("message", (message) => {
        // Convert Buffer to string
        const dataString = message.toString();
        console.log("Relaying:", dataString);

        // --- NEW: Prepare data for Discord ---
        let discordUser = "FlyNotes User"; // Default name
        let discordMessage = dataString;   // Default message

        try {
            // We try to see if the message is JSON (e.g., {"username": "Bob", "message": "Hi"})
            const parsedData = JSON.parse(dataString);
            discordUser = parsedData.username || parsedData.name || discordUser;
            discordMessage = parsedData.message || parsedData.text || dataString;
        } catch (e) {
            // If it's not JSON (just plain text), it skips to here and uses the defaults
        }

        // Send to Discord
        sendToDiscord(discordUser, discordMessage);
        // --------------------------------------

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

console.log(`FlyNotes Server running on port ${PORT}`);
