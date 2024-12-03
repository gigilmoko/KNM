const { Server } = require('ws');
const wss = new Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});

const broadcast = (data) => {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

module.exports = { wss, broadcast };
