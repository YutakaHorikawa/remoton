var socketIoClient = require('socket.io-client');

export default class SocketIoClientWrapper {
    constructor(url, options = {}) {
        this._client = socketIoClient.connect(url, options);
    }

    get client() {
        return this._client;
    }
}

