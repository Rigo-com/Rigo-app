import * as RIGO
from "./index.js";

const pre =
document.createElement("pre");

pre.textContent =
JSON.stringify({

  bodyChildren:
  document.body.children.length,

  bodyHtmlLength:
  document.body.innerHTML.length,

  first200:
  document.body.innerHTML
  .slice(0,200)

}, null, 2);

document.body.appendChild(pre);
