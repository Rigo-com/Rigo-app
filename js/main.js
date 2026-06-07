import * as RIGO from "./index.js";

const result = {};

try{
  result.root =
    RIGO.ChatElements?.getRootElement?.() || null;

  result.messages =
    RIGO.ChatElements?.getMessagesElement?.() || null;

  result.input =
    RIGO.ChatElements?.getInputElement?.() || null;

  result.sendButton =
    RIGO.ChatElements?.getSendButtonElement?.() || null;

}catch(error){
  result.error = error.message;
}

document.body.innerHTML =
`<pre>${JSON.stringify(result,null,2)}</pre>`;
