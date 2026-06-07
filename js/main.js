import * as RIGO from "./index.js";

const result = {};

try {

  await RIGO.UI.registerUiElements();

  result.root =
    RIGO.ChatElements?.getRootElement?.();

  result.messages =
    RIGO.ChatElements?.getMessagesElement?.();

  result.input =
    RIGO.ChatElements?.getInputElement?.();

  result.sendButton =
    RIGO.ChatElements?.getSendButtonElement?.();

} catch(error){

  result.error = error.message;

}

document.body.innerHTML =
`<pre>${JSON.stringify(result,null,2)}</pre>`;
