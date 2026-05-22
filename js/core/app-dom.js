// =====================================
// DOM INITIALIZATION
// =====================================

function initializeDOMElements(){

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }

  messageInput =
  document.getElementById(
    "messageInput"
  );

  sendButton =
  document.getElementById(
    "sendButton"
  );

  chatContainer =
  document.getElementById(
    "chatContainer"
  );

  return (

    Boolean(messageInput) &&

    Boolean(sendButton) &&

    Boolean(chatContainer)

  );

}
