export const canvasStreamer = {

    doLoad: function () {
        this.cameraVideo = document.querySelector('.cameraView>video');
        this.playerVideo = document.getElementById('playerVideo')

        this.c1 = document.getElementById("c1");
        this.ctx1 = this.c1.getContext("2d");
        let self = this;
        /*   this.video.addEventListener("play", function () { */
        self.width = self.cameraVideo.videoWidth / 2;
        self.height = self.cameraVideo.videoHeight / 2;

        this.c1.width = self.width
        this.c1.height = self.height

        this.playerVideoCalcWidth = this.playerVideo.videoWidth * this.height / this.playerVideo.videoHeight

        this.playerVideoCalcHeight = this.playerVideo.videoHeight * this.width / this.playerVideo.videoWidth
        this.midCalcHeight = this.height / 2 - this.playerVideoCalcHeight / 2

        self.timerCallback();

    },

    timerCallback: function () {
        if (this.cameraVideo.paused || this.cameraVideo.ended) {
            return;
        }
        this.computeFrame();
        let self = this;
        setTimeout(function () {
            self.timerCallback();
        }, 0);
    },

    computeFrame: function () {
        this.ctx1.drawImage(this.cameraVideo, 0, 0, this.width, this.height);
        this.ctx1.drawImage(this.playerVideo, 0, this.midCalcHeight, this.width, this.playerVideoCalcHeight)
        /*         let frame = this.ctx1.getImageData(0, 0, this.width, this.height);
                let l = frame.data.length / 4;
        
                for (let i = 0; i < l; i++) {
                    let r = frame.data[i * 4 + 0];
                    let g = frame.data[i * 4 + 1];
                    let b = frame.data[i * 4 + 2];
                    if (g === 0 && r === 0 && b === 0)
                        frame.data[i * 4 + 3] = 0;
                }
                this.ctx1.putImageData(frame, 0, 0);
         */
        return;
    }
};