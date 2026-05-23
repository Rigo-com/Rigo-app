// =====================================
// VALIDATE CHAT
// =====================================

function validateChatObject(chat){

  if(
    !chat ||
    typeof chat !==
    "object" ||
    Array.isArray(chat)
  ){

    return false;

  }

  if(
    typeof chat.id !==
    "string"
  ){

    return false;

  }

  if(
    typeof chat.title !==
    "string"
  ){

    return false;

  }

  if(
    !Array.isArray(
      chat.messages
    )
  ){

    return false;

  }

  if(
    !chat.messages.every(
      validateMessageObject
    )
  ){

    return false;

  }

  if(
    !Number.isFinite(
      chat.createdAt
    )
  ){

    return false;

  }

  if(
    !Number.isFinite(
      chat.updatedAt
    )
  ){

    return false;

  }

  return true;

}



// =====================================
// VALIDATE MEMORY
// =====================================

function validateMemoryObject(memory){

  if(
    !memory ||
    typeof memory !==
    "object" ||
    Array.isArray(memory)
  ){

    return false;

  }

  return (
    Object.keys(memory)
    .length <= 1000
  );

}
