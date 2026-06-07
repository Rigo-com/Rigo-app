// =====================================
// RIGO UI RECOVERY SCAN
// =====================================

function findUi(){

  const selectors = [

    "#app",
    "#root",
    "#chat",
    "#chat-app",
    "#rigo",
    ".app",
    ".root",
    ".chat-container"

  ];

  for(
    const selector
    of selectors
  ){

    const element =
    document.querySelector(
      selector
    );

    if(
      element
    ){

      return {

        found:true,

        selector

      };

    }

  }

  return {

    found:false

  };

}



// =====================================
// SCAN
// =====================================

const result =
findUi();



// =====================================
// BUILD FALLBACK UI
// =====================================

if(
  !result.found
){

  document.body.innerHTML =
  `
  <div
    id="rigo-recovery"
    style="
      padding:20px;
      font-size:20px;
      font-family:sans-serif;
    "
  >

    <h1>
      RIGO UI RECOVERY
    </h1>

    <p>
      No UI root found.
    </p>

    <div id="messages"></div>

    <input
      id="messageInput"
      placeholder="Type..."
    />

    <button id="sendButton">
      Send
    </button>

  </div>
  `;

}
else{

  document.body.innerHTML =
  `
  <pre>
${JSON.stringify(
  result,
  null,
  2
)}
  </pre>
  `;

}
