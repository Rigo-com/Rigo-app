import * as RIGO from "./index.js";

console.log("UI", RIGO.UI);
console.log("UiRuntime", RIGO.UiRuntime);

await RIGO.UiRuntime?.initializeUi?.();

await RIGO.UiRuntime?.render?.();

document.body.innerHTML +=
"<h1>UI CALLED</h1>";
