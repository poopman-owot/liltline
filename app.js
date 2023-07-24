w.night()
w.disableCursor()
// Variables
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const mainView = document.getElementById("main_view");
canvas.id = "infinite_runner_game";

// Set CSS properties for the canvas
canvas.style.zIndex = "10000";
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";

mainView.appendChild(canvas);

// Set canvas width and height
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// Create an array to store multiple yellow walls


// Create an array to store multiple yellow walls
const yellowWalls = [];

// Function to draw a single yellow wall
function drawYellowWall(x, timeToTravel) {
  const wallWidth = 100; // Width of the yellow wall
  const wallHeight = canvas.height; // Height of the yellow wall (extends from top to bottom)

  let startTime = performance.now();
  let endTime = startTime + timeToTravel;

  // Create a yellow wall object and add it to the array
  yellowWalls.push({
    x: x,
    wallWidth: wallWidth,
    startTime: startTime,
    endTime: endTime
  });
}

// Waveform properties
let frequency = 0.0001; // Controls the frequency of the Perlin noise for the waveform height
let intensity = 0; // Start with intensity 0 during countdown
let targetIntensity = owotHeight; // Target intensity after countdown (lerp to this value)
let thicknessFrequency = 0.0001; // Controls the frequency of the Perlin noise for the thickness
let minThickness = 100; // Thinnest the line can be
let maxThickness = 500; // Thickest the line can be
let speed = 1; // Controls the speed of the leftwards movement
let thicknessOffset = 0; // Initialize the thickness offset
let verticalShift = owotHeight / 3; // Vertical shift for the waveform

// Countdown properties
let countdownDuration = 5000; // Duration of the countdown in milliseconds (3 seconds)
let countdownValue = countdownDuration; // Remaining time during the countdown
// Variables for player distance score
let playerDistance = 0; // Initialize the player distance score to 0
let playerScore = 0; // Initialize the player's score to 0
const scoreIncrement = 1; // The amount to increment the player's score each animation frame

// Function to update the player distance score and total score
function updateScores() {
  playerDistance += speed; // Increment the player distance based on the speed
  playerScore = Math.floor(playerDistance); // Update the player's score (e.g., increase score every 100 units)
}

// Function to draw the player distance score on the canvas
function drawPlayerScore() {
  ctx.font = "24px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Score: " + playerScore, 10, 10);

  ctx.textAlign = "right"; // Align the text to the right for lives count
  ctx.fillText("Health: " + player.lives, canvas.width - 10, 10); // Display lives count at the top right
}
// Function to generate Perlin noise at a given x-coordinate and frequency/intensity values
function perlinNoise(x, frequency, intensity) {
  x = x * frequency;
  const floorX = Math.floor(x);
  const t = x - floorX;
  const tRemapSmoothstep = t * t * (3 - 2 * t);

  // Random gradients at each integer point
  const gradient1 = Math.sin(floorX) * 2 - 1;
  const gradient2 = Math.sin(floorX + 1) * 2 - 1;

  // Compute the dot product of the distance and gradient
  const dotProduct1 = gradient1 * t;
  const dotProduct2 = gradient2 * (t - 1);

  // Remap the value of the smoothed t
  const smoothstepT = tRemapSmoothstep;

  // Interpolate between dot products
  return (1 - smoothstepT) * dotProduct1 + smoothstepT * dotProduct2 * intensity;
}

// Function to calculate the varying thickness at a given x-coordinate
function calculateThickness(x) {
  const thicknessIntensity = perlinNoise(x + thicknessOffset, thicknessFrequency, 1); // Use 1 as intensity to keep thickness in the range [0, 1]
  let thickness = minThickness + (maxThickness - minThickness) * thicknessIntensity;

  // Ensure the thickness is not less than 100
  thickness = Math.max(thickness, minThickness);

  return thickness;
}

// Function to draw the waveform
function drawWaveform(offsetX) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2 + perlinNoise(offsetX, frequency, intensity) - verticalShift);

  for (let x = 0; x < canvas.width; x++) {
    const y1 = canvas.height / 2 + perlinNoise(x + offsetX, frequency, intensity) - verticalShift;
    const thickness1 = calculateThickness(x + offsetX);

    const x2 = x + 1;
    const y2 = canvas.height / 2 + perlinNoise(x2 + offsetX, frequency, intensity) - verticalShift;
    const thickness2 = calculateThickness(x2 + offsetX);

    // Calculate the average y-coordinate and thickness for the line segment
    const avgY = (y1 + y2) / 2;
    const avgThickness = (thickness1 + thickness2) / 2;

    // Clamp the y-coordinate and thickness to stay within the canvas range
    const clampedY = Math.min(Math.max(avgY, 0), canvas.height);
    const clampedThickness = Math.min(Math.max(avgThickness, minThickness), canvas.height);

    ctx.lineTo(x, clampedY);
    ctx.lineTo(x, clampedY + clampedThickness);
  }

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#FFF"; // White color for the waveform lines
  ctx.stroke();
}

// Function to draw the countdown on the canvas
function drawCountdown() {
  ctx.font = "100px Arial";
  ctx.fillStyle = "#FF00FF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((countdownValue / 1000).toFixed(0), canvas.width / 2, canvas.height / 2);
}
const player = {
  x: 100, // Initial x-coordinate of the player (near the left of the screen)
  y: canvas.height / 2, // Initial y-coordinate of the player (centered vertically)
  width: 20, // Width of the player
  height: 20, // Height of the player
  speed: 5, // Speed of the player's movement
  lives: 100,
};

// Flag for canvas background blink
let blinkBackground = false;

// Function to handle canvas background blink
function blinkCanvasBackground(random) {
  if (blinkBackground) {
if(random){
canvas.style.backgroundColor = getRandomColor();
}
else{
    canvas.style.backgroundColor = "red";
}
  } else {
    canvas.style.backgroundColor = ""; // Reset to default background color
  }
  blinkBackground = !blinkBackground;
 // Schedule the background color reset for the next frame
  requestAnimationFrame(resetBackgroundColor);
}
// Function to reset the background color to its original state after one frame
function resetBackgroundColor() {
  canvas.style.backgroundColor = ""; // Reset to default background color
}
function drawPlayer() {
  ctx.fillStyle = "#FF0000"; // Red color for the player
  ctx.fillRect(player.x, player.y, player.width, player.height);
  // Draw a line from the top-left corner of the player rectangle to the bottom-left corner
  ctx.fillRect(player.x, player.y, player.width, 1);
}
const boxes = []; // Array to store the spawned boxes

// Function to create a new box
function createBox(x, y) {
  const boxWidth = player.width;
  const boxHeight = player.height;
  boxes.push({ x, y, width: boxWidth, height: boxHeight });
}

// Function to update box positions and remove boxes that are off-screen
function updateBoxes() {
  for (let i = boxes.length - 1; i >= 0; i--) {
    const box = boxes[i];
    box.x -= (speed*5); // Move the box leftwards

    if (box.x + box.width < 0) {
      // Remove the box if it is off-screen
      boxes.splice(i, 1);
    }
  }
}

// Function to draw the boxes
function drawBoxes() {
  ctx.fillStyle = "#00FF00"; // Green color for the boxes
  for (const box of boxes) {
    ctx.fillRect(box.x, box.y, box.width, box.height);
  }
}
// Add an event listener to handle keyboard input
// Add an event listener to handle keyboard input
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
let moveUp = false;
let moveDown = false;
let spacebarPressed = false;

function handleKeyDown(event) {
  if (event.key === "ArrowUp" || event.key === "w") {
    moveUp = true;
  } else if (event.key === "ArrowDown"||event.key === "s") {
    moveDown = true;
  } else if (event.key === " ") {
    spacebarPressed = true;
  }
console.log(event.key)
}

function handleKeyUp(event) {
  if (event.key === "ArrowUp" || event.key === "w") {
    moveUp = false;
  } else if (event.key === "ArrowDown"||event.key === "s") {
    moveDown = false;
  } else if (event.key === " ") {
    spacebarPressed = false;
  }
}

// Function to check for collision between the player and the yellow walls
function checkCollision() {
  const playerRight = player.x + player.width;

  // Loop through all yellow walls to check for collision
  for (const wall of yellowWalls) {
    const yellowWallLeft = wall.posX;

    if (playerRight >= yellowWallLeft && spacebarPressed) {
      // Collision detected and spacebar is pressed
      playerDistance += 1000; // Add 1000 points to the player's score
      spacebarPressed = false; // Reset the spacebar flag to prevent multiple score increments
      console.log("1000 points!");
blinkCanvasBackground(true);
            const wallIndex = yellowWalls.indexOf(wall);
      if (wallIndex !== -1) {
        yellowWalls.splice(wallIndex, 1);
      }
    }
  }
}
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function checkPixelsAroundPlayer(playerX, playerY) {
  // Get the pixel data around the player's position (1 pixel above and 1 pixel below)
  const imageData = ctx.getImageData(playerX, playerY - 1, 1, 3).data;

  // Loop through the pixel data to check transparency
  for (let i = 3; i < imageData.length; i += 4) {
    // Check if any alpha value is 0 (transparent)
    if (imageData[i] === 0) {
      return true; // Found a transparent pixel, return true
    }
  }

  return false; // No transparent pixels found, return false
}
// Function to update player's position based on keyboard input
function updatePlayerPosition() {
  if (moveUp) {
    player.y -= player.speed;
  } else if (moveDown) {
    player.y += player.speed;
  }

  // Ensure the player stays within the canvas boundaries
  player.y = Math.max(player.y, 0);
  player.y = Math.min(player.y, canvas.height - player.height);


  // Check for transparent pixels above or below the player
  const isTransparentAbove = checkPixelsAroundPlayer(player.x, player.y - 1);
  const isTransparentBelow = checkPixelsAroundPlayer(player.x, player.y + player.height);

  if (isTransparentAbove || isTransparentBelow) {
if(countdownValue == 0){
    // Player collided with the waveform edge, reduce a life
    player.lives--;

    // Handle canvas background blink when the player hits the edge
    blinkCanvasBackground();
}
  }
}

// Function to animate the waveform and countdown
function animate() {
  const currentTime = performance.now();
  const elapsedTime = currentTime - prevTime;
  prevTime = currentTime;
  positionX -= 10;
  w.redraw();

updatePlayerPosition();

createBox(player.x, player.y);
// Check if the player has lost all lives
  if (player.lives <= 0) {
    // Perform any game over actions here
   // alert("Game Over");
//api_chat_send(`My LiltLine Score is: ${playerScore} Can you beat it?`)
  //  return; // Stop the animation loop
  }

  const offsetX = currentTime * speed;
  thicknessOffset -= 0.01 * speed; // Decrement the thickness offset to make it travel leftwards
  updateBoxes();
  drawWaveform(offsetX);
  drawBoxes();
  drawPlayer();



  // Ensure the player stays within the canvas boundaries
  if (countdownValue > 0) {
    countdownValue -= elapsedTime;

    // Ensure the countdown doesn't go below 0
    countdownValue = Math.max(countdownValue, 0);

    // Calculate the lerp factor (0 to 1) based on the remaining countdown time
    const lerpFactor = 1 - (countdownValue / countdownDuration);
    intensity = targetIntensity * lerpFactor; // Lerp the intensity

    // Draw the countdown on the canvas
    drawCountdown();
    // Spawn a new box at the player's location
  } else {
    // Set the intensity to the target value once the countdown is complete
    intensity = targetIntensity;
 const offsetX = currentTime * speed;
  thicknessOffset -= 0.01 * speed; // Decrement the thickness offset to make it travel leftwards
  updateBoxes();
  drawWaveform(offsetX);
  drawBoxes();
  drawPlayer();

// Update and animate all the yellow walls
  yellowWalls.forEach(wall => {
    const currentTime = performance.now();

    if (currentTime < wall.endTime) {
      const progress = (currentTime - wall.startTime) / (wall.endTime - wall.startTime);
      const currentX = wall.x - progress * (canvas.width + wall.wallWidth);
      wall.posX = currentX;
      // Draw the yellow wall
      ctx.fillStyle = "rgba(255,255,0,0.5)"; // Yellow color for the wall
      ctx.fillRect(currentX, 0, wall.wallWidth, canvas.height);
    } else {
      // Remove the wall from the array when it is no longer visible on the screen
      const wallIndex = yellowWalls.indexOf(wall);
      if (wallIndex !== -1) {
        yellowWalls.splice(wallIndex, 1);
      }
    }
  });
 checkCollision();
  // Update and display player distance score
  updateScores();
  drawPlayerScore();
  }
  requestAnimationFrame(animate);
}

// Start the animation
let prevTime = performance.now();
animate();
// Create an array to store multiple yellow walls
var audioAverageLevel = 5000;
var ATS =0;
var audioTicks = 1;
// Function to stream audio
function streamAudio() {

  
  var audioStartTime = 0; // Variable to keep track of the audio start time

  // Check if the Web Audio API is supported
  if (!window.AudioContext && !window.webkitAudioContext) {
    console.error("Web Audio API is not supported in this browser.");
    return;
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();

  // Create an analyser node to analyze the audio data
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256; // You can adjust this value to control the analysis precision

  // Function to analyze music beats and return true when the beat is loud
  function analyzeBeats() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(dataArray);

    // Calculate the average amplitude of the audio data
    let sum = dataArray.reduce((acc, val) => acc + val, 0);
    let averageAmplitude = sum / bufferLength;
    audioAverageLevel += averageAmplitude
    audioTicks++;
    const threshold = audioAverageLevel / audioTicks;
    // You can adjust the threshold value to define when a beat is considered loud

  // Get the current audio timestamp
    const currentTime = audioContext.currentTime - audioStartTime;
    // Return true if the average amplitude exceeds the threshold
  // Return true if the average amplitude exceeds the threshold along with the current timestamp
    return { isLoudBeat: averageAmplitude > threshold + (averageAmplitude / 4), timestamp: currentTime };
  }

  // Function to handle the loaded audio data and start analyzing
  function startAnalysis(audioBuffer) {
    const sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;

    // Connect the source node to the analyser and the analyser to the output (speakers)
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);

    // Start playing the audio
    sourceNode.start(0);

    // Call the analyzeBeats function periodically to check for beats
    setInterval(() => {
      const {isLoudBeat,timestamp} = analyzeBeats();
ATS = timestamp;
      if (isLoudBeat) {
        throttledOnLoudBeatDetected();
      }
    }, 100); // Adjust the interval (in milliseconds) as per your requirement
  }

  // Function to handle the XMLHttpRequest and decode the audio data
  function fetchAndDecodeAudio(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";

 xhr.onload = function () {
    if (xhr.status === 200) {
      audioStartTime = audioContext.currentTime; // Record the audio start time
      audioContext.decodeAudioData(xhr.response, startAnalysis, (error) => {
        console.error("Error decoding audio data:", error);
      });
    } else {
      console.error("Failed to load audio:", xhr.status, xhr.statusText);
    }
  };

    xhr.onerror = function() {
      console.error("Network error occurred while loading audio.");
    };

    xhr.send();
  }

  // Call the fetchAndDecodeAudio function to load and start analyzing the audio
  fetchAndDecodeAudio("https://cdn.jsdelivr.net/gh/poopman-owot/liltline/ll.mp3"); // Replace "your_audio_file.mp3" with the URL to your audio file
}

function onLoudBeatDetected() {
blinkCanvasBackground(true);
drawYellowWall(canvas.width - 100, 5000);
}

// Function to throttle the call to onLoudBeatDetected
function throttle(func, limit) {
  let lastCallTimestamp = 0;
  return function() {
    const now = Date.now();
    if (now - lastCallTimestamp >= limit) {
      func.apply(this, arguments);
      lastCallTimestamp = now;
    }
  };
}

// Throttle the onLoudBeatDetected function to be called once a second (1000ms)
const throttledOnLoudBeatDetected = throttle(onLoudBeatDetected, 600);

// Call the streamAudio function to start streaming and analyzing the audio
streamAudio();

const overlayDiv = document.createElement("div");
overlayDiv.style.position = "fixed";
overlayDiv.style.top = "0";
overlayDiv.style.left = "0";
overlayDiv.style.width = "100%";
overlayDiv.style.height = "100%";
overlayDiv.style.backgroundColor = "hsla(0, 100%, 50%, 0.5)";
overlayDiv.style.pointerEvents = "none";
overlayDiv.style.zindex = 100000;
document.body.appendChild(overlayDiv);
function animateHueChange() {
  let hue = 0; // Starting hue value
  const animationDuration = 50; // Duration of one loop in milliseconds

  function updateHue() {
    hue = (hue +( 1/animationDuration)) % 360; // Increment hue and loop back to 0 after 360

    const hueColor = `hsla(${hue}, 100%, 50%, 0.5)`;
    overlayDiv.style.backgroundColor = hueColor;

    requestAnimationFrame(updateHue);
  }

  // Call the updateHue function to start the animation
  updateHue();
}
animateHueChange();
