const hs = JSON.parse(sentences);
var currentLineSentences = [];
var currentLineIndex = 0;

function roll(){ 
  var current = document.getElementById('current');
  //bad code ahead
  if (currentLineIndex < 50){
    if (currentLineIndex + 1 == currentLineSentences.length || current.innerHTML == '~~~~~'){
      var newSentence = Object.values(hs[Math.floor(Math.random() * hs.length)])[0];
      currentLineSentences.push(newSentence);
      current.innerHTML = newSentence;
      currentLineIndex = currentLineSentences.length - 1;
    } else {
      currentLineIndex++;
      current.innerHTML = currentLineSentences[currentLineIndex];
    }
  }
}

function unroll(){
  if(currentLineIndex > 0){
    currentLineIndex--;
    current.innerHTML = currentLineSentences[currentLineIndex]; 
  }
}
function add(){ 
  var current = document.getElementById('current');
  if(current.innerHTML!="~~~~~"){
    current.id = '';
    current.insertAdjacentHTML('afterend', '<li id="current">~~~~~</li>');
  }
  currentLineIndex = 0;
  currentLineSentences = [];
}
function clearer(){ 
  var list = document.getElementById('list');
  list.innerHTML = '<li id="current">~~~~~</li>';
  currentLineIndex = 0;
  currentLineSentences = [];
}

//begin chatgpt code
document.addEventListener('DOMContentLoaded', (event) => {
  const list = document.getElementById('list');

  let draggedItem = null;
  let touchStartY = 0;
  let dragging = false;
  let mouseStartY = 0;

  function handleDragStart(e) {
    draggedItem = e.target;
    if (draggedItem.id == "current") {
      draggedItem = null;
    }
    e.target.style.opacity = 0.5;
  }

  function handleDragEnd(e) {
    e.target.style.opacity = '';
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    if (e.target.tagName === 'LI' && e.target !== draggedItem) {
      const items = Array.from(list.querySelectorAll('li'));
      const index1 = items.indexOf(draggedItem);
      const index2 = items.indexOf(e.target);
      if (index1 < index2 && e.target.id != "current") {
        e.target.insertAdjacentElement('afterend', draggedItem);
      } else {
        e.target.insertAdjacentElement('beforebegin', draggedItem);
      }
    }
  }

  function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    draggedItem = e.target;
    dragging = true;
    if (draggedItem.id == "current" || draggedItem.tagName != 'LI') {
      draggedItem = null;
      dragging = false;
    }
  }

  function handleTouchMove(e) {
    if (dragging && draggedItem) {
      const touchY = e.touches[0].clientY;
      const diffY = touchY - touchStartY;
      draggedItem.style.transform = `translateY(${diffY}px)`;
    }
  }

  function handleTouchEnd(e) {
    if (dragging && draggedItem) {
      draggedItem.style.transform = '';
      dragging = false;
      const touchEndY = e.changedTouches[0].clientY;
      const target = document.elementFromPoint(e.changedTouches[0].clientX, touchEndY);
      if (target && target.tagName === 'LI' && target !== draggedItem) {
        const items = Array.from(list.querySelectorAll('li'));
        const index1 = items.indexOf(draggedItem);
        const index2 = items.indexOf(target);
        if (index1 < index2 && target.id != "current") {
          target.insertAdjacentElement('afterend', draggedItem);
        } else {
          target.insertAdjacentElement('beforebegin', draggedItem);
        }
      }
      draggedItem = null;
    }
  }

  function handleMouseDown(e) {
    mouseStartY = e.clientY;
    draggedItem = e.target;
    dragging = true;
    if (draggedItem.id == "current" || draggedItem.tagName != 'LI') {
      draggedItem = null;
      dragging = false;
    }
  }

  function handleMouseMove(e) {
    if (dragging && draggedItem) {
      const mouseY = e.clientY;
      const diffY = mouseY - mouseStartY;
      draggedItem.style.transform = `translateY(${diffY}px)`;
    }
  }

  function handleMouseUp(e) {
    if (dragging && draggedItem) {
      draggedItem.style.transform = '';
      dragging = false;
      const mouseEndY = e.clientY;
      const target = document.elementFromPoint(e.clientX, mouseEndY);
      if (target && target.tagName === 'LI' && target !== draggedItem) {
        const items = Array.from(list.querySelectorAll('li'));
        const index1 = items.indexOf(draggedItem);
        const index2 = items.indexOf(target);
        if (index1 < index2 && target.id != "current") {
          target.insertAdjacentElement('afterend', draggedItem);
        } else {
          target.insertAdjacentElement('beforebegin', draggedItem);
        }
      }
      draggedItem = null;
    }
  }

  list.addEventListener('dragstart', handleDragStart);
  list.addEventListener('dragend', handleDragEnd);
  list.addEventListener('dragover', handleDragOver);
  list.addEventListener('drop', handleDrop);

  list.addEventListener('touchstart', handleTouchStart, { passive: true });
  list.addEventListener('touchmove', handleTouchMove, { passive: false });
  list.addEventListener('touchend', handleTouchEnd);

  list.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
});

/*
document.addEventListener('DOMContentLoaded', (event) => {
  const list = document.getElementById('list');

  let draggedItem = null;
  let touchStartY = 0;
  let dragging = false;

  function handleDragStart(e) {
    draggedItem = e.target;
    if(draggedItem.id == "current"){
      //i did this conditional
      draggedItem = null;
    }
    e.target.style.opacity = 0.5;
  }

  function handleDragEnd(e) {
    e.target.style.opacity = '';
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    if (e.target.tagName === 'LI' && e.target !== draggedItem) {
      const items = Array.from(list.querySelectorAll('li'));
      const index1 = items.indexOf(draggedItem);
      const index2 = items.indexOf(e.target);
      if (index1 < index2 && target.id != "current") {
        e.target.insertAdjacentElement('afterend', draggedItem);
      } else {
        e.target.insertAdjacentElement('beforebegin', draggedItem);
      }
    }
  }

  function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    draggedItem = e.target;
    dragging = true;
    if(draggedItem.id == "current"){
      draggedItem = null;
      dragging = false;
    }
  }

  function handleTouchMove(e) {
    if (dragging && draggedItem) {
      const touchY = e.touches[0].clientY;
      const diffY = touchY - touchStartY;
      draggedItem.style.transform = `translateY(${diffY}px)`;
    }
  }

  function handleTouchEnd(e) {
    if (dragging && draggedItem) {
      draggedItem.style.transform = '';
      dragging = false;
      const touchEndY = e.changedTouches[0].clientY;
      const target = document.elementFromPoint(e.changedTouches[0].clientX, touchEndY);
      if (target && target.tagName === 'LI' && target !== draggedItem) {
        const items = Array.from(list.querySelectorAll('li'));
        const index1 = items.indexOf(draggedItem);
        const index2 = items.indexOf(target);
        if (index1 < index2 && target.id != "current") {
          target.insertAdjacentElement('afterend', draggedItem);
        } else {
          target.insertAdjacentElement('beforebegin', draggedItem);
        }
      }
      draggedItem = null;
    }
  }

  list.addEventListener('dragstart', handleDragStart);
  list.addEventListener('dragend', handleDragEnd);
  list.addEventListener('dragover', handleDragOver);
  list.addEventListener('drop', handleDrop);

  list.addEventListener('touchstart', handleTouchStart, { passive: true });
  list.addEventListener('touchmove', handleTouchMove, { passive: false });
  list.addEventListener('touchend', handleTouchEnd);
});
*/