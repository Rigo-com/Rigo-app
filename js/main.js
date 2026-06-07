import * as RIGO
from "./index.js";

document.body.innerHTML = "";

const pre =
document.createElement("pre");

pre.textContent =
JSON.stringify({

  appById:
  document.getElementById("app"),

  rootById:
  document.getElementById("root"),

  appQuery:
  document.querySelector("#app"),

  rootQuery:
  document.querySelector("#root"),

  bodyChildren:
  document.body.children.length

}, null, 2);

document.body.appendChild(pre);
