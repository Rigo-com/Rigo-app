// =====================================
// RIGO AI
// UTILS
// =====================================



// =====================================
// WAIT
// =====================================

function wait(ms){

  if(
    !Number.isFinite(ms)
  ){

    return Promise.resolve();

  }

  return new Promise(
    (resolve) => {

      setTimeout(
        resolve,
        Math.max(0,ms)
      );

    }
  );

}



// =====================================
// DEEP CLONE
// =====================================

function deepClone(data){

  try{

    return structuredClone(
      data
    );

  }

  catch(error){

    try{

      return JSON.parse(
        JSON.stringify(data)
      );

    }

    catch(cloneError){

      console.error(
        "DEEP CLONE ERROR:",
        cloneError
      );

      return null;

    }

  }

}



// =====================================
// MESSAGE ID
// =====================================

function createMessageId(){

  if(
    typeof crypto !==
    "undefined" &&

    typeof crypto.randomUUID ===
    "function"
  ){

    return crypto.randomUUID();

  }

  return (

    "msg_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .substring(2,9)

  );

}



// =====================================
// CHAT ID
// =====================================

function createChatId(){

  if(
    typeof crypto !==
    "undefined" &&

    typeof crypto.randomUUID ===
    "function"
  ){

    return crypto.randomUUID();

  }

  return (

    "chat_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .substring(2,9)

  );

}
