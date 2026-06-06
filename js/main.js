import runModuleScanner
from "../debug-old/module-scanner.js";

runModuleScanner()
.then(
  results => {

    document.body.innerHTML =

    `<pre>${
      JSON.stringify(
        results,
        null,
        2
      )
    }</pre>`;

  }
);
