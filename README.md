# ML Course Final Project - Gesture Control Game

🎮 Gesture-Controlled Maze Game
An immersive 3D maze game controlled entirely by hand gestures using MediaPipe and real-time machine learning inference. Navigate through progressively challenging mazes using only your hands!

🚀 Play Now
🎯 Live Game: https://mohamedelkaffas.github.io/MLOPs-Final-Project/

🎯 How to Play ?

Grant camera access when prompted
Show your hand to the camera (green landmarks will appear)
Make gestures to control the ball:

👍 LIKE → Move UP
👎 DISLIKE → Move DOWN
☝️ Index Finger (Abu Obaida <3) → Turn LEFT
🤟 Rock → Turn RIGHT

Navigate through the maze to reach the exit
Complete levels - each one gets progressively harder!


✨ Features

🤚 Real-time Hand Tracking with MediaPipe (21 landmarks, 60 FPS)
🧠 AI-Powered Gesture Recognition (98.8% accuracy)
🎮 3D Maze Game built with Three.js and Box2D physics
📱 Cross-platform - works in any modern web browser
🚀 Real-time Processing - sub-second response times
🎯 Progressive Difficulty - mazes get bigger and more complex
📊 Live Monitoring - gesture confidence and API metrics

Real-Time Processing Pipeline

MediaPipe captures hand landmarks (60 FPS)
mp.js normalizes 63 coordinates to 0-1 range
api-call.js sends data to gesture recognition API
Backend processes with 98.8% accurate SVM model
Game engine translates gestures to ball movement
Three.js renders smooth 3D maze experience

🛠️ Technology Stack

🎥 Computer Vision: MediaPipe for hand landmark detection
🎮 Game Engine: Three.js for 3D graphics, Box2D for physics
🌐 Frontend: Vanilla JavaScript, HTML5, CSS3
📡 API Communication: Fetch API with CORS support
🚀 Deployment: GitHub Pages (static hosting)
📊 Monitoring: Real-time gesture confidence tracking


🚀 Quick Start
Prerequisites

Modern web browser (Chrome, Firefox, Safari, Edge)
Webcam/camera access
Internet connection (for API calls)

1. Clone Repository
   git clone https://github.com/MohamedElkaffas/MLOPs-Final-Project.git
   cd MLOPs-Final-Project
2. Local Development
   # Simple HTTP server (Python)
   python -m http.server 8080

3. Open in Browser
http://localhost:8080

📁 Project Structure
🔧 Configuration
API Configuration (api-call.js)
   // Production API endpoint
   const API_BASE_URL = "https://agkckrhhrjhv.eu-central-1.clawcloudrun.com";
   
   // Confidence threshold for gesture acceptance
   const MIN_CONFIDENCE = 0.1;  // 10% minimum confidence
   
   // Action mapping from API response to game controls
   const actionMapping = {
     "UP": "up",
     "DOWN": "down", 
     "LEFT": "left",
     "RIGHT": "right"
   };

   MediaPipe Settings (mp.js)
      // Hand detection configuration
      hands.setOptions({
        maxNumHands: 2,              // Support up to 2 hands
        modelComplexity: 1,          // Balance accuracy vs performance
        minDetectionConfidence: 0.5, // Hand detection threshold
        minTrackingConfidence: 0.5   // Hand tracking threshold
      });
      // Camera settings
      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await hands.send({ image: videoElement });
        },
        width: 1280,
        height: 720
      });

🎮 Game Mechanics
Maze Generation

Algorithm: Recursive backtracking for perfect mazes
Progressive Difficulty: Starts at 11x11, increases by 2 each level
Exit Location: Always at bottom-right corner
Physics: Box2D integration for realistic ball movement

Ball Physics

Friction: 95% velocity damping for realistic movement
Impulse Force: Gesture-based directional forces
Collision: Walls stop movement, smooth wall interaction
Camera: Follows ball with smooth interpolation

Level Progression

Level 1: 11x11 maze (easy)
Level 2: 13x13 maze (medium)
Level 3: 15x15 maze (hard)
Level N: (9 + 2N) x (9 + 2N) maze

📊 Performance Monitoring
Real-Time Metrics
The game tracks several performance indicators:

Gesture Recognition Accuracy: Live confidence scores
API Response Times: Network latency monitoring
Frame Rate: Smooth 60 FPS target
Hand Tracking Quality: MediaPipe landmark stability

Debug Information
Enable console logging to see:

console.log("Processing landmarks:", landmarks.length);
console.log("API Response:", data);
console.log("Gesture:", gesture, "Confidence:", confidence);

🌐 Deployment
GitHub Pages (Current)
The game is automatically deployed via GitHub Pages:

Push to main branch triggers deployment
Static files served from repository root
HTTPS enabled for camera access
Custom domain support available

Live URL: https://mohamedelkaffas.github.io/MLOPs-Final-Project/
Alternative Deployment Options

Netlify: Drag & drop deployment
Vercel: Git-based deployment
AWS S3: Static website hosting
Firebase Hosting: Google's hosting platform

🤝 Development
Adding New Gestures

Train new gesture in the ML pipeline
Update API with new gesture support
Modify action mapping in api-call.js:
const actionMapping = {
  "NEW_GESTURE": "new_action",
  // ... existing mappings
};

Test integration with live camera

Performance Optimization

Reduce API calls: Implement gesture persistence
Optimize MediaPipe: Adjust model complexity
Cache responses: Store recent predictions
Batch processing: Group multiple frames
