// =====================================
// RIGO AI
// CHAT MESSAGE ELEMENTS
// ENTERPRISE MESSAGE ELEMENT SYSTEM
// =====================================



// =====================================
// MESSAGE ROLE CLASS
// =====================================

function getMessageRoleClass(
  role
){

  switch(role){

    case "assistant":

      return "ai-message";

    case "system":

      return "system-message";

    case "user":

    default:

      return "user-message";

  }

}



// =====================================
// MESSAGE CONTENT
// =====================================

function createMessageContentElement(
  message
){

  const content =
  document.createElement(
    "div"
  );

  content.classList.add(
    "message-content"
  );

  const messageContent =
  String(
    message?.content || ""
  );

  try{

    if(
      typeof ChatMarkdownRenderer !==
      "undefined"
    ){

      ChatMarkdownRenderer
      .render(
        content,
        messageContent
      );

    }

    else{

      content.textContent =
      messageContent;

    }

  }

  catch(error){

    console.error(
      "MESSAGE CONTENT ERROR:",
      error
    );

    content.textContent =
    messageContent;

  }

  return content;

}



// =====================================
// MESSAGE META
// =====================================

function createMessageMetaElement(
  message
){

  const meta =
  document.createElement(
    "div"
  );

  meta.classList.add(
    "message-meta"
  );

  const timestamp =
  Number(
    message?.timestamp
  );

  if(
    Number.isFinite(
      timestamp
    )
  ){

    try{

      meta.textContent =

        new Date(timestamp)
        .toLocaleTimeString();

    }

    catch(error){

      meta.textContent =
      "";

    }

  }

  return meta;

}



// =====================================
// CREATE MESSAGE ELEMENT
// =====================================

function createMessageElement(
  message
){

  if(
    !message
  ){

    return null;

  }

  const wrapper =
  document.createElement(
    "div"
  );

  wrapper.classList.add(
    "message"
  );

  wrapper.classList.add(

    getMessageRoleClass(
      message.role
    )

  );

  wrapper.dataset.messageId =
  String(
    message.id || ""
  );

  wrapper.dataset.role =
  String(
    message.role || ""
  );



  // =========================
  // CONTENT
  // =========================

  const content =
  createMessageContentElement(
    message
  );

  if(!content){

    return null;

  }

  wrapper.appendChild(
    content
  );



  // =========================
  // META
  // =========================

  const meta =
  createMessageMetaElement(
    message
  );

  if(meta){

    wrapper.appendChild(
      meta
    );

  }

  return wrapper;

}



// =====================================
// UPDATE MESSAGE ELEMENT
// =====================================

function updateMessageElement(
  element,
  message
){

  if(
    !element ||
    !message
  ){

    return false;

  }

  const content =

    element.querySelector(
      ".message-content"
    );

  if(!content){

    return false;

  }

  const messageContent =
  String(
    message.content || ""
  );

  try{

    if(
      typeof ChatMarkdownRenderer !==
      "undefined"
    ){

      ChatMarkdownRenderer
      .render(
        content,
        messageContent
      );

    }

    else{

      content.textContent =
      messageContent;

    }

  }

  catch(error){

    console.error(
      "MESSAGE UPDATE ERROR:",
      error
    );

    content.textContent =
    messageContent;

  }

  const meta =

    element.querySelector(
      ".message-meta"
    );

  if(
    meta &&
    Number.isFinite(
      Number(
        message?.timestamp
      )
    )
  ){

    try{

      meta.textContent =

        new Date(
          message.timestamp
        )
        .toLocaleTimeString();

    }

    catch(error){

      meta.textContent =
      "";

    }

  }

  return true;

}
