// mp.js  — send exactly 63 floats (x,y,z) per detected hand to backend

import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS, Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

// (Assumes getPredictedLabel is already defined in api-call.js)
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
      // 1) Draw the skeleton & landmarks
      drawConnectors(canvasCtx, handLandmarks, HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });
      drawLandmarks(canvasCtx, handLandmarks, {
        color: "#FF0000",
        lineWidth: 2,
      });

      // 2) Flatten into [63 floats]
      const raw63 = flattenLandmarks(handLandmarks);

      // 3) Call the API endpoint
      const prediction = await getPredictedLabel(raw63);
      if (prediction) {
        const { maze_action, confidence, gesture_name } = prediction;

        // 4) Map to arrow key events if desired:
        //    (e.g. “up”, “down”, “left”, “right”)
        if (confidence >= 0.4) {
          // Simplest example: 
          // if maze_action is “LEFT”, simulate ArrowLeft key
          triggerArrowKey("keydown", maze_action);
          setTimeout(() => {
            triggerArrowKey("keyup", maze_action);
          }, 100);
        }
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
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.1,
  minTrackingConfidence: 0.1,
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

// Utility to dispatch arrow‐key events:
function triggerArrowKey(type, action) {
  // action could be “UP” | “DOWN” | “LEFT” | “RIGHT” | etc.
  const keyMap = {
    UP: "ArrowUp",
    DOWN: "ArrowDown",
    LEFT: "ArrowLeft",
    RIGHT: "ArrowRight",
  };
  const key = keyMap[action];
  if (!key) return;
  const event = new KeyboardEvent(type, { key });
  document.dispatchEvent(event);
}
