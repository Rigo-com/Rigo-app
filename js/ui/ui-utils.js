// =====================================
// RIGO AI
// UI UTILS
// ENTERPRISE UI UTILITIES
// =====================================



// =====================================
// SAFE ELEMENT
// =====================================

function isValidElement(
  element
){

  return (

    element instanceof
    Element

    ||

    element instanceof
    HTMLElement

  );

}



// =====================================
// SAFE NODE
// =====================================

function isValidNode(
  node
){

  return (
    node instanceof Node
  );

}



// =====================================
// SAFE DOCUMENT
// =====================================

function isDOMAvailable(){

  return (

    typeof window !==
    "undefined"

    &&

    typeof document !==
    "undefined"

  );

}



// =====================================
// SAFE QUERY
// =====================================

function safeQuerySelector(
  selector,
  parent = document
){

  if(
    !isDOMAvailable()
  ){

    return null;

  }

  if(
    typeof selector !==
    "string"
  ){

    return null;

  }

  try{

    return parent
    ?.querySelector(
      selector
    )

    ||

    null;

  }

  catch(error){

    safeLogError(
      "QUERY SELECTOR ERROR",
      error
    );

    return null;

  }

}



// =====================================
// SAFE QUERY ALL
// =====================================

function safeQuerySelectorAll(
  selector,
  parent = document
){

  if(
    !isDOMAvailable()
  ){

    return [];
  }

  if(
    typeof selector !==
    "string"
  ){

    return [];
  }

  try{

    return [

      ...parent
      ?.querySelectorAll(
        selector
      )

    ];

  }

  catch(error){

    safeLogError(
      "QUERY SELECTOR ALL ERROR",
      error
    );

    return [];

  }

}



// =====================================
// SAFE CREATE ELEMENT
// =====================================

function safeCreateElement(
  tagName,
  classNames = []
){

  if(
    !isDOMAvailable()
  ){

    return null;

  }

  if(
    typeof tagName !==
    "string"
  ){

    return null;

  }

  try{

    const element =
    document.createElement(
      tagName
    );

    if(
      Array.isArray(
        classNames
      )
    ){

      classNames
      .filter(Boolean)
      .forEach((className) => {

        element.classList.add(
          String(className)
        );

      });

    }

    return element;

  }

  catch(error){

    safeLogError(
      "CREATE ELEMENT ERROR",
      error
    );

    return null;

  }

}



// =====================================
// SAFE REMOVE ELEMENT
// =====================================

function safeRemoveElement(
  element
){

  if(
    !isValidNode(
      element
    )
  ){

    return false;

  }

  try{

    element.remove();

    return true;

  }

  catch(error){

    safeLogError(
      "REMOVE ELEMENT ERROR",
      error
    );

    return false;

  }

}



// =====================================
// SAFE TEXT
// =====================================

function safeSetText(
  element,
  text
){

  if(
    !isValidElement(
      element
    )
  ){

    return false;

  }

  try{

    element.textContent =
    String(text ?? "");

    return true;

  }

  catch(error){

    safeLogError(
      "SET TEXT ERROR",
      error
    );

    return false;

  }

}



// =====================================
// SAFE HTML
// =====================================

function safeSetHTML(
  element,
  html
){

  if(
    !isValidElement(
      element
    )
  ){

    return false;

  }

  try{

    element.innerHTML =
    sanitizeHTML(
      String(html ?? "")
    );

    return true;

  }

  catch(error){

    safeLogError(
      "SET HTML ERROR",
      error
    );

    return false;

  }

}



// =====================================
// SAFE CLASS TOGGLE
// =====================================

function safeToggleClass(
  element,
  className,
  force
){

  if(
    !isValidElement(
      element
    )
  ){

    return false;

  }

  try{

    element.classList.toggle(
      String(className),
      force
    );

    return true;

  }

  catch(error){

    safeLogError(
      "TOGGLE CLASS ERROR",
      error
    );

    return false;

  }

}



// =====================================
// SAFE LOCAL STORAGE GET
// =====================================

function safeLocalStorageGet(
  key
){

  try{

    return localStorage
    .getItem(
      key
    );

  }

  catch(error){

    safeLogError(

      "LOCAL STORAGE GET ERROR",

      error

    );

    return null;

  }

}



// =====================================
// SAFE LOCAL STORAGE SET
// =====================================

function safeLocalStorageSet(
  key,
  value
){

  try{

    localStorage.setItem(
      key,
      value
    );

    return true;

  }

  catch(error){

    safeLogError(

      "LOCAL STORAGE SET ERROR",

      error

    );

    return false;

  }

}
