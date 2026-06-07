import * as RIGO
from "./index.js";

document.body.innerHTML = "";

const pre =
document.createElement("pre");

pre.textContent =
JSON.stringify({

  hasUiState:
  !!RIGO.uiState,

  hasUiElements:
  !!RIGO.UiElements,

  app:
  RIGO.UiElements?.getApp?.(),

  input:
  RIGO.UiElements?.getInput?.(),

  messages:
  RIGO.UiElements?.getMessagesContainer?.(),

  validation:
  RIGO.UiElements?.validateElements?.()

}, null, 2);

document.body.appendChild(pre);
