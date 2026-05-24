// =====================================
// RIGO AI
// CHAT RENDERER
// ENTERPRISE CHAT RENDER SYSTEM
// =====================================



// =====================================
// SHOW TYPING
// =====================================

function showTypingIndicator(){

  if(!chatContainer){

    return false;

  }

  if(!typingIndicatorElement){

    typingIndicatorElement =
    createTypingIndicatorElement?.();

  }

  if(!typingIndicatorElement){

    return false;

  }

  removeTypingIndicator?.(
    false
  );

  typingIndicatorElement
  .textContent =

    typeof isRTLLayout ===
    "function"

    &&

    isRTLLayout()

    ?

    "RIGO AI يكتب..."

    :

    "RIGO AI is typing...";

  if(

    !typingIndicatorElement
    .isConnected

  ){

    chatContainer.appendChild(
      typingIndicatorElement
    );

  }

  scrollToBottom?.();

  return true;

}
