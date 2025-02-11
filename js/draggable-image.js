Element.prototype.draggableImage = function() {
  const element = this;

  /* Element initialization */
  const init = () => {
    const style = document.createElement('style');
    style.textContent = `body{touch-action:none}body.grabbing,body.grabbing *{cursor:grabbing !important}`;
    document.head.append(style);
  }

  /* Functions */
  const setDragCursor = (bool) => {
    document.body.classList.toggle('grabbing', bool);
  }
  const getNegativeNumbersOnly = (sum) => sum > 0 ? 0 : sum;
  const getDragDistance = (event) => {
    const { clientX, clientY } = event;

    const startX = parseInt(element.dataset.dragStartX) || 0;
    const startY = parseInt(element.dataset.dragStartY) || 0;
    const x = clientX - startX;
    const y = clientY - startY;

    return { x, y };
  }
  const setCursorAndTriggerMove = (event) => {
    event.stopPropagation();
    event.preventDefault();

    setDragCursor(true);
    moveDrag(event);
  }
  const stopDragAndResetEventRedirect = (event) => {
    stopDrag(event);
    resetRedirectedEvents(event);
  }
  const startDrag = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const { clientX, clientY } = event

    element.dataset.dragStartX = clientX.toString()
    element.dataset.dragStartY = clientY.toString()
    element.dataset.dragging = 'true';
    setDragCursor(true);

    // fix bug with extra bottom margin being added
    element.style.height = element.firstElementChild.clientHeight + 'px';
  }
  const moveDrag = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (element.dataset.dragging !== 'true') return;

    const prevX = parseInt(element.dataset.positionX) || 0
    const prevY = parseInt(element.dataset.positionY) || 0
    const { x, y } = getDragDistance(event);
    const delta = {
      x: prevX + x,
      y: y + prevY
    }

    const container = element.parentNode;
    // set bounds in negative to allow for positioning
    const maxBounds = {
      x: getNegativeNumbersOnly(container.clientWidth - element.clientWidth),
      y: getNegativeNumbersOnly(container.clientHeight - element.clientHeight)
    }

    // if any of the values of delta are out of bounds, set them to within bounds
    for (const key in delta) {
      if (delta[key] > 0) {
        delta[key] = 0;
        element.dataset[`position${key.toUpperCase()}`] = "0";
      } else if (delta[key] <= maxBounds[key]) {
        delta[key] = maxBounds[key];
        element.dataset[`position${key.toUpperCase()}`] = maxBounds[key];
      }
    }

    element.style.transform = `translate(${delta.x}px, ${delta.y}px)`

  }
  const dragOut = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (element.dataset.dragging !== 'true') return;

    window.addEventListener('pointermove', setCursorAndTriggerMove);
    window.addEventListener('pointerup', stopDragAndResetEventRedirect);
  }
  const stopDrag = (event) => {
    event.stopPropagation();
    event.preventDefault();
    window.removeEventListener('pointermove', setCursorAndTriggerMove);
    if (element.dataset.dragging !== 'true') return;

    const { x, y} = getDragDistance(event);
    const prevX = parseInt(element.dataset.positionX) || 0
    const prevY = parseInt(element.dataset.positionY) || 0
    element.dataset.positionX = prevX + x;
    element.dataset.positionY = prevY + y;

    element.dataset.dragging = 'false';
    setDragCursor(false);
  }
  const resetRedirectedEvents = (event) => {
    if (element.dataset.dragging !== 'true') return;
    event.stopPropagation();
    event.preventDefault();

    setDragCursor(false);
    window.removeEventListener('pointermove', setCursorAndTriggerMove);
    window.removeEventListener('pointerup', stopDragAndResetEventRedirect);
  }

  /* Events */
  element.onpointerdown = startDrag;
  element.onpointermove = moveDrag;
  element.onpointerout = dragOut;
  element.onpointerup = stopDrag;
  element.onpointerover = resetRedirectedEvents;

  init();
}
