const Cell = class {
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.value = 0;
    this.trueValue = 0; //0 = love in tennis
    this.coordX = 0;
    this.coordY = 0;
    this.selected = false;
    this.pencil = [];
  }
};

size = 4;
cells = [];
rowHints = [];
colHints = [];
revRowHints = [];
revColHints = [];
pencilMode = false;
const canvas = document.getElementById("canvas");
const controls = document.getElementById("controls");
const ctx = canvas.getContext("2d");
canvas.addEventListener("mouseup", onCanvasClick, false);
const newGame = document.getElementById("newGame");
newGame.addEventListener("click", setupBoard, false);
const sizeSelector = document.getElementById("sizeSelector");
const solveButton = document.getElementById("solve");
solveButton.addEventListener("click", solveBoard, false);


function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function solveBoard(){
  //i almost wanna refactor the board as a 2 dimensional linked list and make a real solver
  for (let i in cells){
    cells[i].value = cells[i].trueValue;
  }
  updateBoard();
}

function selectCell(id){
  for (let i in cells){
    if (i == id) {
      if (cells[i].selected) {
        pencilMode = !pencilMode;
      } else {
        cells[i].selected = true;
        console.log(id + " selected");
      }
    } else {
      cells[i].selected = false;
    }
  }
}


function onNumberButton(){
  if (pencilMode) {
    for (let i in cells){
      if (cells[i].selected){
        if (cells[i].pencil[this.value - 1]){
          cells[i].pencil[this.value - 1] = false;
        } else{
          cells[i].pencil[this.value - 1] = true;
        }
        console.log(cells[i].pencil);
      
      }
    }
  } else {
    for (let i in cells){
      if (cells[i].selected){
        cells[i].pencil = [];
        cells[i].value = this.value;
      }
    }
  }
  updateBoard();
}


function onCanvasClick(event){
  //mouse coord relative to canvas space, after transformations in css and responsive ui
  var rect = canvas.getBoundingClientRect(), // abs. size of element
  mouseX = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
  mouseY = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
  console.log("x = " + mouseX + " : y = " + mouseY);
  
  //ok, now were gonna find which cell u just clicked in
  for (let i in cells) {
    if (mouseX > cells[i].coordX && mouseX < (cells[i].coordX + cellWidth) && mouseY > cells[i].coordY && mouseY < (cells[i].coordY + cellWidth)){
      selectCell(i);
    }
  }
  updateBoard();
}

//this is ugly code bc its doing the job of four functions. im a programmerrr
function getViewLength(index, isRow, rev) {
  let highestVal = 0;
  let viewLength = 0;
  if (isRow) {
    for (let i in cells){
      if (cells[rev ? cells.length - 1 - i : i].y == index && cells[rev ? cells.length - 1 - i : i].value > highestVal){
        highestVal = cells[rev ? cells.length - 1 - i : i].value;
        viewLength++;
      }
    }
  } else {
    for (let i in cells){
      if (cells[rev ? cells.length - 1 - i : i].x == index && cells[rev ? cells.length - 1 - i : i].value > highestVal){
        highestVal = cells[rev ? cells.length - 1 - i : i].value;
        viewLength++;
      }
    }
    
  }
  return viewLength;
}


function isRowError(row) {
  let distToMax = 0;
  let maxReached = false;
  let error = false;
  let rowFilled = true;
  for (let i in cells){
    if (cells[i].y == row && !maxReached && cells[i].value != size) {
      distToMax++;
    } else if (cells[i].y == row && !maxReached) {
      distToMax++;
      maxReached = true;
    }
    if (cells[i].value == 0){
      rowFilled = false;
    }
  }
  
  if (maxReached && (distToMax < rowHints[row] || getViewLength(row, true, false) > rowHints[row])) {
    error = true;
  }
  
  if (rowFilled && getViewLength(row, true, false) != rowHints[row]){
    error = true;
  }
  
  return error;
}


function isColError(col) {
  let distToMax = 0;
  let maxReached = false;
  let error = false;
  let colFilled = true;
  for (let i in cells){
    if (cells[i].x == col && !maxReached && cells[i].value != size) {
      distToMax++;
    } else if (cells[i].x == col && !maxReached) {
      distToMax++;
      maxReached = true;
    }
    if (cells[i].value == 0){
      colFilled = false;
    }
  }
  
  if (maxReached && (distToMax < colHints[col] || getViewLength(col, false, false) > colHints[col])) {
    error = true;
  }
  
  if (colFilled && getViewLength(col, false, false) != colHints[col]){
    error = true;
  }
  
  return error;
}



function isRevRowError(row) {
  let distToMax = 0;
  let maxReached = false;
  let error = false;
  let rowFilled = true;
  for (let i in cells){
    let j = cells.length - 1 - i;
    if (cells[j].y == row && !maxReached && cells[j].value != size) {
      distToMax++;
    } else if (cells[j].y == row && !maxReached) {
      distToMax++;
      maxReached = true;
    }
    if (cells[j].value == 0){
      rowFilled = false;
    }
  }
  
  if (maxReached && (distToMax < revRowHints[row] || getViewLength(row, true, true) > revRowHints[row])) {
    error = true;
  }
  
  if (rowFilled && getViewLength(row, true, true) != revRowHints[row]){
    error = true;
  }
  
  return error;
}


function isRevColError(col) {
  let distToMax = 0;
  let maxReached = false;
  let error = false;
  let colFilled = true;
  for (let i in cells){
    let j = cells.length - 1 - i;
    if (cells[j].x == col && !maxReached && cells[j].value != size) {
      distToMax++;
    } else if (cells[j].x == col && !maxReached) {
      distToMax++;
      maxReached = true;
    }
    if (cells[j].value == 0){
      colFilled = false;
    }
  }
  
  if (maxReached && (distToMax < revColHints[col] || getViewLength(col, false, true) > revColHints[col])) {
    error = true;
  }
  
  if (colFilled && getViewLength(col, false, true) != revColHints[col]){
    error = true;
  }
  
  return error;
}


function isDuplicate(index) {
  let dup = false;
  for (i in cells){
    if (i != index && (cells[i].y == cells[index].y || cells[i].x == cells[index].x)){
      if (cells[i].value == cells[index].value) {
        dup = true;
      }
    }
  }
  return dup;
}


function setupBoard(){
  
  cells = [];
  rowHints = [];
  colHints = [];
  revColHints = [];
  revRowHints = [];
  
  size = sizeSelector.value;
  cellWidth = 600 / size;
  
  while (controls.firstChild) {
    controls.removeChild(controls.lastChild);
    console.log(controls.children.length);
  }
  
  for (let i = 0; i < size; i++){
    //create buttons
    let button = document.createElement("button");
    controls.append(button);
    button.setAttribute("id", "btn" + (i + 1));
    button.setAttribute("value", i + 1);
    button.innerText = i + 1;
    button.addEventListener("click", onNumberButton, false);
    
    //create cells
    for (let j = 0; j < size; j++){
      cells[(i * size) + j] = new Cell(i, j);
      for (let k = 0; k < size; k++){
        cells[(i * size) + j].pencil[k] = false;
      }
    }
  
  }
  //clear button
  let clear = document.createElement("button");
  controls.append(clear);
  clear.setAttribute("id", "btnClear");
  clear.setAttribute("value", "");
  clear.innerText = "clear";
  clear.addEventListener("click", onNumberButton, false);
  
  let die = 0;
  do {
    //clear out the board
    die = 0;
    for (let i in cells){
      cells[i].value = 0;
    }
    for (let i in cells) {
      //list values in row and column
      //then pick an unallocated number
      //i uh, think that does it
      let rowValues = [];
      for (let j in cells) {
        if (cells[j].x == cells[i].x && cells[j].value) {
          rowValues.push(cells[j].value);
        }
      }
      
      let colValues = [];
      for (let j in cells) {
        if (cells[j].y == cells[i].y && cells[j].value) {
        colValues.push(cells[j].value);
      }
    }
  
    //getRandomInt, check agst row and col, repeat if it shows up
    do {
      cells[i].value = getRandomInt(size) + 1;
      die++;
    } while (colValues.includes(cells[i].value) || rowValues.includes(cells[i].value) && die < 1000); //be able to cancel out of the loop if u get stuck
    }
  } while (die > 900); // if u got stuck start over
  
  //ok, holy shit, generating the hints are next, how do we do this
  for (let i = 0; i < size; i++){
    rowHints[i] = getViewLength(i, true, false);
  }
  
  for (let i = 0; i < size; i++){
    colHints[i] = getViewLength(i, false, false);
  }
  
  for (let i = 0; i < size; i++){
    revRowHints[i] = getViewLength(i, true, true);
  }
  
  for (let i = 0; i < size; i++){
    revColHints[i] = getViewLength(i, false, true);
  }
  
  //having generated the hints we can save the results and clear the board
  for (let i in cells){
    cells[i].trueValue = cells[i].value;
    cells[i].value = 0;
  }
  updateBoard();
}


function updateBoard() {
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  //find the top left of the grid
  topleft = (canvas.width / 2) - ((size * cellWidth) / 2);
  
  for (let i in cells) {
    //find the top left of the cell
    cells[i].coordX = topleft + (cells[i].x * cellWidth);
    cells[i].coordY = topleft + (cells[i].y * cellWidth);
    
    ctx.strokeRect(cells[i].coordX, cells[i].coordY, cellWidth, cellWidth);
    
    if (cells[i].selected) {
      ctx.fillStyle = "lightgray";
      if (pencilMode){
        ctx.beginPath();
        ctx.moveTo(cells[i].coordX, cells[i].coordY);
        ctx.lineTo(cells[i].coordX + (cellWidth / 2), cells[i].coordY);
        ctx.lineTo(cells[i].coordX, cells[i].coordY + (cellWidth / 2));
        ctx.fill();
      } else {
        ctx.fillRect(cells[i].coordX, cells[i].coordY, cellWidth, cellWidth);
      }
    }
    
    if (cells[i].value) {
      ctx.font = "50px sans";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black";
      if (isDuplicate(i)) {
        ctx.fillStyle = "red";
      }
      ctx.fillText(cells[i].value, cells[i].coordX + (cellWidth / 2), cells[i].coordY + (cellWidth / 2));
    } else {
      let pencilList = [];
      for (let j in cells[i].pencil) {
        if (cells[i].pencil[j]) {
          x = parseInt(j) + 1;
          pencilList.push(x);
        }
      }
      ctx.fillStyle = "#aaf";
      ctx.font = "30pt sans";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(pencilList, cells[i].coordX + 2, cells[i].coordY + 2);
    }
    
  }
  
  //draw hints
  for (let i in rowHints){
    ctx.font = "50px sans";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    //error checking and flagging
    if (isRowError(i)){
      ctx.fillStyle = "red";
    }
    ctx.fillText(rowHints[i], topleft - (cellWidth / 2), topleft + (i * cellWidth) + (cellWidth / 2));
  }
  for (let i in colHints){
    ctx.font = "50px sans";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    if (isColError(i)){
      ctx.fillStyle = "red";
    }
    ctx.fillText(colHints[i], topleft + (i * cellWidth) + (cellWidth / 2), topleft - (cellWidth / 2));
  }
  for (let i in revRowHints){
    ctx.font = "50px sans";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    //error checking and flagging
    if (isRevRowError(i)){
      ctx.fillStyle = "red";
    }
    ctx.fillText(revRowHints[i], topleft + (cellWidth * size) + (cellWidth / 2), topleft + (i * cellWidth) + (cellWidth / 2));
  }
  for (let i in revColHints){
    ctx.font = "50px sans";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    if (isRevColError(i)){
      ctx.fillStyle = "red";
    }
    ctx.fillText(revColHints[i], topleft + (i * cellWidth) + (cellWidth / 2), topleft +  (cellWidth / 2) + (size * cellWidth));
  }
}

setupBoard();
