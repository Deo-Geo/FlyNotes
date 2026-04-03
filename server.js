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

socket.on("message", (message) => {
        // Convert Buffer to string
        const dataString = message.toString();
        
        let isPing = false; // We will use this to track if it's a ping

        // --- Prepare data for Discord ---
        let discordUser = "FlyNotes User"; 
        let discordMessage = dataString;   

        try {
            const parsedData = JSON.parse(dataString);
            
            // CHECK IF IT IS A PING
            if (parsedData.type === "ping") {
                isPing = true; // Mark it as a ping
            } else {
                discordUser = parsedData.username || parsedData.name || discordUser;
                discordMessage = parsedData.message || parsedData.text || dataString;
            }
        } catch (e) {
            // Not JSON, just normal text
        }

        // --- Send to Discord ONLY if it is NOT a ping ---
        if (!isPing) {
            console.log("Relaying:", dataString);
            sendToDiscord(discordUser, discordMessage);
        }

        // --- Broadcast to all connected clients ---
        // (We also skip broadcasting pings to other users so their chats don't glitch)
        if (!isPing) {
            server.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(dataString);
                }
            });
        }
    });

    socket.on("close", () => console.log("A user left"));
});

console.log(`FlyNotes Server running on port ${PORT}`);
