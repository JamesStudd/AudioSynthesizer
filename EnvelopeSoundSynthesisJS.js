// Wave
var wave;
var env;

// Convert notes to frequencies and vice versa
var notesToFreq;

// Original frequencies that higher octaves can use
var originalFrequencies;

// Spawn the correct note in correct screen space
var notesToCoordinates;

// Which keys are going to be used to play
var keysToNotes;

// The current notes on screen
var notes = [];

// Slider stuff
var MP;
var allSliders = [];
var octaveSlider, attackSlider, decaySlider, sustainSlider, releaseSlider;

// Confirm changes
var changeADSRButton;
var waveSelect;

// Input boxes for attack and release level
var inputAttackLevel, inputReleaseLevel;

// Help Image
var img;

function setup() {
  createCanvas(1000, 1000);
  smooth();
  
  notesToCoordinates = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C"]
  keysToNotes = ["Z", "S", "X", "D", "C", "V", "G", "B", "H", "N", "J", "M", "¼"]
  
  originalFrequencies = {
    16.35:"C",
    17.32:"C#",
    18.35:"D",
    19.45:"D#",
    20.60:"E",
    21.83:"F",
    23.12:"F#",
    24.50:"G",
    25.96:"G#",
    27.50:"A",
    29.14:"A#",
    30.87:"B"
  };
  
  notesToFreq = originalFrequencies;
  
  env = new p5.Env(); // Envelope
  env.setADSR(0.05, 0.1, 0.5, 1); // attack, decay, sustain, release
  env.setRange(1.2, 0);
  
  wave = new p5.Oscillator();
  wave.setType('sine'); // sine, square, sawtooth, triangle
  wave.start();
  wave.amp(env);
  
  octaveSlider = new SliderClass(50, 670, 400, 0, 8, 1, false, true, false, "Octave", 4);
  allSliders.push(octaveSlider);
  
  attackSlider = new SliderClass(50, 770, 400, 0, 2, 0.01, true, false, false, "Attack", 0.05);
  allSliders.push(attackSlider);
  
  decaySlider = new SliderClass(50, 870, 400, 0, 2, 0.01, true, false, false, "Decay", 0.1);
  allSliders.push(decaySlider);
  
  sustainSlider = new SliderClass(530, 670, 400, 0, 2, 0.01, true, false, false, "Sustain", 0.5);
  allSliders.push(sustainSlider);
  
  releaseSlider = new SliderClass(530, 770, 400, 0, 2, 0.01, true, false, false, "Release", 1);
  allSliders.push(releaseSlider);
  
  changeADSRButton = createButton("Change ADSR");
  changeADSRButton.position(530, 820);
  changeADSRButton.mousePressed(changeADSR);
  
  var changeWaveType = createElement('h4', 'Wave Type');
  changeWaveType.position(683, 775);
  waveSelect = createSelect();
  waveSelect.position(680, 820);
  waveSelect.option('Sine');
  waveSelect.option('Square');
  waveSelect.option('Sawtooth');
  waveSelect.option('Triangle');
  waveSelect.changed(changeWave);
  
  var changeWaveType = createElement('h4', 'Attack Level');
  changeWaveType.position(535, 825);
  inputAttackLevel = createInput();
  inputAttackLevel.position(555, 870);
  inputAttackLevel.input(inputNewLevels);
  inputAttackLevel.size(50, 20);
  
  var changeWaveType = createElement('h4', 'Release Level');
  changeWaveType.position(675, 825);
  inputReleaseLevel = createInput();
  inputReleaseLevel.position(695, 870);
  inputReleaseLevel.input(inputNewLevels);
  inputReleaseLevel.size(50, 20);
  
  var changeWaveType = createElement('p', '');
  changeWaveType.position(745, 845);
  
  img = loadImage("keyboard.png");
  
  rectMode(CENTER);
}

function draw(){
  background(57);
  textSize(32);
  var i = notes.length
  while(i--){
     notes[i].fall();
     notes[i].display();
     if(notes[i].offscreen){
        notes.splice(i, 1);
     }
  }
  
  line(0, 600, width, 600);
  for(var j = 0; j < allSliders.length; j++){
    allSliders[j].move();
    allSliders[j].display();
  }
  
  image(img, 760, 890, img.width/1.5, img.height/1.5);
}

function changeWave() {
  var item = waveSelect.value().toLowerCase();
  wave.stop();
  wave.setType(item);
  wave.start();
}

function changeADSR(){
  wave.stop();
  env.setADSR(attackSlider.sliderValue, decaySlider.sliderValue, sustainSlider.sliderValue, releaseSlider.sliderValue);
  wave.amp(env);
  wave.start();
}

function inputNewLevels() {
  wave.stop();
  var newAtk, newRel;
  
  if(inputAttackLevel.value() == ""){
    newAtk = 0; 
  } else {
    newAtk = parseFloat(inputAttackLevel.value()); 
  }
  
  if(inputReleaseLevel.value() == ""){
    newRel = 0; 
  } else {
    newRel = parseFloat(inputReleaseLevel.value()); 
  }
  
  env.setRange(newAtk, newRel);
  wave.amp(env);
  wave.start();
}

function mousePressed() {
  MP = true;
}

function mouseReleased() {
  MP = false;
  if(octaveSlider.sliderValue % 1 === 0){
    changeOctave();
  }
}

function changeOctave(){
   var newFreq = {};
   if(octaveSlider.sliderValue == 0){
     notesToFreq = originalFrequencies; 
   } else {
     for(var i = 0; i < Object.keys(originalFrequencies).length; i++){
       var newKeyValue = Object.keys(originalFrequencies)[i];
       for(var j = 0; j < octaveSlider.sliderValue; j++){
          newKeyValue *= 2;
       }
       newFreq[newKeyValue] = Object.values(originalFrequencies)[i];
     }
     notesToFreq = newFreq;
   }  
}

function playNote(tempFreq, letter, upper){
  wave.freq(tempFreq);
  env.play();
  var newLetter;
  if(letter != undefined){
     newLetter = letter;
  } else {
    newLetter = notesToFreq[tempFreq]; 
  }
  
  var isUpper = false;
  if(upper != undefined){
    isUpper = upper;
  }
  var n = new DisplayNote(newLetter, isUpper);
  notes.push(n);
  env.triggerAttack();
}

function keyPressed() {
  if(key == "¼"){
    playNote(parseFloat((_.invert(notesToFreq))["C"]) * 2, "C", true); 
  } else {
    if(keysToNotes.includes(key)){
      playNote(parseFloat((_.invert(notesToFreq))[notesToCoordinates[keysToNotes.indexOf(key)]]));
    }    
  }
}

function keyReleased(){
  env.triggerRelease(); 
}

function DisplayNote (letter, upper) {
  this.noteLetter = letter;
  this.upper = upper;
  this.noteColor = color(random(255), random(255), random(255));
  this.xpos = (notesToCoordinates.indexOf(this.noteLetter) * (width / notesToCoordinates.length));
  if(this.upper){
    this.xpos = ((notesToCoordinates.length - 1) * (width / notesToCoordinates.length)); 
    console.log(this.xpos);
  }
  this.ypos = 0;
  this.yspeed = 2;
  this.offscreen = false;
  
  this.display = function() {
    fill(this.noteColor);
    text(this.noteLetter, this.xpos, this.ypos);
  }
  
  this.fall = function() {
    this.ypos = this.ypos + this.yspeed;
    if(this.ypos > 600){
      this.offscreen = true; 
      this.noteColor = color(0,0,0,0);
    }
  }
}

function SliderClass(_x, _y, _length, _startValue, _endValue, _varerval, _vars, _sticky, _showValues, _textDisplay, _initialValue) {
  this.clicked = false; 
  this.sticky = false; 
  this.knobWidth = 12;
  this.knobHeight = 20;
  this.sliderValue = 0.00; 
  this.sliderValueInt = 0; 
  this.fade = 255; // for knob color
  this.xDif = 0.0;
  this.screenInterval = 0;
  this.x = _x;
  this.y = _y;
  this.xEnd = this.x + _length;
  this.xStart = this.x;
  this.startValue = _startValue;
  this.endValue = _endValue;
  this.vars = _vars;
  this.varerval = _varerval;
  this.totalLength = _length;
  this.sticky = _sticky;
  this.showValues = _showValues; 
  this.textDisplay = _textDisplay;
  this.initialValue = _initialValue;
  if(this.initialValue > 0){
    var percent = this.initialValue / this.endValue;
    this.x = this.xStart + ((this.xEnd - this.xStart) * percent);
  }

 this.move = function() {
    // check to see if it's clicked 
    if (dist(mouseX, mouseY, this.x, this.y) < this.knobWidth) { // use this if you want a round knob on the slider 
      if (MP && this.clicked == false) { // if mouse was pressed
        this.xDif = mouseX - this.x;
        this.clicked = true;
      }
      this.fade = 100; // mouseOver but not clicked
    } else {
      this.fade = 0;
    }
    if (this.clicked == true) {
      this.fade = 255;
    }
    if (MP == false && this.clicked == true) { // if the mouse was just released
      this.clicked = false;
      if (this.sticky) { // if you set it to jump to the closest line 
        var modDif = this.sliderValue % this.varerval; // value to show how close it is to last line 
        var div = int(this.sliderValue / this.varerval); // vlaue to show how MANY varervals it's passed 
        
        if (modDif < this.varerval / 2) { // so it goes to closest line not just lower 
          this.x = this.xStart + (div * this.screenInterval);
        } else {
          this.x = this.xStart + ((div + 1) * this.screenInterval);
        }
      }
    }
    if (this.clicked) {
      this.x = mouseX - this.xDif; // so the slider doens't "jump" to the mouse x. 
      this.x = constrain(this.x, this.xStart, this.xEnd); // keep the knob on the slider
    }
    
    this.sliderValue = map(this.x, this.xStart, this.xEnd, this.startValue, this.endValue); // get the slider position relative to the values
    this.sliderValueInt = int(this.sliderValue); // make that number an var
  }

  this.display = function() {
    textSize(20);
    stroke(1);
    this.screenInterval = map(this.varerval, 0, this.endValue - this.startValue, 0, this.totalLength); // get the createCanvas of the gaps for the screen relative to the varervals 
    var counter = 0; 
    for (var i = int(this.screenInterval); i < this.totalLength; i += this.screenInterval) { // go from the first gap to the end of slider by the screenInterval
      line(i + this.xStart, this.y + 12, i + this.xStart, this.y - 12); // draw lines
      if(this.showValues){
        counter ++; 
        text( nfc(counter * this.varerval,1,1), i + this.xStart, this.y + 30);
        
      }
    }
    line(this.xStart, this.y + 12, this.xStart, this.y - 12); // draw first line (optional) 
    line(this.xEnd, this.y + 12, this.xEnd, this.y - 12); // draw last line (optional) 
    line(this.xStart, this.y, this.xEnd, this.y); // draw center line 
    fill(255);
    rect(this.x, this.y, this.knobWidth, this.knobHeight); // so it's opaque
    fill(100, 120, 160, this.fade);
    rect(this.x, this.y, this.knobWidth, this.knobHeight); // add color 
    fill(1);
    if (this.vars) {
     
    text( nfc(this.sliderValue,2,1), this.x, this.y - 20);
    } else {
      text(this.sliderValueInt, this.x, this.y - 20);
    }
    text(int (this.startValue), this.xStart, this.y + 30);
    text(int (this.endValue), this.xEnd, this.y + 30);
    text(this.textDisplay, this.x, this.y - 40);
  }
}