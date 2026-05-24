// =====================================
// RIGO AI
// CHAT RENDERER
// ENTERPRISE CHAT RENDER SYSTEM
// =====================================



// =====================================
// SHOW TYPING
// =====================================

function showTypingIndicator(){

  const chatContainer =
  ChatElements.getContainer();

  if(!chatContainer){

    return false;

  }

  let typingIndicator =

    ChatElements
    .getTypingIndicator();

  if(!typingIndicator){

    typingIndicator =
    createTypingIndicatorElement?.();

    if(!typingIndicator){

      return false;

    }

    ChatElements
    .setTypingIndicator(
      typingIndicator
    );

  }

  removeTypingIndicator?.(
    false
  );

  typingIndicator
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
    !typingIndicator
    .isConnected
  ){

    ChatElements.append(
      typingIndicator
    );

  }

  scrollToBottom?.();

  return true;

}
