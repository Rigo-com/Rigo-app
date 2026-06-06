import runModuleScanner
from "./debug/module-scanner.js";

const results =
await runModuleScanner();

document.body.innerHTML = `
<pre>
${JSON.stringify(
  results,
  null,
  2
)}
</pre>
`;
