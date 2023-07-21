w.night()
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
        let speed = 2; // Controls the speed of the leftwards movement
        let thicknessOffset = 0; // Initialize the thickness offset
        let verticalShift = owotHeight/4; // Vertical shift for the waveform

        // Countdown properties
        let countdownDuration = 3000; // Duration of the countdown in milliseconds (3 seconds)
        let countdownValue = countdownDuration; // Remaining time during the countdown

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
            ctx.font = "48px Arial";
            ctx.fillStyle = "#FFF";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText((countdownValue / 1000).toFixed(0), canvas.width / 2, canvas.height / 2);
        }

        // Function to animate the waveform and countdown
        function animate() {
            const currentTime = performance.now();
            const elapsedTime = currentTime - prevTime;
            prevTime = currentTime;
positionX -= 10;
            w.redraw();
            if (countdownValue > 0) {
                countdownValue -= elapsedTime;

                // Ensure the countdown doesn't go below 0
                countdownValue = Math.max(countdownValue, 0);

                // Calculate the lerp factor (0 to 1) based on the remaining countdown time
                const lerpFactor = 1 - (countdownValue / countdownDuration);
                intensity = targetIntensity * lerpFactor; // Lerp the intensity

                // Draw the countdown on the canvas
                drawCountdown();
            } else {
                // Set the intensity to the target value once the countdown is complete
                intensity = targetIntensity;
            }

            const offsetX = currentTime * speed;
            thicknessOffset -= 0.01 * speed; // Decrement the thickness offset to make it travel leftwards
            drawWaveform(offsetX);
            requestAnimationFrame(animate);
        }

        // Start the animation
        let prevTime = performance.now();
        animate();
