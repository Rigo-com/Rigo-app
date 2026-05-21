// =====================================
// RIGO AI
// API
// PRODUCTION FINAL
// =====================================



// =====================================
// API STATE
// =====================================

const apiState =
Object.seal({

  status:"idle",

  pendingRequests:0,

  lastError:null,

  lastRequestAt:null

});



// =====================================
// VALID API STATE KEYS
// =====================================

const VALID_API_STATE_KEYS =
new Set([

  "status",

  "pendingRequests",

  "lastError",

  "lastRequestAt"

]);



// =====================================
// VALIDATE API STATE VALUE
// =====================================

function validateAPIStateValue(
  key,
  value
){

  switch(key){

    case "status":

      return (
        typeof value ===
        "string"
      );

    case "pendingRequests":

      return (

        Number.isFinite(
          value
        ) &&

        value >= 0

      );

    case "lastError":

      return (

        value === null ||

        typeof value ===
        "string"

      );

    case "lastRequestAt":

      return (

        value === null ||

        Number.isFinite(
          value
        )

      );

    default:

      return false;

  }

}



// =====================================
// UPDATE API STATE
// =====================================

function updateAPIState(
  updates = {}
){

  if(

    !updates ||

    typeof updates !==
    "object" ||

    Array.isArray(
      updates
    )

  ){

    return false;

  }

  Object.keys(
    updates
  )
  .forEach((key) => {

    const isValidKey =

      VALID_API_STATE_KEYS
      .has(key);

    if(!isValidKey){

      return;

    }

    const value =
    updates[key];

    const isValidValue =

      validateAPIStateValue(
        key,
        value
      );

    if(!isValidValue){

      return;

    }

    apiState[key] =
    value;

  });

  return true;

}



// =====================================
// VALIDATE API RESPONSE
// =====================================

function validateAPIResult(
  result
){

  if(

    !result ||

    typeof result !==
    "object" ||

    Array.isArray(
      result
    )

  ){

    throw createAPIError({

      message:
      "Invalid API result",

      code:
      "INVALID_API_RESULT"

    });

  }

  return true;

}



// =====================================
// NORMALIZE API RESPONSE
// =====================================

function normalizeAPIResult(
  result
){

  validateAPIResult(
    result
  );

  const safeStatus =
  Number(
    result.status
  );

  return Object.freeze({

    ok:Boolean(
      result.ok
    ),

    status:

    Number.isFinite(
      safeStatus
    )

    ? safeStatus

    : 0,

    data:
    result.data ?? null,

    headers:
    result.headers ?? null

  });

}



// =====================================
// CREATE API PAYLOAD
// =====================================

function createAPIPayload(
  data = {}
){

  const hasFormData =

    typeof FormData !==
    "undefined";

  const hasFile =

    typeof File !==
    "undefined";

  const hasBlob =

    typeof Blob !==
    "undefined";

  if(

    (

      hasFormData &&

      data instanceof
      FormData

    ) ||

    (

      hasFile &&

      data instanceof
      File

    ) ||

    (

      hasBlob &&

      data instanceof
      Blob

    )

  ){

    return data;

  }

  if(

    !data ||

    typeof data !==
    "object" ||

    Array.isArray(
      data
    )

  ){

    return {};

  }

  return deepClone(
    data
  ) || {};

}



// =====================================
// EXECUTE SAFE API ACTION
// =====================================

async function executeAPIAction(
  action
){

  if(
    typeof action !==
    "function"
  ){

    throw createAPIError({

      message:
      "Invalid API action",

      code:
      "INVALID_API_ACTION"

    });

  }

  const nextPending =

    apiState
    .pendingRequests + 1;

  updateAPIState({

    status:"loading",

    pendingRequests:
    nextPending,

    lastRequestAt:
    Date.now()

  });

  let error =
  null;

  try{

    return await action();

  }

  catch(caughtError){

    error =
    caughtError;

    throw caughtError;

  }

  finally{

    const remainingPending =

      Math.max(

        0,

        apiState
        .pendingRequests - 1

      );

    updateAPIState({

      pendingRequests:
      remainingPending,

      status:

      remainingPending > 0

      ? "loading"

      : error

        ? "error"

        : "success",

      lastError:

      error

      ? String(

          error?.message ||

          error ||

          ""

        ) || null

      : null

    });

  }

}



// =====================================
// HEALTH CHECK
// =====================================

async function checkAPIHealth(){

  return executeAPIAction(
    async () => {

      const result =
      await apiGet(
        "/health"
      );

      return normalizeAPIResult(
        result
      );

    }
  );

}



// =====================================
// FETCH AVAILABLE MODELS
// =====================================

async function fetchAvailableModels(){

  return executeAPIAction(
    async () => {

      const result =
      await apiGet(
        "/models"
      );

      return normalizeAPIResult(
        result
      );

    }
  );

}



// =====================================
// SEND CHAT MESSAGE
// =====================================

async function sendChatMessage({

  message = "",

  chatId = "",

  context = []

} = {}){

  return executeAPIAction(
    async () => {

      const cleanMessage =
      String(
        message || ""
      ).trim();

      if(!cleanMessage){

        throw createAPIError({

          message:
          "Message is required",

          code:
          "INVALID_MESSAGE"

        });

      }

      const payload =
      createAPIPayload({

        message:
        cleanMessage,

        chatId:
        String(
          chatId || ""
        ).trim(),

        context:

        Array.isArray(
          context
        )

        ? deepClone(
            context
          ) || []

        : []

      });

      const result =
      await apiPost(

        "/chat/message",

        payload

      );

      return normalizeAPIResult(
        result
      );

    }
  );

}



// =====================================
// SYNC CHAT
// =====================================

async function syncChatData(
  chatData = {}
){

  return executeAPIAction(
    async () => {

      const payload =
      createAPIPayload(
        chatData
      );

      const result =
      await apiPost(

        "/chat/sync",

        payload

      );

      return normalizeAPIResult(
        result
      );

    }
  );

}



// =====================================
// SAVE USER SETTINGS
// =====================================

async function saveUserSettings(
  settings = {}
){

  return executeAPIAction(
    async () => {

      const payload =
      createAPIPayload(
        settings
      );

      const result =
      await apiPost(

        "/settings/save",

        payload

      );

      return normalizeAPIResult(
        result
      );

    }
  );

}



// =====================================
// LOAD USER SETTINGS
// =====================================

async function loadUserSettings(){

  return executeAPIAction(
    async () => {

      const result =
      await apiGet(
        "/settings"
      );

      return normalizeAPIResult(
        result
      );

    }
  );

}



// =====================================
// UPLOAD FILE
// =====================================

async function uploadFile(
  file
){

  return executeAPIAction(
    async () => {

      const hasFile =

        typeof File !==
        "undefined";

      if(

        !hasFile ||

        !(file instanceof File)

      ){

        throw createAPIError({

          message:
          "Invalid file",

          code:
          "INVALID_FILE"

        });

      }

      const formData =
      new FormData();

      formData.append(
        "file",
        file
      );

      const result =
      await apiRequest({

        endpoint:
        "/files/upload",

        method:"POST",

        headers:{},

        body:formData

      });

      return normalizeAPIResult(
        result
      );

    }
  );

}



// =====================================
// GET API STATUS
// =====================================

function getAPIStatus(){

  return deepClone(
    apiState
  );

}
