const ws = require('ws');

function TransportServer() {

    this.server = null;
    let messageQueue = [];

    this.initialize = (port = 8080, opts = {perMessageDeflate: false}) => {
        try {

            this.server = new ws.Server({
                port: port,
                ...opts
            })

            this.server.on('connection', (socket) => {
                socket.onmessage = (data) => onSocketMessage(socket, data);
                socket.onclose = onSocketClose
            })

            this.server.on('error', () => {

            })

            this.server.on('close', () => {

            })

        } catch(err) {
            // TODO
        }
        
    }

    const onSocketMessage = (socket, message) => {
        try {
            const packet = JSON.parse(message.data);
            if (packet.id) {
                const messageIndex = messageQueue.findIndex(obj => obj.id === packet.id);
                const responseObject = messageQueue[messageIndex];
                if (responseObject.callback) try {
                    responseObject.callback(packet);
                } catch(err) {
                    console.log(err.message, packet);
                }
                messageQueue.splice(messageIndex, 1);
            } else {
                // this.handlePacket(packet);
            }
        } catch(err) {

        }
    }

    const onSocketClose = () => {

    }
}

module.exports = {
    default: TransportServer
}
