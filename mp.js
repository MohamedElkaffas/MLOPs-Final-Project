// mp.js - Fixed with proper normalization
const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");
let arrow = null;

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
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });
      drawLandmarks(canvasCtx, landmarks, {
        color: "#FF0000",
        lineWidth: 2,
      });
      
      // FIXED: Proper normalization and validation
      const rawLandmarksArray = [];
      
      console.log("Processing landmarks:", landmarks.length);
      
      // Extract and normalize landmarks
      for (let i = 0; i < landmarks.length; i++) {
        let x = landmarks[i].x;
        let y = landmarks[i].y; 
        let z = landmarks[i].z;
        
        // Ensure normalization between 0 and 1
        // MediaPipe should already provide normalized coordinates, but let's be safe
        x = Math.max(0, Math.min(1, x));
        y = Math.max(0, Math.min(1, y));
        
        // Z coordinate normalization (MediaPipe z is typically in a different range)
        // MediaPipe z represents depth relative to wrist, usually between -0.1 to 0.1
        // We need to normalize it to 0-1 range
        z = (z + 0.1) / 0.2;  // Convert from [-0.1, 0.1] to [0, 1]
        z = Math.max(0, Math.min(1, z));
        
        rawLandmarksArray.push(x, y, z);
      }
      
      console.log("Normalized landmarks length:", rawLandmarksArray.length);
      console.log("Sample coordinates:", {
        first_x: rawLandmarksArray[0].toFixed(3),
        first_y: rawLandmarksArray[1].toFixed(3), 
        first_z: rawLandmarksArray[2].toFixed(3),
        min: Math.min(...rawLandmarksArray).toFixed(3),
        max: Math.max(...rawLandmarksArray).toFixed(3)
      });
      
      // Validate that all coordinates are between 0 and 1
      const allValid = rawLandmarksArray.every(coord => coord >= 0 && coord <= 1);
      if (!allValid) {
        console.error("Some coordinates are not normalized properly!");
        console.log("Out of range values:", rawLandmarksArray.filter(coord => coord < 0 || coord > 1));
        continue; // Skip this frame
      }
      
      const arrow = await getPredictedLabel(rawLandmarksArray);
      if (arrow) {
        triggerArrowKey("keydown", arrow);
        setTimeout(() => {
          triggerArrowKey("keyup", arrow);
        }, 100);
      }
    }
  }
  canvasCtx.restore();
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});

hands.setOptions({
  maxNumHands: 2,
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
