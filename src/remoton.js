import Signaling from './signaling'; 

class Remoton {
    constructor(stunUrl = 'stun:stun.l.google.com:19302') {
        this.peer = null;
        this._stunUrl = stunUrl;
        this.setNavigatorGetUserMedia();
        this.signaling = null;
        this.localVideo = null;
        this.remoteVideo = null;
        this.localStream = null;
        this.connectWrap = null;

        document.addEventListener("DOMContentLoaded", (event) => {
            // DOMをセット
            this.localVideo = document.getElementById('localVideo');
            this.remoteVideo = document.getElementById('remoteVideo');
            this.connectWrap = document.getElementById('connectWrap');
            this._bindStartVideo();
            this._bindConnect();
        });
    }

    _bindStartVideo() {
        let startVideo = document.getElementById('startVideo');
        startVideo.addEventListener('click', (stream) => {
            this._preparationVideo(stream);           
        }, false);

        let stopVideo = document.getElementById('stopVideo');
        startVideo.addEventListener('k', (stream) => {
            this._stopVideo();           
        }, false)
    }

    _bindConnect() {
        let connect = document.getElementById('connect');
        connect.addEventListener('click', () => {
            if (this.signaling) {
                this.signaling.connect();
            }
        }, false);
    }

    _stopVideo() {
        this.localVideo.src = "";
        if (this.localStream) {
            this.localStream.stop();
        }
    }


    setNavigatorGetUserMedia() {
        navigator.getUserMedia = (
                      navigator.getUserMedia 
                   || navigator.webkitGetUserMedia 
                   || navigator.mozGetUserMedia 
                   || navigator.msGetUserMedia
       );
    }

    _preparationVideo(stream) {
        // カメラとマイクに接続
        navigator.getUserMedia(
            { audio: true, video: true },
            (stream) => {
                this.localStream = stream;
                this.localVideo.src = window.URL.createObjectURL(stream);
                this.signaling = new Signaling('http://127.0.0.1:9001/', {}, this.localStream);
                //this.rPeer.peer.addStream(stream)
                this.localVideo.play();
                // connect button 表示
                this.connectWrap.style.display = 'block';
            },
            (err) => {
                console.log(err.name + ': ' + err.message);
            }

        );
    }
}

new Remoton();

