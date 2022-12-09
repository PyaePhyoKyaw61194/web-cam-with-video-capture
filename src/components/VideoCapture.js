
import React, { useEffect } from 'react';
import '../App.css';


import 'video.js/dist/video-js.css';
import videojs from 'video.js';

import 'webrtc-adapter';
import { startRecording } from '../utils/canvas-record'
import { canvasStreamer } from '../utils/canvas-stream'
import { Box, Button, Heading, HStack, VStack, Divider, Link } from '@chakra-ui/react'

// register videojs-record plugin with this import
import 'videojs-record/dist/css/videojs.record.css';
// eslint-disable-next-line no-unused-vars
import Record from 'videojs-record/dist/videojs.record.js';

function VideoCapture({ ...options }) {
    let recordingTimeMS = 5000;
    useEffect(() => {

        /*    let preview = document.getElementById("preview");
           const canvas = document.getElementById("c1");; */
        var devices, deviceId;
        var inputSection = document.getElementsByClassName('inputSelector')[0];
        let recordButton = document.getElementById("recordButton");

        recordButton.disabled = true

        // Anything in here is fired on component mount.
        const player = videojs('preview', options, function () {
            // print version information at startup
            const msg = 'Using video.js ' + videojs.VERSION +
                ' with videojs-record ' + videojs.getPluginVersion('record');
            videojs.log(msg);

            console.log("videojs-record is ready!");
        });

        // error handling
        player.on('error', (element, error) => {
            console.warn(error);
        });

        player.on('audioOutputReady', () => {
            console.log("Audio Ready")
        })
        player.on('deviceError', () => {
            console.error('device error:', this.player.deviceErrorCode);
        });

        // enumerate devices once
        player.one('deviceReady', function () {

            player.record().enumerateDevices();
            let cameraVideoBox = document.getElementById("cameraVideo");
            cameraVideoBox.style.padding = 0
            recordButton.disabled = false
        });


        player.on('deviceReady', function () {
            let playerVideo = document.getElementById('playerVideo')
            playerVideo.play()
            let streamVid = document.getElementById("streamVid")

            const audioStreamTrack = player.record().stream.getAudioTracks()[0]
            const audioStream = new MediaStream()
            audioStream.addTrack(audioStreamTrack)
            streamVid.srcObject = audioStream

            canvasStreamer.doLoad()
        });

        player.on('enumerateReady', function () {
            devices = player.record().devices;

            // handle selection changes
            var inputSelector = document.getElementById('selector');

            inputSelector.addEventListener('change', changeVideoInput);

            // populate select options
            var deviceInfo, option, i;
            for (i = 0; i !== devices.length; ++i) {
                deviceInfo = devices[i];
                option = document.createElement('option');
                option.value = deviceInfo.deviceId;
                if (deviceInfo.kind === 'videoinput') {
                    console.info('Found video input device: ', deviceInfo.label);
                    option.text = deviceInfo.label || 'input device ' +
                        (inputSelector.length + 1);
                    inputSelector.appendChild(option);
                }
            }

            if (inputSelector.length === 0) {
                // no output devices found, disable select
                option = document.createElement('option');
                option.text = 'No video input devices found';
                option.value = undefined;
                inputSelector.appendChild(option);
                inputSelector.disabled = true;
                console.warn(option.text);
            } else {
                console.info('Total video input devices found:', inputSelector.length);
            }

            // show input selector section
            inputSection.style.display = 'block';
        });

        function changeVideoInput(event) {
            var label = event.target.options[event.target.selectedIndex].text;
            deviceId = event.target.value;

            try {

                // change video input device
                player.record().setVideoInput(deviceId);
                console.log("Changed video input to '" + label + "' (deviceId: " +
                    deviceId + ")");

            } catch (error) {
                console.warn(error);

                // jump back to first output device in the list as it's the default
                event.target.selectedIndex = 0;
            }
        }

        // error handling
        player.on('enumerateError', function () {
            console.warn('enumerate error:', player.enumerateErrorCode);
        });

        return () => {
            // Anything in here is fired on component unmount.
            if (player) {
                player.dispose();
            }
        }
    })


    const canvasRecorder = (e) => {

        const canvas = document.getElementById("c1");
        let recording = document.getElementById("recording");
        let downloadAnchor = document.getElementById("downloadAnchor");
        let downloadButton = document.getElementById("downloadButton");
        const canvasStream = canvas.captureStream(25);
        e.target.innerText = "Recording .... "
        e.target.disabled = true
        downloadButton.disabled = true

        let streamVid = document.getElementById("streamVid")

        // streamVid.captureStream() does not work in safari
        startRecording(streamVid.srcObject, canvasStream, recordingTimeMS).then((recordedChunks) => {
            let recordedBlob = new Blob(recordedChunks, { type: "video/mp4" });
            recording.src = URL.createObjectURL(recordedBlob);

            downloadAnchor.href = recording.src;
            downloadAnchor.download = "RecordedVideo.mp4";
            downloadButton.disabled = false
            e.target.innerText = "Record"
            e.target.disabled = false

            /* log(`Successfully recorded ${recordedBlob.size} bytes of ${recordedBlob.type} media.`); */
        })
            .catch((error) => {
                if (error.name === "NotFoundError") {
                    console.log("Camera or microphone not found. Can't record.");
                } else {
                    console.log(error)
                    //log(error);
                }
            })


    }

    return (
        <Box className='CaptureView' >
            <VStack spacing={3} w="full" alignItems="center">

                <Box id='cameraVideo' py='20'>
                    <Box style={{ zIndex: -1, position: 'relative', top: "-10px" }}>
                        <video
                            id="playerVideo"
                            width="5"
                            height="5"
                            muted loop playsInline >
                            {/*      <source src="dancer.webm" type="video/webm" /> */}
                            {/*     <source src="sample_tolucky.mp4" type="video/mp4" /> */}
                            <source src="videos/dancer.mp4" type="video/quicktime" />
                            <source src="videos/dancer.webm" type="video/webm" />
                        </video>
                    </Box>
                    <video id="preview" onPause={() => console.log("Pause")} className="video-js vjs-default-skin cameraView" playsInline>
                    </video>
                </Box>
            </VStack>
            <VStack spacing={3} w="full" alignItems="center">
                <Heading> Let's Dance Video Capture</Heading>
                <Box >
                    <VStack>
                        <video id="streamVid" width='5' height='5' muted></video>

                        <canvas id="c1"></canvas>
                        <Box className="inputSelector">
                            <Heading as='h3' size='sm'>Select video input: </Heading>
                            <select id="selector"></select>
                        </Box>
                        <HStack>
                            <Button id='recordButton' color='red' onClick={(e) => canvasRecorder(e)}> Record </Button>
                            <Button disabled id='downloadButton'>
                                <Link id="downloadAnchor" className="button">
                                    Download
                                </Link>
                            </Button>
                        </HStack>
                    </VStack>
                </Box>
            </VStack>
            <Divider p='4' />
            <VStack p='4' spacing={3} w="full" alignItems="center">
                <Heading>Preview</Heading>
                <Box >
                    <video id="recording" controls></video>
                </Box>
            </VStack>
        </Box >

    );

}

export default VideoCapture