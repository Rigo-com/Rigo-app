import * as RIGO from "./index.js";

document.body.innerHTML = "";

const targets = [
  "app",
  "appRoot",
  "chatContainer",
  "messagesContainer",
  "messageInput",
  "sendButton"
];

const pre =
document.createElement("pre");

pre.textContent =
JSON.stringify(
{
  exports:Object.keys(RIGO),
  targets
},
null,
2
);

document.body.appendChild(pre);
