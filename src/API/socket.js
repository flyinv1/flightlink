import uuid from 'uuid';
const WebSocket = window.require('ws');

function openSocket(port) {
    return new Promise((resolve, reject) => { try {
        if (!window.arcc.api.socket) {

            const socket = new WebSocket(`ws://localhost:${port}`);
            window.arcc.api.socket = socket;
            
            socket.onopen = () => {
                console.log("Client has connected to socket: ", socket);
                resolve(true);
            }
            
            socket.onmessage = (message) => receiveMessage(message);

        } else { reject(false) }
    } catch {
        reject(false);
    }});
}

function receiveMessage(message) {
    const api = window.arcc.api;
    if (message.data instanceof ArrayBuffer) {
        // No protocol for arraybuffer objects
    } else {
        try {
            const packet = JSON.parse(message.data);
            if (packet.id) {
                // Expecting a response
                const mIndex = api.messageQueue.findIndex(obj => obj.id === packet.id);
                const responseObj = api.messageQueue[mIndex];
                if (responseObj.callback) try {
                    responseObj.callback(packet);
                } catch(err) {
                    // TODO Handle response callback errors
                    console.log("error: ", err);
                }
                api.messageQueue.splice(mIndex, 1);
            } else {
                // TODO Handle
                if (packet.type === api.keys.requests.DATA) {
                    // window.arcc.storage.receivedData.push([packet.payload]);
                    try {
                        api.listeners.data.map(listener => listener.callback(packet));
                    } catch(err) {
                        console.log("error with data callback");
                    }
                }
            }
        } catch(err) {
            console.log("couldn't parse json");
            // TODO Handle JSON parse error
        }
    }
}

function sendRequest(packet, callback) {
    packet["id"] = uuid.v1();
    window.arcc.api.messageQueue.push({id: packet.id, payload: packet.payload, callback: callback});
    window.arcc.api.socket.send(JSON.stringify(packet));
}

function closeSocket() {

}

function attachListener(type, name, callback) {
    if (window.arcc.api.listeners[type]) {
        window.arcc.api.listeners[type].push({
            name: name,
            callback: callback
        });
        return true;
    } else { return false }
}

function removeListener(type, name) {
    const index = window.arcc.api.listeners[type]?.findIndex(listener => listener.name === name);
    window.arcc.api.listeners[type].splice(index, 1);
}

export default {
    openSocket: openSocket,
    sendRequest: sendRequest,
    closeSocket: closeSocket,
    attachListener: attachListener,
    removeListener: removeListener
}