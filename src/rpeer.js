export default class RPeer {
    constructor(options, localStream, callback) {
        // 後で変更
        try {
            this._peer = new webkitRTCPeerConnection(options, {'optional': [{'googIPv6': true}]});
            this.onicecandidate(callback);
            this._peer.addStream(localStream);
            this._peer.addEventListener("addstream", this.onRemoteStreamAdded, false);
            this._peer.addEventListener("removestream", this.onRemoteStreamRemoved, false);

        } catch (e) {
            console.log("Failed to create peerConnection, exception: " + e.message);
        }
    }

    onicecandidate(callback) {
        this._peer.onicecandidate = (evt) => {
            if (evt.candidate) {
                callback({type: "candidate", 
                                sdpMLineIndex: evt.candidate.sdpMLineIndex,
                                sdpMid: evt.candidate.sdpMid,
                                candidate: evt.candidate.candidate
                })
            } else {
                console.log("End of candidates. ------------------- phase=" + evt.eventPhase);
            }
        };

    }

    onRemoteStreamAdded(event) {
        console.log("Added remote stream");
        // 後でどうにかしよう....
        let remoteVideo = document.getElementById('remoteVideo');
        remoteVideo.src = window.webkitURL.createObjectURL(event.stream);
    };

    onRemoteStreamRemoved(event) {
        console.log("Remove remote stream");
        let remoteVideo = document.getElementById('remoteVideo');
        remoteVideo.src = "";
    };

    get peer() {
        return this._peer;
    }
}

