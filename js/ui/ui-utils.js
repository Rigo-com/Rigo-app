// =====================================
// RIGO AI
// UI UTILS
// UI HELPER UTILITIES
// =====================================



// =====================================
// DOM HELPERS
// =====================================

function getElement(
  selector
){

  return document
  .querySelector(
    selector
  );

}



function getElements(
  selector
){

  return Array.from(

    document
    .querySelectorAll(
      selector
    )

  );

}



// =====================================
// CLASS HELPERS
// =====================================

function addClass(
  element,
  className
){

  if(
    !element
  ){
    return false;
  }

  element.classList
  .add(
    className
  );

  return true;

}



function removeClass(
  element,
  className
){

  if(
    !element
  ){
    return false;
  }

  element.classList
  .remove(
    className
  );

  return true;

}



function toggleClass(
  element,
  className,
  force
){

  if(
    !element
  ){
    return false;
  }

  element.classList
  .toggle(
    className,
    force
  );

  return true;

}



// =====================================
// VISIBILITY
// =====================================

function showElement(
  element
){

  if(
    !element
  ){
    return false;
  }

  element.hidden =
  false;

  return true;

}



function hideElement(
  element
){

  if(
    !element
  ){
    return false;
  }

  element.hidden =
  true;

  return true;

}



// =====================================
// CONTENT
// =====================================

function setText(
  element,
  value = ""
){

  if(
    !element
  ){
    return false;
  }

  element.textContent =
  String(value);

  return true;

}



function setHtml(
  element,
  value = ""
){

  if(
    !element
  ){
    return false;
  }

  element.innerHTML =
  String(value);

  return true;

}



// =====================================
// EVENTS
// =====================================

function safeEventListener(

  element,

  event,

  handler,

  options

){

  if(
    !element
  ){

    return null;

  }

  element
  .addEventListener(

    event,

    handler,

    options

  );

  return () => {

    element
    .removeEventListener(

      event,

      handler,

      options

    );

  };

}



// =====================================
// TIMING
// =====================================

function nextFrame(){

  return new Promise(

    resolve =>

    requestAnimationFrame(
      resolve
    )

  );

}



function delay(
  ms = 0
){

  return new Promise(

    resolve =>

    setTimeout(
      resolve,
      ms
    )

  );

}



// =====================================
// DEVICE
// =====================================

function isMobileDevice(){

  return window
  .matchMedia(
    "(max-width: 768px)"
  )
  .matches;

}



// =====================================
// PUBLIC API
// =====================================

const UiUtils =
Object.freeze({

  getElement,
  getElements,

  addClass,
  removeClass,
  toggleClass,

  showElement,
  hideElement,

  setText,
  setHtml,

  safeEventListener,

  nextFrame,
  delay,

  isMobileDevice

});



// =====================================
// EXPORTS
// =====================================

export {

  getElement,
  getElements,

  addClass,
  removeClass,
  toggleClass,

  showElement,
  hideElement,

  setText,
  setHtml,

  safeEventListener,

  nextFrame,
  delay,

  isMobileDevice,

  UiUtils

};

export default
UiUtils;
