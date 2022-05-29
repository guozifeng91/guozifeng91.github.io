// convert text to HTML
// code taken from https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}


function wheelElement(elmnt, func=null){
  var pos0 = 0, pos1=0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onwheel = dragWheel;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onwheel = dragWheel;
  }

  function dragWheel(e) {
    e = e || window.event;
    e.preventDefault();
    // set the element's new position:
    elmnt.style.top = "max(-" + (elmnt.offsetHeight-elmnt.parentElement.offsetHeight) + "px ,min(0%," + (elmnt.offsetTop - e.deltaY) + "px))";

    if (func!=null){
      func();
    }
  }
}

function touchElement(elmnt, func=null){
  var pos0 = 0, pos1=0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").addEventListener("touchstart",touchStart,{passive: false });
    document.getElementById(elmnt.id + "header").addEventListener("touchmove",touchMove,{passive: false });
    // document.getElementById(elmnt.id + "header").addEventListener("touchend",touchEnd,false);
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.addEventListener("touchstart",touchStart,{ passive: false });
    elmnt.addEventListener("touchmove",touchMove,{ passive: false });
    // elmnt.addEventListener("touchend",touchEnd,false);
  }

  function touchStart(e){
    e = e || window.event;
    // e.preventDefault();
    if (e.touhes.length==1){
      pos1=e["touches"][0].screenY;
    }
  }

  function touchMove(e) {
    e = e || window.event;
    if (e.touhes.length==1){
      e.preventDefault();

      pos0=pos1-e["touches"][0].screenY;
      pos1=e["touches"][0].screenY;
      // set the element's new position:
      elmnt.style.top = "max(-" + (elmnt.offsetHeight-elmnt.parentElement.offsetHeight) + "px ,min(0%," + (elmnt.offsetTop - pos0) + "px))";

      if (func!=null){
        func();
      }
    }
  }
}

function dragElementY(elmnt, max_y="100%", func=null) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos2 = pos4 - e.clientY;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = "max(0%, min("+max_y+"," + (elmnt.offsetTop - pos2) + "px))";
    if (func!=null){
      func();
    }
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// make the window dragable
// this part of code is from
// https://www.w3schools.com/howto/howto_js_draggable.asp
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = "max(0%, min(90%," + (elmnt.offsetTop - pos2) + "px))";
    elmnt.style.left = "max(0%, min(99%," + (elmnt.offsetLeft - pos1) + "px))";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
