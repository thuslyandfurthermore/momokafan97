const canvas = document.getElementById('main');
const ctx = canvas.getContext("2d");
const controls = document.getElementById("controls");
const newGame = document.getElementById('newGame');
const sizeDown = document.getElementById('sizeDown');
const sizeText = document.getElementById('sizeText');
const sizeUp = document.getElementById('sizeUp');
const switchColorspace = document.getElementById('switchColorspace');
const switchDifficulty = document.getElementById('switchDifficulty');


class Cell {
    constructor(x,y) {
      this.x = x;
      this.y = y;
      this.trueX = x;
      this.trueY = y;
      this.rgb;
      this.oklab;
      this.oklch;
      this.selected = false;
      this.pinned = false;
      this.defaultPinned = false;
    }
};

var cells = [];
var cW = canvas.width * 0.95;
var size = 5;
var currentSize = 5;
var easy = true;
var colorspace = "oklab";
var cellSelected = undefined;
var gameBegun = false;

var colorA;
var colorB;
var colorC;
var colorD;

var oklabA;
var oklabB;
var oklabC;
var oklabD;

var oklchA;
var oklchB;
var oklchC;
var oklchD;


//makes the canvas square and neat
window.addEventListener('resize', resizeCanvas);
window.addEventListener('DOMContentLoaded', resizeCanvas);

function resizeCanvas() {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight * 0.85;
  
    const maxSize = Math.min(containerWidth, containerHeight) * 0.95;
    canvas.width = maxSize;
    canvas.height = maxSize;
    cW = maxSize * 0.95;

    container.width = maxSize;
  
    requestAnimationFrame(draw);
}

//======= button callbacks =======//

function NewGame() {
    generateFourColors();
    currentSize = size;
    cells = [];
    cellSelected = undefined;
    gameBegun = false;
    for(var y = 0; y < size; y++) {
        for(var x = 0; x < size; x++) {

            const newCell = new Cell(x,y);

            //generate gradients
            var rgbLerpX1 = rgbLerp(colorA, colorB, x / (size-1));
            var rgbLerpX2 = rgbLerp(colorC, colorD, x / (size-1));
            newCell.rgb = rgbLerp(rgbLerpX1, rgbLerpX2, y / (size-1));
            var oklabLerpX1 = oklabLerp(oklabA, oklabB, x / (size-1));
            var oklabLerpX2 = oklabLerp(oklabC, oklabD, x / (size-1));
            newCell.oklab = oklabLerp(oklabLerpX1, oklabLerpX2, y / (size-1));
            var oklchLerpX1 = oklchLerp(oklchA, oklchB, x / (size-1));
            var oklchLerpX2 = oklchLerp(oklchC, oklchD, x / (size-1));
            newCell.oklch = oklchLerp(oklchLerpX1, oklchLerpX2, y / (size-1));
            //console.log(`(${x},${y}): ${Math.floor(newCell.oklch.h)}`);
            //pin corners
            if ((x == 0 || x == size-1) && (y == 0 || y == size-1)) {
                newCell.pinned = true;
                newCell.defaultPinned = true;
            }
            cells.push(newCell);
        }
    }
    //testing 4 colors
    requestAnimationFrame(draw);
}

function SizeDown() {
    if(size > 3)
        size--;
    sizeText.innerText = `size: ${size}`
}

function SizeUp() {
    if(size < 10)
    size++;
    sizeText.innerText = `size: ${size}`
}

function SwitchColorspace() {
    switch(colorspace) { 
        case "oklab":
            switchColorspace.innerText = "rgb";
            colorspace = "rgb";
            break;
        case "rgb":
            switchColorspace.innerText = "oklch";
            colorspace = "oklch";
            break;
        case "oklch":
            switchColorspace.innerText = "oklab";
            colorspace = "oklab";
            break;
    }
    requestAnimationFrame(draw);
}

function SwitchDifficulty() {
    switch(easy) { 
        case true:
            switchDifficulty.innerText = "hard";
            easy = false;
            break;
        case false:
            switchDifficulty.innerText = "easy";
            easy = true;
            break;
    }
}

function Shuffle() {
    var cells2 = cells.slice();//.filter(item => !item.pinned);
    for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {

            var randomIndex = Math.floor(Math.random() * cells2.length);
            cells2[randomIndex].x = x;
            cells2[randomIndex].y = y;
            cells2.splice(randomIndex, 1);
        }
    }

    for (i in cells) {
        if (cells[i].pinned) {
            for (j in cells) {
                if (cells[j].x == cells[i].trueX && cells[j].y == cells[i].trueY) {
                    swapCells(cells[i],cells[j]);
                }
            }
        }
    }

    gameBegun = true;

    requestAnimationFrame(draw);
}

//======= drawing =======//

function draw(timestamp) {
    ctx.setTransform();
    ctx.clearRect(0,0,canvas.width,canvas.width);

    for(const i in cells){
        if (colorspace == "rgb") {
            ctx.fillStyle = `rgb(${cells[i].rgb.r} ${cells[i].rgb.g} ${cells[i].rgb.b})`;
        }
        if (colorspace == "oklab") {
            ctx.fillStyle = `oklab(${cells[i].oklab.L} ${cells[i].oklab.a} ${cells[i].oklab.b})`;
        }
        if (colorspace == "oklch") {
            ctx.fillStyle = `oklch(${cells[i].oklch.L} ${cells[i].oklch.c} ${cells[i].oklch.h})`;
        }
        if (!cells[i].selected){
            
            //origin will be center of each cell
            ctx.setTransform({e: cells[i].x * cW/currentSize + cW * 0.025 + cW/currentSize/2, f: cells[i].y * cW/currentSize + cW * 0.025 + cW/currentSize/2});
            
            ctx.fillRect(-cW / currentSize / 2, -cW / currentSize / 2, cW/currentSize * 1.01, cW/currentSize * 1.01);
            
            if (cells[i].pinned){
                //pins
                ctx.fillStyle = "white"
                ctx.fillRect(-cW/currentSize * 1 / 10, -cW/currentSize * 1 / 10, cW/currentSize / 5, cW/currentSize / 5);
            }
        } 
    }
    
    //draw selected cell last cos it goes on top
    if (cellSelected) {
        if (colorspace == "rgb") {
            ctx.fillStyle = `rgb(${cellSelected.rgb.r} ${cellSelected.rgb.g} ${cellSelected.rgb.b})`;
        }
        if (colorspace == "oklab") {
            ctx.fillStyle = `oklab(${cellSelected.oklab.L} ${cellSelected.oklab.a} ${cellSelected.oklab.b})`;
        }
        if (colorspace == "oklch") {
            ctx.fillStyle = `oklch(${cellSelected.oklch.L} ${cellSelected.oklch.c} ${cellSelected.oklch.h})`;
        }
        ctx.setTransform();
        ctx.setTransform({e: cellSelected.x * cW/currentSize + cW * 0.025 + cW/currentSize/2, f: cellSelected.y * cW/currentSize + cW * 0.025 + cW/currentSize/2});
        ctx.rotate(Math.sin(timestamp / 200) / 7);
        ctx.fillRect(-cW / currentSize / 2 - cW * 0.0125, -cW / currentSize / 2 - cW * 0.0125, cW/currentSize * 1.01 + cW * 0.025, cW/currentSize * 1.01 + cW * 0.025);

        requestAnimationFrame(draw);
    }
}

//======= color generation =======//

function randomOklab() {
    //returns {L: 0 to 100, a: -0.4 to 0.4, b: -100 to 100}
    //use as `oklab(${L} ${a} ${b})`

    var newRgb = {r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255,}
    return rgbToOklab(newRgb);
}

function randomRgb() {
    //use as `rgb(${r} ${g} ${b})`
    return {r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255};
}

function oklabDistance(A, B) {
    return Math.sqrt((A.L - B.L)**2 + (A.a - B.a)**2 + (A.b - B.b)**2);
}

function rgbDistance(A, B) {
    return Math.sqrt((A.r - B.r)**2 + (A.g - B.g)**2 + (A.b - B.b)**2);
}

function rgbLerp(A, B, x) {
    var output = {r: undefined, g: undefined, b: undefined};
    output.r = B.r * x + A.r * (1-x);
    output.g = B.g * x + A.g * (1-x);
    output.b = B.b * x + A.b * (1-x);
    return output;
}

function oklabLerp(A, B, x) {
    var output = {L: undefined, a: undefined, b: undefined};
    output.L = B.L * x + A.L * (1-x);
    output.a = B.a * x + A.a * (1-x);
    output.b = B.b * x + A.b * (1-x);
    return output;
}

function oklchLerp(A, B, x) {
    var output = {L: undefined, c: undefined, h: undefined};
    output.L = B.L * x + A.L * (1-x);
    output.c = B.c * x + A.c * (1-x);

    // *sigh*
    var difference = Math.abs(B.h - A.h);
    if (difference > 180) { //this makes it change direction unexpectedly sometimes
        if (B.h > A.h) {
            output.h = (B.h * x + (A.h + 360) * (1-x)) % 360;
        } else {
            output.h = ((B.h + 360) * x + A.h * (1-x)) % 360;
        }
    } else {
        output.h = B.h * x + A.h * (1-x);
    }
    //console.log(output);
    return output;
}

//straight up chatgpt sry
function okLabToOkLch(okLab) {
    const { L, a, b } = okLab;

    // Calculate chroma c
    const c = Math.sqrt(a * a + b * b);

    // Calculate hue h
    let h = Math.atan2(b, a) * (180 / Math.PI);

    // Ensure h is in the range (0, 360)
    if (h < 0) {
        h += 360;  //tf is this
    }
    //h = Math.abs(h % 360); //this isnt equivalent???

    return { L, c, h };
}

function generateFourColors() {
    //clear out the colors
    oklabA = undefined;
    oklabB = undefined;
    oklabC = undefined;
    oklabD = undefined;

    var maxDist;

    //this repeats until all colors are filled up
    while(!oklabD){
        //A will be placed randomly
        oklabA = randomOklab();
        oklabB = undefined;
        oklabC = undefined;
        oklabD = undefined;
        
        //variables for difficulty generation
        var distAB = 0;
        var distAC = 0;
        var distAD = 0;
        var distBC = 0;
        var distBD = 0;
        var distCD = 0;
        maxDist = 0;
        
        //meow as many goes through as it took
        console.log('meow');
        if(easy){
            var distance = 0.2;
            //you get 100 tries to fill up all the colors before we'll start over...
            for (var iterations = 0; iterations < 100; iterations++) {
                //we'll generate one color per go and call that an iteration
                //colorD is under more stringent requirements than C, etc
                var newOklab = randomOklab();
                if (!oklabB){
                    distAB = oklabDistance(newOklab, oklabA);
                    if (distAB > distance) {
                        oklabB = newOklab;
                    }
                } else if (!oklabC){
                    distAC = oklabDistance(newOklab, oklabA);
                    distBC = oklabDistance(newOklab, oklabB);
                    if (distAC > distance && distBC > distance) {
                        oklabC = newOklab;
                    }
                } else if (!oklabD){
                    distAD = oklabDistance(newOklab, oklabA);
                    distBD = oklabDistance(newOklab, oklabB);
                    distCD = oklabDistance(newOklab, oklabC);
                    if (distAD > distance && distBD > distance && distCD > distance) {
                        oklabD = newOklab;
                        console.log(iterations);
                    }
                }
            }
        maxDist = Math.max(distAB,distAC,distAD,distBC,distBD,distCD);
        console.log(maxDist);
        console.log(Math.min(distAB,distAC,distAD,distBC,distBD,distCD));
        } else {
            var distance = 0.125;
            var maximumDistance = 0.2;
            //fuck it an entire other block for hard generation
            for (var iterations = 0; iterations < 100; iterations++) {
                //we'll generate one color per go and call that an iteration
                //colorD is under more stringent requirements than C, etc
                var newOklab = randomOklab();
                if (!oklabB){
                    distAB = oklabDistance(newOklab, oklabA);
                    if (distAB > distance && distAB < maximumDistance) {
                        oklabB = newOklab;
                    }
                } else if (!oklabC){
                    distAC = oklabDistance(newOklab, oklabA);
                    distBC = oklabDistance(newOklab, oklabB);
                    if (distAC > distance && distBC > distance && distAC < maximumDistance && distBC < maximumDistance) {
                        oklabC = newOklab;
                    }
                } else if (!oklabD){
                    distAD = oklabDistance(newOklab, oklabA);
                    distBD = oklabDistance(newOklab, oklabB);
                    distCD = oklabDistance(newOklab, oklabC);
                    if (distAD > distance && distBD > distance && distCD > distance && distAD < maximumDistance && distBD < maximumDistance && distCD < maximumDistance) {
                        oklabD = newOklab;
                        console.log(iterations);
                    }
                }
            }
        maxDist = Math.max(distAB,distAC,distAD,distBC,distBD,distCD);
        console.log(Math.min(distAB,distAC,distAD,distBC,distBD,distCD));
        console.log(maxDist);
        }
    }
    colorA = oklabToSRGB(oklabA);
    colorB = oklabToSRGB(oklabB);
    colorC = oklabToSRGB(oklabC);
    colorD = oklabToSRGB(oklabD);
    oklchA = okLabToOkLch(oklabA);
    oklchB = okLabToOkLch(oklabB);
    oklchC = okLabToOkLch(oklabC);
    oklchD = okLabToOkLch(oklabD);
}

//======= mouse inputs... =======//

function win() {
    for (i in cells) {
        cells[i].pinned = true;
        cells[i].defaultPinned = true;
    }
    requestAnimationFrame(draw);
}

function swapCells(A, B) {
    var C = {x: A.x, y: A.y};
    A.x = B.x;
    A.y = B.y;
    B.x = C.x;
    B.y = C.y;

    if (gameBegun) {
        var won = true;
        for (i in cells) {
            if (cells[i].x != cells[i].trueX || cells[i].y != cells[i].trueY) {
                won = false;
            }
        }
        if (won) win();
    }

    requestAnimationFrame(draw);
}

addEventListener("click", function(event) {
    // Get the bounding rectangle of the canvas
    const rect = canvas.getBoundingClientRect();

    // Calculate the mouse position relative to the top left of the game area
    const x = event.clientX - rect.left - cW * 0.025;
    const y = event.clientY - rect.top - cW * 0.025;

    var x1 = Math.floor(x / cW * currentSize);
    var y1 = Math.floor(y / cW * currentSize);

    if (!gameBegun) {
        for (i in cells) {
            if (cells[i].x == x1 && cells[i].y == y1 && !cells[i].defaultPinned){
                cells[i].pinned = !cells[i].pinned;
            }
        }
        
        requestAnimationFrame(draw);
    } else {

        
        for (i in cells) {
            if (cells[i].x == x1 && cells[i].y == y1){
                if (cells[i].selected){
                    cellSelected = undefined;
                    cells[i].selected = false;
                    requestAnimationFrame(draw);
                    return;
                } else if (!cells[i].pinned) {
                    
                    if (!cellSelected){
                        
                        cellSelected = cells[i];
                        cells[i].selected = true;
                        requestAnimationFrame(draw);
                        return;
                    } else {
                        swapCells(cellSelected, cells[i]);
                        cellSelected.selected = false;
                        cellSelected = undefined;
                        requestAnimationFrame(draw);
                        return;
                    }
                }
            } else {
                cells[i].selected = false;
            }
            
        }
    }
    this.requestAnimationFrame(draw);
});

window.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    if (!gameBegun) {

        // Get the bounding rectangle of the canvas
        const rect = canvas.getBoundingClientRect();
        
        // Calculate the mouse position relative to the top left of the game area
        const x = event.clientX - rect.left - cW * 0.025;
        const y = event.clientY - rect.top - cW * 0.025;
        
        var x1 = Math.floor(x / cW * currentSize);
        var y1 = Math.floor(y / cW * currentSize);
        
        // Log the coordinates
        console.log(`Clicked at coordinates: (${x}, ${y})`);
        
        for (i in cells) {
            if (cells[i].x == x1 && cells[i].y == y1 && !cells[i].defaultPinned){
                cells[i].pinned = !cells[i].pinned;
            }
        }
        
        requestAnimationFrame(draw);
    }
}); 


/* notes lol
    old generation alg measured rgb distances instead of lab distances
    pass numbers to a string by going `rgb(${r} ${g} ${b})` with backticks
*/

NewGame();
