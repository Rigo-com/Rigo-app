// =====================================
// RIGO AI
// ADMIN LOGIN API
// VERCEL SERVERLESS FUNCTION
// =====================================

import crypto
from "node:crypto";



// =====================================
// CONFIG
// =====================================

const SESSION_COOKIE =
"rigo_admin_session";

const SESSION_DURATION_SECONDS =
60 * 60;

const SESSION_DURATION_MS =
SESSION_DURATION_SECONDS * 1000;



// =====================================
// RESPONSE
// =====================================

function sendResponse(
  response,
  status,
  body
){

  response
  .status(status)
  .json(body);

}



// =====================================
// SAFE COMPARISON
// =====================================

function safeCompare(
  first,
  second
){

  const firstBuffer =
  Buffer.from(
    String(first || "")
  );

  const secondBuffer =
  Buffer.from(
    String(second || "")
  );

  if(
    firstBuffer.length !==
    secondBuffer.length
  ){

    return false;

  }

  return crypto
  .timingSafeEqual(
    firstBuffer,
    secondBuffer
  );

}



// =====================================
// BASE64 URL
// =====================================

function encodeBase64URL(
  value
){

  return Buffer
  .from(
    value,
    "utf8"
  )
  .toString(
    "base64url"
  );

}



// =====================================
// SIGNATURE
// =====================================

function createSignature(
  value,
  secret
){

  return crypto
  .createHmac(
    "sha256",
    secret
  )
  .update(
    value
  )
  .digest(
    "base64url"
  );

}



// =====================================
// SESSION TOKEN
// =====================================

function createSessionToken(
  secret
){

  const now =
  Date.now();

  const payload = {

    role:
    "admin",

    issuedAt:
    now,

    expiresAt:
    now + SESSION_DURATION_MS

  };

  const encodedPayload =
  encodeBase64URL(
    JSON.stringify(
      payload
    )
  );

  const signature =
  createSignature(
    encodedPayload,
    secret
  );

  return (
    encodedPayload +
    "." +
    signature
  );

}



// =====================================
// COOKIE
// =====================================

function createSessionCookie(
  token
){

  return [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    `Max-Age=${SESSION_DURATION_SECONDS}`
  ]
  .join("; ");

}



// =====================================
// REQUEST BODY
// =====================================

function getRequestSecret(
  request
){

  if(
    typeof request.body === "string"
  ){

    try{

      const body =
      JSON.parse(
        request.body
      );

      return body?.secret || "";

    }
    catch{

      return "";

    }

  }

  return request.body?.secret || "";

}



// =====================================
// HANDLER
// =====================================

export default async function handler(
  request,
  response
){

  try{

    if(
      request.method !== "POST"
    ){

      sendResponse(
        response,
        405,
        {
          ok:false,
          error:"METHOD_NOT_ALLOWED"
        }
      );

      return;

    }

    const configuredSecret =
    process.env
    .RIGO_ADMIN_SECRET;

    if(
      !configuredSecret
    ){

      sendResponse(
        response,
        500,
        {
          ok:false,
          error:"RIGO_ADMIN_SECRET_NOT_CONFIGURED"
        }
      );

      return;

    }

    const receivedSecret =
    getRequestSecret(
      request
    );

    if(
      !receivedSecret ||
      !safeCompare(
        receivedSecret,
        configuredSecret
      )
    ){

      sendResponse(
        response,
        401,
        {
          ok:false,
          error:"INVALID_ADMIN_SECRET"
        }
      );

      return;

    }

    const sessionToken =
    createSessionToken(
      configuredSecret
    );

    response.setHeader(
      "Set-Cookie",
      createSessionCookie(
        sessionToken
      )
    );

    sendResponse(
      response,
      200,
      {
        ok:true,
        authenticated:true,
        expiresIn:
        SESSION_DURATION_SECONDS
      }
    );

  }
  catch(error){

    sendResponse(
      response,
      500,
      {
        ok:false,
        error:
        error?.message ||
        String(error)
      }
    );

  }

}
