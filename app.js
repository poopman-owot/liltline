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
function blinkCanvasBackground() {
  if (blinkBackground) {
    canvas.style.backgroundColor = "red";
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
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
let moveUp = false;
let moveDown = false;

function handleKeyDown(event) {
  if (event.key === "ArrowUp") {
    moveUp = true;
  } else if (event.key === "ArrowDown") {
    moveDown = true;
  }
}

function handleKeyUp(event) {
  if (event.key === "ArrowUp") {
    moveUp = false;
  } else if (event.key === "ArrowDown") {
    moveDown = false;
  }
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
    alert("Game Over");
api_chat_send(`My LiltLine Score is: ${playerScore} Can you beat it?`)
    return; // Stop the animation loop
  }

  // ... (existing code)

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

  // Update and display player distance score
  updateScores();
  drawPlayerScore();
  }
  requestAnimationFrame(animate);
}

// Start the animation
let prevTime = performance.now();
animate();
