// mp.js

import {Hands, HAND_CONNECTIONS} from '@mediapipe/hands';
import {Camera}               from '@mediapipe/camera_utils';
import {drawConnectors,
        drawLandmarks}       from '@mediapipe/drawing_utils';

// 1) Grab references to your <video> and <canvas> elements in index.html:
const videoElement  = document.querySelector('#input_video');
const canvasElement = document.querySelector('#output_canvas');
const canvasCtx     = canvasElement.getContext('2d');

// 2) This function will be called on each camera frame.  
//    It receives a results object, containing multiHandLandmarks (array of 21-point lists).
function onResults(results) {
  // draw the raw camera frame to our <canvas>
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    // For simplicity, just take the first detected hand:
    const handLandmarks = results.multiHandLandmarks[0];

    // draw the hand skeleton / points on screen (optional)
    drawConnectors(canvasCtx, handLandmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
    drawLandmarks(canvasCtx, handLandmarks, {color: '#FF0000', lineWidth: 2});

    // 3) Normalize around the wrist (landmark #0) in 3D:
    const wrist = handLandmarks[0];         // {x:…, y:…, z:…}
    const midTip = handLandmarks[11];       // landmark #12 (index 11)
    // compute scale = Euclidean distance between wrist and midTip in 3D
    const dx = midTip.x - wrist.x;
    const dy = midTip.y - wrist.y;
    const dz = midTip.z - wrist.z;
    let scale = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if (scale === 0) scale = 1.0;

    // flatten all 21 landmarks into one 63‐element array:
    const normalizedLandmarks = [];
    for (let i = 0; i < handLandmarks.length; i++) {
      const lm = handLandmarks[i];
      // subtract wrist, then divide by scale
      normalizedLandmarks.push(
        (lm.x - wrist.x) / scale,
        (lm.y - wrist.y) / scale,
        (lm.z - wrist.z) / scale
      );
    }

    // 4) Send those 63 floats to your backend:
    //    (Assumes you have a function getPredictedLabel(...) defined elsewhere)
    getPredictedLabel(normalizedLandmarks).then((action) => {
      if (action) {
        // e.g. move your maze according to action
        console.log('Moving:', action);
      }
    });
  }

  canvasCtx.restore();
}

// 5) Set up the MediaPipe Hands “solution”:
const hands = new Hands({
  locateFile: (file) => https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.25,
  minTrackingConfidence:  0.25
});
hands.onResults(onResults);

// 6) Hook up your webcam to feed frames into MP Hands:
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width:  640,
  height: 480
});
camera.start();
