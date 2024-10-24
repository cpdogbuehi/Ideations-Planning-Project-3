let ratio = 1.6; // 1.6 aspect ratio (fit projector)
let globeScale; // Scale factor

let mic; // Microphone
let vol; // Volume
let normVol; // Normalized volume
let volSense = 100; // Volume sensitivity
let volSenseSlider; // Volume sensitivity slider
let sliderStep = 10; // Slider step
let startAudio = false; // Start audio flag

// Frequency variables
let fft; // Fast Fourier Transform
let spectrum; // Frequency Spectrum
let waveform; // Waveform

let bassEnergy;
let lastBeatTime = 0;
let bpm = 120; // Set the BPM of the song (can be detected dynamically)
let beatInterval = (60 / bpm) * 1000; // Calculate time between beats in milliseconds
let audioOn = false;
let freqThreshold = 100; // Set the threshold for bass energy 0 is high 200 is low

// Hero variables
let currentHeroY = 0; // Variable to store the current y-position of the hero rectangle
let targetHeroY = 0; // Variable to store the target y-position of the hero rectangle
let lastPosition = -1; // Variable to store the last position (0: top, 1: middle, 2: bottom)


function setup() {

    createCanvas(window.innerWidth, window.innerHeight / ratio);
    height = window.innerHeight / ratio;
    width = window.innerWidth;
    globeScale = min(width, height);
    colorMode(HSB);

    getAudioContext().suspend(); // Pause audio context
    fft = new p5.FFT();
    mic = new p5.AudioIn();
    mic.start();
    fft.setInput(mic);

    volSenseSlider = createSlider(0, 200, volSense, sliderStep); // Create volume sensitivity slider
    volSenseSlider.position(10, 10); // Position the slider in the top-left corner
}

function draw() {
    background(200, 100, 100, 0.1);


   if(startAudio){
        vol = mic.getLevel(); // get volume level
        spectrum = fft.analyze(); // get frequency spectrum
        waveform = fft.waveform(); // get waveform

        volSense = volSenseSlider.value(); // get volume sensitivity
        normVol = vol * volSense; // normalize volume (scale up vol)
        console.log(vol); // returns values between 0 - 1

        waveForm(); // waveform function
        spectrumF(); // draw frequency spectrum

        console.log(spectrum); // returns an array of values between 0 - 255
   }

   if (audioOn) {
    fft.analyze();
    bassEnergy = fft.getEnergy("bass"); // Low frequency energy
    freqThreshold = volSenseSlider.value(); // Set the threshold for bass energy
    console.log("Bass Energy: ", bassEnergy); // Log bass energy for debugging

    // Check for a beat (if bass energy exceeds a threshold)
    if (bassEnergy > freqThreshold && millis() - lastBeatTime > beatInterval * 0.8) {
        lastBeatTime = millis();
        console.log("Beat detected!");
        let newPosition;
            do {
                newPosition = floor(random(3)); // Randomly choose 0 (top), 1 (middle), or 2 (bottom)
            } while (newPosition === lastPosition); // Ensure it's not the same as the last position
            lastPosition = newPosition;

            // Set the target y-position based on the new position
            if (newPosition === 0) {
                targetHeroY = 0; // Top
            } else if (newPosition === 1) {
                targetHeroY = height / 2 - 50; // Middle (centered vertically)
            } else if (newPosition === 2) {
                targetHeroY = height - 100; // Bottom
            }
     /* // Example: Move a circle to the beat
     let timeSinceLastBeat = millis() - lastBeatTime;
     let speedC = map(timeSinceLastBeat, 0, beatInterval, 0, width);
     ellipse(speedC, height / 2, height * 0.5, height * 0.5); // Move the circle with the beat */
 }
}

   stroke(0,0,0);
   strokeWeight(5);

   fill(0, 0, 10);
    rect(0, 0, width / 2, height / 3); // Top-left panel
    rect(width / 2, 0, width / 2, height / 3); // Top-right panel

    fill(0, 0, 20);
    rect(0, height / 3, width / 3, height / 3); // Middle-left panel
    rect(width / 3, height / 3, width / 3, height / 3); // Middle-center panel
    rect(2 * width / 3, height / 3, width / 3, height / 3); // Middle-right panel

    fill(0, 0, 30);
    rect(0, 2 * height / 3, width / 2, height / 3); // Bottom-left panel
    rect(width / 2, 2 * height / 3, width / 2, height / 3); // Bottom-right panel


    // Smoothly interpolate the current y-position towards the target y-position
    currentHeroY = lerp(currentHeroY, targetHeroY, 0.2);

    fill(255); // Set fill color to white for the hero rectangle
    rect(width / 2.2, currentHeroY, 100, 100); // hero rectangle


    //fill(0, 0, 100);
    //rect(width/ 2.2, height/ 2.8, 100, 100); // hero

    // Calculate the position and color of the hero rectangle based on waveform data
    /* if (waveform && waveform.length > 0) {
        let waveIndex = floor(map(frameCount % waveform.length, 0, waveform.length, 0, waveform.length));
        let waveValue = waveform[waveIndex] * 2;
        let targetHeroY = map(waveValue, -1, 1, 0, height - 100); // Map to the entire canvas height

        // Smoothly interpolate the current y-position towards the target y-position
        currentHeroY = lerp(currentHeroY, targetHeroY, 0.1);

        // Map the waveform value to a color range (e.g., from 0 to 255 for grayscale)
        let heroColor = map(waveValue, -1, 1, 0, 255);

        fill(heroColor); // Set fill color based on waveform data
        rect(width / 2.2, currentHeroY, 100, 100); // hero rectangle
    } */



}



function mousePressed() {
    getAudioContext().resume(); // Resume audio context

    if(!startAudio){
        mic = new p5.AudioIn();
        fft = new p5.FFT();
        fft.setInput(mic);

        mic.start();
        startAudio = true;

    audioOn = true;
    getAudioContext().resume();
    console.log("Audio context resumed and microphone started");
    }
}

function waveForm(){
    if(startAudio){
        // Waveform visualization-----------------------------------
        noFill();
        beginShape();
        stroke(20);

        for (let i = 0; i < waveform.length; i++){
            let x = map(i, 0, waveform.length, 0, width);
            let y = map( waveform[i], -1, 1, 0, height);
            let strokeCol = map(waveform[i], -1, 1, 0, 360);
            let strokeSat = map(waveform[i], -1, 1, 0, 100);

            stroke(strokeCol, strokeSat, 100);
            strokeWeight(globeScale * 0.01);
            vertex(x,y);
        }
        endShape();
    }
}

function spectrumF(){
    if(startAudio){
        for(let i = 0; i < spectrum.length; i++){

            let rectX = map(i, 0, spectrum.length, 0, width);
            let rectY = height;
            let rectW = globeScale * 0.05;
            let rectH = -map(spectrum[i], 0, 255, 0, height);

            noStroke();
            fill(spectrum[i], 100, 100, 0.1);
            rect(rectX, rectY, rectW, rectH);

            let rectX2 = width - rectX - rectW;
            rect(rectX2, rectY, rectW, rectH);

        }
    }
}