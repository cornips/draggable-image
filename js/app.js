const dragHandle = document.getElementById('drag-handle');

setDragCursor = function(bool) {
  document.body.classList.toggle('grabbing', bool);
}
getNegativeNumbersOnly = function(sum) {
  return sum > 0 ? 0 : sum;
}

dragHandle.getDragDistance = function(event) {
  const { clientX, clientY } = event;

  const startX = parseInt(this.dataset.dragStartX) || 0;
  const startY = parseInt(this.dataset.dragStartY) || 0;
  const x = clientX - startX;
  const y = clientY - startY;

  return { x, y };
}


dragHandle.onpointerdown = function(event) {
  event.stopPropagation();
  event.preventDefault();
  const { clientX, clientY } = event

  this.dataset.dragStartX = clientX.toString()
  this.dataset.dragStartY = clientY.toString()
  this.dataset.dragging = 'true';
  setDragCursor(true);

  // fix bug with extra bottom margin being added
  this.style.height = this.firstElementChild.clientHeight + 'px';
}

dragHandle.onpointermove = function(event) {
  event.stopPropagation();
  event.preventDefault();
  if (this.dataset.dragging !== 'true') return;

  const prevX = parseInt(this.dataset.positionX) || 0
  const prevY = parseInt(this.dataset.positionY) || 0
  const { x, y } = this.getDragDistance(event);
  const delta = {
    x: prevX + x,
    y: y + prevY
  }

  const container = this.parentNode;
  // set bounds in negative to allow for positioning
  const maxBounds = {
    x: getNegativeNumbersOnly(container.clientWidth - this.clientWidth),
    y: getNegativeNumbersOnly(container.clientHeight - this.clientHeight)
  }

  // if any of the values of delta are out of bounds, set them to within bounds
  for (const key in delta) {
    if (delta[key] > 0) {
      delta[key] = 0;
      this.dataset[`position${key.toUpperCase()}`] = "0";
    } else if (delta[key] <= maxBounds[key]) {
      delta[key] = maxBounds[key];
      this.dataset[`position${key.toUpperCase()}`] = maxBounds[key];
    }
  }

  dragHandle.style.transform = `translate(${delta.x}px, ${delta.y}px)`
}

dragHandle.onpointerup = function(event) {
  event.stopPropagation();
  event.preventDefault();
  window.removeEventListener('pointermove', redirectWindowPointerMoveToDragHandle);
  if (this.dataset.dragging !== 'true') return;

  const { x, y} = this.getDragDistance(event);
  const prevX = parseInt(this.dataset.positionX) || 0
  const prevY = parseInt(this.dataset.positionY) || 0
  this.dataset.positionX = prevX + x;
  this.dataset.positionY = prevY + y;

  this.dataset.dragging = 'false';
  setDragCursor(false);
}


/*
* When dragging outside of the container, redirect pointer events to window
*/
function redirectWindowPointerMoveToDragHandle(event) {
  event.stopPropagation();
  event.preventDefault();

  setDragCursor(true);

  dragHandle.onpointermove(event);
}
function redirectWindowPointerUpToDragHandle(event) {
  dragHandle.onpointerover(event);
  dragHandle.onpointerup(event);
}

dragHandle.onpointerout = function(event) {
  event.stopPropagation();
  event.preventDefault();
  if (this.dataset.dragging !== 'true') return;

  window.addEventListener('pointermove', redirectWindowPointerMoveToDragHandle);
  window.addEventListener('pointerup', redirectWindowPointerUpToDragHandle);
}

/*
* Reset redirected events when dragging back into the container
*/
dragHandle.onpointerover = function(event) {
  if (this.dataset.dragging !== 'true') return;
  event.stopPropagation();
  event.preventDefault();

  setDragCursor(false);

  window.removeEventListener('pointermove', redirectWindowPointerMoveToDragHandle);
  window.removeEventListener('pointerup', redirectWindowPointerUpToDragHandle);
}

