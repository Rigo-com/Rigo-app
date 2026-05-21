// =====================================
// VALID API STATUS
// =====================================

const VALID_API_STATUS =
Object.freeze([

  "idle",

  "loading",

  "success",

  "error"

]);



// =====================================
// SAFE DEEP CLONE
// =====================================

function safeDeepClone(
  value
){

  try{

    if(
      typeof deepClone ===
      "function"
    ){

      return deepClone(
        value
      );

    }

    return structuredClone(
      value
    );

  }

  catch(error){

    try{

      return JSON.parse(
        JSON.stringify(
          value
        )
      );

    }

    catch(cloneError){

      return null;

    }

  }

}



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

        &&

        VALID_API_STATUS
        .includes(value)

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

    ?

    safeStatus

    :

    0,

    data:
    result.data ?? null,

    headers:
    result.headers ?? null,

    requestId:

      typeof result
      .requestId ===
      "string"

      ?

      result.requestId

      :

      null,

    duration:

      Number.isFinite(
        result.duration
      )

      ?

      result.duration

      :

      null,

    attempt:

      Number.isFinite(
        result.attempt
      )

      ?

      result.attempt

      :

      null

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

  return safeDeepClone(
    data
  ) || {};

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

      const maxFileSize =
      10 * 1024 * 1024;

      if(
        file.size >
        maxFileSize
      ){

        throw createAPIError({

          message:
          "File too large",

          code:
          "FILE_TOO_LARGE"

        });

      }

      const allowedMimeTypes = [

        "image/png",

        "image/jpeg",

        "image/webp",

        "application/pdf",

        "text/plain"

      ];

      if(

        file.type &&

        !allowedMimeTypes
        .includes(
          file.type
        )

      ){

        throw createAPIError({

          message:
          "Unsupported file type",

          code:
          "INVALID_FILE_TYPE"

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

        headers:{

          Accept:
          "application/json"

        },

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

  return safeDeepClone(
    apiState
  );

}
