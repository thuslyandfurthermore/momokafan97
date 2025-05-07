const Cell = class {
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.value = true;
    this.color = 255;
    this.beenFlipped = false;
    this.coordX = 0;
    this.coordY = 0;
    this.linked = [];
  }
};

//copied from mdn idk shit
//equivalencies.json was precomputed by the python code which is in this directory at generateEquivalences.py
var eq = [];
async function getData() {
  const url = "./equivalencies.json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    eq = await response.json();
    console.log(eq);
  } catch (error) {
    console.error(error.message);
  }
}
getData();

var size = 4;
var cells = [];
var solved = false;
const canvas = document.getElementById("canvas");
const controls = document.getElementById("controls");
const ctx = canvas.getContext("2d");
canvas.addEventListener("mouseup", onCanvasClick, false);
const newGame = document.getElementById("newGame");
newGame.addEventListener("click", setupBoard, false);
const sizeSelector = document.getElementById("sizeSelector");
const solveButton = document.getElementById("solve");
solveButton.addEventListener("click", solveBoard, false);
let animationId;


function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//converts the solver state to a number we can math at
//also the language im using changed halfway through this project lol
//stepstate is the cells you click to get the current boardstate, which is the black and white
function getStepState() {
  let result = 0;
  for(let i in cells) {
    if(cells[i].beenFlipped) {
      //think theres a better way of setting bits like this? this feels hacky
      result += 2 ** (cells.length - i - 1);
    }
  }
  return result;
}

function solveBoard(){
  //this used to just say solved = !solved ;-;
  if(solved){solved = false} else {
    solved = true;
    if(size > 3 && size < 6) {
    let currentEquivalencies = eq.equivalencies[size - 2]; //the weird indicies here are cos i fucked up generation
    let stepState = getStepState();
    let possibleStates = [];
    
    //xor each equivalency with the current stepstate to get a list of stepstates that all result in the current boardstate
    for(let i in currentEquivalencies) {
      possibleStates.push((+stepState ^ parseInt(currentEquivalencies[i], 2)).toString(2).padStart(cells.length, '0'));
    }
    
    //sort the list by how many 1s are in each stepstate
    possibleStates.sort((a, b) => a.split('1').length - b.split('1').length);
    
    //directly set the beenFlipped of each cell with the first stepstate
    for(let i in cells) {
      cells[i].beenFlipped = Boolean(Number(possibleStates[0].toString(2).charAt(i)));
    }
    }
  }
  updateBoard();
}

function flipCell(cell){
  //theres 0 reason for this to be generic to different flip shapes lol everything else would break
  cell.value = !cell.value;
  cell.beenFlipped = !cell.beenFlipped;
  for (let i in cell.linked){
    cell.linked[i].value = !cell.linked[i].value;
  }
  if (!animationId) {
    animationId = requestAnimationFrame(step);
  }
}


function onCanvasClick(event){
  //mouse coord relative to canvas space, after transformations in css and responsive ui
  var rect = canvas.getBoundingClientRect(), // abs. size of element
  mouseX = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
  mouseY = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
  
  //find which cell to flip based on divided x and y values
  flipCell(cells[Math.floor(mouseX / cellWidth) * size + Math.floor(mouseY / cellWidth)]);
  updateBoard();
}

function setupBoard(){
  cells = [];
  solved = false;
  size = Number(sizeSelector.value);
  cellWidth = canvas.width / size;
  
  //create cells
  for (let i = 0; i < size; i++){
    for (let j = 0; j < size; j++){
      cells[(i * size) + j] = new Cell(i, j);
    }
  }
  
  for (let j in cells){
    //i am so tired
    let i = +j;
    
    //link cells to the: up, down, left, and right if possible
    if (cells[i - 1] && cells[i].y > 0) cells[i].linked.push(cells[i - 1]);
    if (cells[i + 1] && cells[i].y < size - 1) cells[i].linked.push(cells[i + 1]);
    if (cells[i - size] && cells[i].x > 0) cells[i].linked.push(cells[i - size]);
    if (cells[i + (size)] && cells[i].x < size - 1) cells[i].linked.push(cells[i + size]);
  }
  
  //find the top left of the grid
  topleft = (canvas.width / 2) - ((size * cellWidth) / 2);
  
  //store top left of the cell
  for (let i in cells) {
    cells[i].coordX = topleft + (cells[i].x * cellWidth);
    cells[i].coordY = topleft + (cells[i].y * cellWidth);
  }
  
  //flip random cells for a while
  for (let i = 0; i < cells.length; i++){
    flipCell(cells[getRandomInt(cells.length)]);
  }
  updateBoard();
}

function step(timeStamp) {
  let needsUpdate = false;
  for (let i in cells) {
    if (cells[i].value && cells[i].color < 255) {
      needsUpdate = true;
      cells[i].color = Math.min(cells[i].color * 1.1, 255);
    } else if (!cells[i].value && cells[i].color > 128) {
      needsUpdate = true;
      cells[i].color = Math.max(cells[i].color * 0.9, 128);
    }
  }
  updateBoard();
  if (needsUpdate) {
    requestAnimationFrame(step) 
    } else {
      cancelAnimationFrame(animationId);
      animationId = 0;
    };
}

function updateBoard() {
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "lightgray";
  ctx.lineWidth = 8;
  
  for (let i in cells) {
    //light cells
    if (cells[i].value) {
      ctx.fillStyle = "rgb(" + cells[i].color + " " + cells[i].color + " " + cells[i].color + ")";
      ctx.fillRect(cells[i].coordX, cells[i].coordY, cellWidth, cellWidth);
      
    } else {
      //dark cells
      ctx.fillStyle = "rgb(" + cells[i].color + " " + cells[i].color + " " + cells[i].color + ")";
      ctx.fillRect(cells[i].coordX, cells[i].coordY, cellWidth, cellWidth);
    }
    
    //solver boxes
    if (solved && cells[i].beenFlipped) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.strokeRect(cells[i].coordX + (cellWidth / 10), cells[i].coordY + (cellWidth / 10), cellWidth - (cellWidth / 5), cellWidth - (cellWidth / 5));
    }
    
    //grid
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 8;
    ctx.strokeRect(cells[i].coordX, cells[i].coordY, cellWidth, cellWidth);
    
    //draw linked cells ughhhh
    let hintWidth = cellWidth / 8;
    for (let i in cells) {
      //central square
      ctx.lineWidth = 2;
      ctx.fillStyle = "lightgray";
      ctx.fillRect(cells[i].coordX + cellWidth / 2 - hintWidth / 2, cells[i].coordY + cellWidth / 2 - hintWidth / 2, hintWidth, hintWidth);
      
      //this is cos otherwise its like inset by one pixel
      ctx.strokeRect(cells[i].coordX + cellWidth / 2 - hintWidth / 2, cells[i].coordY + cellWidth / 2 - hintWidth / 2, hintWidth, hintWidth);
      
      for (let j in cells[i].linked) {
        //uggghhhh
        ctx.lineWidth = 2;
        ctx.strokeStyle = "lightgrey";
        
        //the grid distance between the current cell and the linked cell
        let linkedRelativeX = cells[i].linked[j].x - cells[i].x;
        let linkedRelativeY = cells[i].linked[j].y - cells[i].y;
        
        let linkedTopLeftX = (cells[i].coordX + cellWidth / 2) - (hintWidth / 2) + linkedRelativeX * hintWidth;
        let linkedTopLeftY = (cells[i].coordY + cellWidth / 2) - (hintWidth / 2) + linkedRelativeY * hintWidth;
        
        ctx.strokeRect(linkedTopLeftX, linkedTopLeftY, hintWidth, hintWidth);
        //thats what all glsl is like
        //like 4 levels of variables packaging a ridic equation to find the top left of a square
      }
    }
    //todo: research canvas animations?
  }
}

setupBoard();
