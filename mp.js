// mp.js  — send exactly 63 floats (x,y,z) per hand to the backend

import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS, Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

// (Assumes getPredictedLabel is already defined in api-call.js and imported here)
import { getPredictedLabel } from "./api-call.js";

const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

// Helper: given Mediapipe’s landmarks array-of-objects, flatten into [x1,y1,z1, x2,y2,z2, … x21,y21,z21]
function flattenLandmarks(landmarkObjects) {
  // landmarkObjects is an array of 21 {x:…, y:…, z:…}
  const flat = [];
  for (let lm of landmarkObjects) {
    flat.push(lm.x, lm.y, lm.z);
  }
  // flat.length === 63
  return flat;
}

async function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  if (results.multiHandLandmarks) {
    for (const handLandmarks of results.multiHandLandmarks) {
      // Draw skeleton on canvas
      drawConnectors(canvasCtx, handLandmarks, HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });
      drawLandmarks(canvasCtx, handLandmarks, {
        color: "#FF0000",
        lineWidth: 2,
      });

      // 1) Flatten the 21 {x,y,z} into a single [63-length] array of floats
      const raw63 = flattenLandmarks(handLandmarks);
      console.log("Flattened landmarks (63 floats):", raw63);

      // 2) Call your existing getPredictedLabel(...) which expects exactly that array
      const action = await getPredictedLabel(raw63);
      if (action) {
        // If getPredictedLabel returns, e.g., "left" / "up" / "right" etc., simulate arrow key
        triggerArrowKey("keydown", action);
        setTimeout(() => {
          triggerArrowKey("keyup", action);
        }, 100);
      }
    }
  }

  canvasCtx.restore();
}

const hands = new Hands({
  locateFile: (file) => {
    return https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file};
  },
});
hands.setOptions({
  maxNumHands: 1,              // track one hand
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});
camera.start();

// Utility to dispatch arrow‐key events (unchanged from your snippet)
function triggerArrowKey(type, direction) {
  const keyMap = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" };
  const key = keyMap[direction];
  if (!key) return;
  const event = new KeyboardEvent(type, { key });
  document.dispatchEvent(event);
}
