import SocketIoClientWrapper from './socket_io_client';
import RPeer from './rpeer';

export default class Signaling {
    constructor(url = 'http://127.0.0.1:9001/', options = {}, localStream) {
        // websocket
        this.socket = new SocketIoClientWrapper(url, options);
        this._stunUrl = 'stun:stun.l.google.com:19302'
        this.CR = String.fromCharCode(13);
        this.iceSeparator = '------ ICE Candidate -------';
        this.peerOptions = {
            iceServers: [{url: this._stunUrl }]
        };
        
        // 後ほどどうにかする...
        this.textForSendSDP = document.getElementById('textForSendSdp');
        this.textForSendICE = document.getElementById('textForSendIce');
        this.textToReceiveSDP = document.getElementById('textForReceiveSdp');
        this.textToReceiveICE = document.getElementById('textForReceiveIce');

        this.localStream = localStream;
        this.socketReady = false;
        this.peerStarted = false;

        // peerオブジェクト生成
        this.peerConnection = null;
        this.bind();
    }

    onOpened() {
        console.log('socket opened');
        this.socketReady = true;
    }

    bind() {
        this.socket.client.on('connect', () => {
            this.onOpened();
        });

        this.socket.client.on('message', (evt) => {
            this.onMessage(evt);
        });
    }

    onSDP() {
        var text = this.textToReceiveSDP.value;
        var evt = JSON.parse(text);
        if (this.peerConnection) {
            this.onAnswer(evt);
        } else {
            this.onOffer(evt);
        }
        this.textToReceiveSDP.value = "";
    }

    onAnswer(evt) {
        console.log("Received Answer...")
        console.log(evt);
        this.setAnswer(evt);
    }

    setAnswer(evt) {
         if (!this.peerConnection) {
            console.error('peerConnection NOT exist!');
            return;
         }
         this.peerConnection.peer.setRemoteDescription(new RTCSessionDescription(evt));
    }

    onICE() {
        var text = this.textToReceiveICE.value;
        var arr = text.split(iceSeparator);
        for (let i = 1, len = arr.length; i < len; i++) {
            let evt = JSON.parse(arr[i]);
            this.onCandidate(evt);
        }
        this.textToReceiveICE.value ="";
    }
    
    onOffer(evt) {
        console.log("Received offer...")
        console.log(evt);
        this.setOffer(evt);
        this.sendAnswer(evt);
        this.peerStarted = true;  // ++
    }

    setOffer(evt) {
        if (this.peerConnection) {
            console.error('peerConnection alreay exist!');
        }

        this.peerConnection = new RPeer(this.peerOptions, this.localStream, this.sendCandidate.bind(this));
        this.peerConnection.peer.setRemoteDescription(new RTCSessionDescription(evt));
    }


    sendAnswer() {
        console.log('sending Answer. Creating remote session description...' );
        if (!this.peerConnection) {
            console.error('peerConnection NOT exist!');
            return;
        }

        this.peerConnection.peer.createAnswer((sessionDescription) => {
            this.peerConnection.peer.setLocalDescription(sessionDescription);
            console.log("Sending: SDP");
            console.log(sessionDescription);
            this.sendSDP(sessionDescription);
        }, () => {
            console.log("Create Answer failed");
        });
    }

    onCandidate(evt) {
        // TODO: WrapObject
        var candidate = new RTCIceCandidate({
            sdpMLineIndex:evt.sdpMLineIndex,
            sdpMid:evt.sdpMid,
            candidate:evt.candidate
        });
        console.log("Received Candidate...")
        console.log(candidate);
        console.log(this.peerConnection.peer);
        this.peerConnection.peer.addIceCandidate(candidate);
    }

    sendSDP(sdp) {
        var text = JSON.stringify(sdp);
        this.textForSendSDP.value = text;
        this.socket.client.json.send(sdp);
    }

    sendCandidate(candidate) {
        var text = JSON.stringify(candidate);

        console.log("---sending candidate text ---");
        console.log(text);
        console.log(this);
        this.textForSendICE.value = (this.textForSendICE.value + this.CR + this.iceSeparator + this.CR + text + this.CR);
        this.textForSendICE.scrollTop = this.textForSendICE.scrollHeight;
         
        // send via socket
        this.socket.client.json.send(candidate);
    }

    onMessage(evt) {
        if (evt.type === 'offer') {
          console.log("Received offer, set offer, sending answer....")
          this.onOffer(evt);	  
        } else if (evt.type === 'answer' && this.peerStarted) {
          console.log('Received answer, settinng answer SDP');
          this.onAnswer(evt);
        } else if (evt.type === 'candidate' && this.peerStarted) {
          console.log('Received ICE candidate...');
          this.onCandidate(evt);
        } else if (evt.type === 'user dissconnected' && this.peerStarted) {
          console.log("disconnected");
          this.stop();
        }
    }

    onConnect() {
        this.socketReady = true;
    }

    sendOffer() {
        this.peerConnection = new RPeer(this.peerOptions, this.localStream, this.sendCandidate.bind(this));
        this.peerConnection.peer.createOffer((sessionDescription) => {
            this.peerConnection.peer.setLocalDescription(sessionDescription);
            console.log("Sending: SDP");
            console.log(sessionDescription);
            this.sendSDP(sessionDescription);
        });
    }

    connect() {
        if (!this.peerStarted && this.localStream && this.socketReady) {
            this.sendOffer();
            this.peerStarted = true;
        } else {
            alert("Local stream not running yet - try again.");
        }
    }

    hangUp() {
        console.log("Hang up.");
        this.stop();
    }

    stop() {
        this.peerConnection.peer.close();
        this.peerStarted = false;
    }
}

