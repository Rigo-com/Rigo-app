import * as RIGO
from "./index.js";

const results = {};

try{
  results.UI_bootstrap =
  await RIGO.UI.bootstrapUi();
}catch(error){
  results.UI_bootstrap =
  error.message;
}

try{
  results.UI_render =
  await RIGO.UI.render();
}catch(error){
  results.UI_render =
  error.message;
}

try{
  results.Runtime_bootstrap =
  await RIGO.UiRuntime.bootstrapUi();
}catch(error){
  results.Runtime_bootstrap =
  error.message;
}

document.body.innerHTML =
`<pre>${
JSON.stringify(
  results,
  null,
  2
)
}</pre>`;
