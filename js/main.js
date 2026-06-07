// =====================================
// RIGO AI
// DEBUG MAIN
// =====================================

import Bootstrap
from "./bootstrap/index.js";



function log(
  title,
  value = ""
){

  const block =
  document.createElement(
    "pre"
  );

  block.style.padding =
  "8px";

  block.style.margin =
  "8px";

  block.style.border =
  "1px solid #444";

  block.style.whiteSpace =
  "pre-wrap";

  block.textContent =

    `[${title}]\n\n` +

    (
      typeof value ===
      "string"

      ?

      value

      :

      JSON.stringify(
        value,
        null,
        2
      )
    );

  document.body
  .appendChild(
    block
  );

}



(async() => {

  try{

    log(
      "STEP 1",
      "MAIN STARTED"
    );



    log(
      "STEP 2",
      "BOOTSTRAP IMPORTED"
    );



    log(
      "STEP 3",
      "BOOT STARTING"
    );



    const result =
    await Bootstrap
    .boot();



    log(
      "STEP 4",
      {
        bootResult:
        result
      }
    );



    log(
      "STEP 5",
      {
        bodyChildren:
        document.body
        .children
        .length
      }
    );



    const appRoot =

      document
      .querySelector(
        "#app"
      )

      ||

      document
      .querySelector(
        "[data-app-root]"
      );



    log(
      "STEP 6",
      {
        appRootExists:
        Boolean(
          appRoot
        )
      }
    );



    log(
      "STEP 7",
      {
        bodyHTML:

          document.body
          .innerHTML
          .slice(
            0,
            3000
          )
      }
    );



    if(
      window.Core
    ){

      log(
        "CORE FOUND",
        true
      );

    }



    if(
      window.App
    ){

      log(
        "APP FOUND",
        true
      );

    }
    

    log(
  "DOM CHECK",
  {

    app:
    document.getElementById(
      "app"
    ),

    appRoot:
    document.querySelector(
      "[data-app-root]"
    ),

    messageInput:
    document.getElementById(
      "messageInput"
    ),

    sendBtn:
    document.getElementById(
      "sendBtn"
    ),

    chatContainer:
    document.querySelector(
      ".chat-container"
    )

  }
);
    


    log(
      "FINAL",
      "DEBUG COMPLETE"
    );

  }

  catch(error){

    log(
      "FATAL ERROR",
      {

        message:
        error?.message,

        stack:
        error?.stack

      }
    );

    console.error(
      error
    );

  }

})();
