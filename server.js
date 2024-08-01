const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

let messages = [];  // Array to store messages

wss.on('connection', (ws) => {
  console.log('Client connected');

  let currentUser = '';

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'login') {
      currentUser = data.username;
      // Send existing messages to the newly connected client
      ws.send(JSON.stringify({ type: 'history', messages }));
    } else if (data.type === 'message') {
      const msg = { text: data.text, sender: data.sender };
      messages.push(msg);  // Add new message to the array

      // Broadcast the new message to all clients except the sender
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'message', message: msg }));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
