// api-call.js - Clean and Simple Version

async function getPredictedLabel(processed_landmarks) {
  try {
    const API_BASE_URL = "oyrnfmwvrjoh.eu-central-1.clawcloudrun.com";
    // Automatically detect environment
    // const API_BASE_URL = window.location.hostname === 'localhost' 
    //  ? "http://localhost:8001"  // Local development
    //  : "https://agkckrhhrjhv.eu-central-1.clawcloudrun.com";  // Production
    console.log("Calling Hand Gesture API");
    console.log("Landmarks length:", processed_landmarks.length);
    
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        landmarks: processed_landmarks
      })
    });
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    
    // Simple action mapping
    const actionMapping = {
      "UP": "up",
      "DOWN": "down",
      "LEFT": "left", 
      "RIGHT": "right",
      "STOP": null,
      "WAIT": null,
      "PAUSE": null,
      "OK": null,
      "ACTION": null,
      "MUTE": null,
      "FOUR": null,
      "THREE": null,
      "TWO": null
    };
    
    const maze_action = data.maze_action;
    const frontendAction = actionMapping[maze_action] || null;
    const confidence = data.confidence || 0;
    
    // Simple fixed threshold
    const MIN_CONFIDENCE = 0.1;  // 40% - good for game responsiveness
    
    if (confidence < MIN_CONFIDENCE) {
      console.log(`⚠️ Low confidence (${confidence.toFixed(2)}), ignoring gesture`);
      return null;
    }
    
    console.log(`${data.gesture_name} -> ${maze_action} -> ${frontendAction} (${confidence.toFixed(2)})`);
    return frontendAction;
    
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}
