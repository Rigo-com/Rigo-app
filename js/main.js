// =====================================
// RIGO AI
// ROOT SYSTEM SCANNER
// =====================================

import * as RIGO
from "./index.js";



// =====================================
// UI HELPERS
// =====================================

document.body.innerHTML = "";



function printBlock(
  title,
  data
){

  const block =
  document.createElement(
    "pre"
  );

  block.style.padding =
  "12px";

  block.style.margin =
  "12px";

  block.style.border =
  "1px solid #444";

  block.style.whiteSpace =
  "pre-wrap";

  block.style.fontSize =
  "12px";

  block.textContent =

    `[${title}]`

    +

    "\n\n"

    +

    (
      typeof data ===
      "string"

      ? data

      : JSON.stringify(
          data,
          null,
          2
        )
    );

  document.body
  .appendChild(
    block
  );

}



// =====================================
// START
// =====================================

printBlock(
  "RIGO SCANNER",
  "STARTED"
);



// =====================================
// ROOT EXPORTS
// =====================================

const rootExports =

  Object.keys(
    RIGO
  );

printBlock(
  "ROOT EXPORTS",
  rootExports
);



// =====================================
// MODULE INSPECTION
// =====================================

for(
  const moduleName
  of rootExports
){

  try{

    const module =
    RIGO[moduleName];

    const report =
    {

      exists:
      Boolean(
        module
      ),

      type:
      typeof module,

      keys:
      []

    };



    if(

      module &&

      (
        typeof module ===
        "object"

        ||

        typeof module ===
        "function"
      )

    ){

      try{

        report.keys =

          Object.keys(
            module
          );

      }

      catch(error){

        report.keys = [
          "KEY_SCAN_FAILED"
        ];

      }

    }



    printBlock(
      moduleName,
      report
    );

  }

  catch(error){

    printBlock(

      `${moduleName} ERROR`,

      {

        message:
        error?.message,

        stack:
        error?.stack

      }

    );

  }

}



// =====================================
// DOM SCAN
// =====================================

const domElements =

  [
    ...document
    .querySelectorAll("*")
  ]

  .map(

    element => ({

      tag:
      element.tagName,

      id:
      element.id || null,

      className:
      element.className || null

    })

  );



printBlock(
  "DOM ELEMENTS",
  domElements
);



// =====================================
// COMMON SELECTORS
// =====================================

const selectors =
[
  "#app",
  "#messageInput",
  "#sendBtn",
  "#chatContainer",

  ".app",
  ".chat-container",
  ".chat-message",
  ".sidebar",

  "input",
  "textarea",
  "button"
];



const selectorResults =
{};



for(
  const selector
  of selectors
){

  selectorResults[
    selector
  ] =

  Boolean(

    document
    .querySelector(
      selector
    )

  );

}



printBlock(
  "SELECTOR CHECK",
  selectorResults
);



// =====================================
// FINISHED
// =====================================

printBlock(
  "SCAN COMPLETE",
  {

    exports:
    rootExports.length,

    domElements:
    document
    .querySelectorAll("*")
    .length

  }
);
