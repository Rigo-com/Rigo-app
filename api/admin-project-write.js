// =====================================
// RIGO AI
// ADMIN PROJECT WRITE API
// VERCEL SERVERLESS FUNCTION
// =====================================

import crypto
from "node:crypto";



// =====================================
// REPOSITORY CONFIG
// =====================================

const OWNER =
"Rigo-com";

const REPO =
"Rigo-app";

const BRANCH =
"main";

const ALLOWED_ROOT =
"js";

const SESSION_COOKIE =
"rigo_admin_session";



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
// COOKIE
// =====================================

function parseCookies(
  request
){

  const cookieHeader =
  request.headers?.cookie || "";

  const cookies = {};

  for(
    const cookiePart
    of cookieHeader.split(";")
  ){

    const separatorIndex =
    cookiePart.indexOf("=");

    if(
      separatorIndex === -1
    ){

      continue;

    }

    const key =
    cookiePart
    .slice(
      0,
      separatorIndex
    )
    .trim();

    const value =
    cookiePart
    .slice(
      separatorIndex + 1
    )
    .trim();

    if(
      key
    ){

      cookies[key] =
      value;

    }

  }

  return cookies;

}



// =====================================
// SESSION VALIDATION
// =====================================

function validateSessionToken(
  token,
  secret
){

  if(
    !token ||
    !secret
  ){

    return {
      ok:false,
      error:"ADMIN_SESSION_MISSING"
    };

  }

  const parts =
  String(token)
  .split(".");

  if(
    parts.length !== 2
  ){

    return {
      ok:false,
      error:"ADMIN_SESSION_INVALID"
    };

  }

  const encodedPayload =
  parts[0];

  const receivedSignature =
  parts[1];

  const expectedSignature =
  createSignature(
    encodedPayload,
    secret
  );

  if(
    !safeCompare(
      receivedSignature,
      expectedSignature
    )
  ){

    return {
      ok:false,
      error:"ADMIN_SESSION_SIGNATURE_INVALID"
    };

  }

  let payload =
  null;

  try{

    payload =
    JSON.parse(
      Buffer
      .from(
        encodedPayload,
        "base64url"
      )
      .toString(
        "utf8"
      )
    );

  }
  catch{

    return {
      ok:false,
      error:"ADMIN_SESSION_PAYLOAD_INVALID"
    };

  }

  if(
    payload?.role !== "admin"
  ){

    return {
      ok:false,
      error:"ADMIN_SESSION_ROLE_INVALID"
    };

  }

  if(
    !payload?.expiresAt ||
    Date.now() >= payload.expiresAt
  ){

    return {
      ok:false,
      error:"ADMIN_SESSION_EXPIRED"
    };

  }

  return {
    ok:true,
    payload
  };

}



function authorizeRequest(
  request
){

  const secret =
  process.env
  .RIGO_ADMIN_SECRET;

  if(
    !secret
  ){

    return {
      ok:false,
      status:500,
      error:"RIGO_ADMIN_SECRET_NOT_CONFIGURED"
    };

  }

  const cookies =
  parseCookies(
    request
  );

  const token =
  cookies[
    SESSION_COOKIE
  ];

  const validation =
  validateSessionToken(
    token,
    secret
  );

  if(
    !validation.ok
  ){

    return {
      ok:false,
      status:401,
      error:validation.error
    };

  }

  return {
    ok:true,
    session:validation.payload
  };

}



// =====================================
// PATH SECURITY
// =====================================

function normalizePath(
  value
){

  return String(
    value || ""
  )
  .replaceAll(
    "\\",
    "/"
  )
  .replace(/^\/+/, "")
  .replace(/\/+/g, "/")
  .trim();

}



function validateProjectPath(
  value
){

  const path =
  normalizePath(
    value
  );

  if(
    !path
  ){

    throw new Error(
      "FILE_PATH_REQUIRED"
    );

  }

  if(
    path.includes("..")
  ){

    throw new Error(
      "INVALID_FILE_PATH"
    );

  }

  if(
    path === ALLOWED_ROOT
  ){

    throw new Error(
      "ROOT_FILE_OPERATION_NOT_ALLOWED"
    );

  }

  if(
    !path.startsWith(
      ALLOWED_ROOT + "/"
    )
  ){

    throw new Error(
      `PATH_OUTSIDE_ALLOWED_ROOT:${ALLOWED_ROOT}`
    );

  }

  return path;

}



// =====================================
// GITHUB URL
// =====================================

function createGitHubApiUrl(
  path
){

  const cleanPath =
  validateProjectPath(
    path
  );

  const encodedPath =
  cleanPath
  .split("/")
  .map(
    encodeURIComponent
  )
  .join("/");

  return (
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodedPath}`
  );

}



// =====================================
// GITHUB HEADERS
// =====================================

function createGitHubHeaders(){

  const token =
  process.env
  .GITHUB_TOKEN;

  if(
    !token
  ){

    throw new Error(
      "GITHUB_TOKEN_NOT_CONFIGURED"
    );

  }

  return {

    "Accept":
    "application/vnd.github+json",

    "Authorization":
    `Bearer ${token}`,

    "User-Agent":
    "RIGO-Admin-Agent",

    "X-GitHub-Api-Version":
    "2022-11-28",

    "Content-Type":
    "application/json"

  };

}



// =====================================
// GITHUB REQUEST
// =====================================

async function requestGitHub(
  path,
  options = {}
){

  const response =
  await fetch(
    createGitHubApiUrl(
      path
    ),
    {

      method:
      options.method || "GET",

      headers:
      createGitHubHeaders(),

      body:
      options.body
      ? JSON.stringify(
          options.body
        )
      : undefined

    }
  );

  const rawBody =
  await response
  .text();

  let result =
  null;

  try{

    result =
    rawBody
    ? JSON.parse(
        rawBody
      )
    : null;

  }
  catch{

    result = {
      message:rawBody
    };

  }

  if(
    !response.ok
  ){

    const error =
    new Error(
      result?.message ||
      `GITHUB_REQUEST_FAILED:${response.status}`
    );

    error.status =
    response.status;

    error.details =
    result;

    throw error;

  }

  return result;

}



// =====================================
// GET FILE
// =====================================

async function getFile(
  path
){

  return requestGitHub(
    path,
    {
      method:"GET"
    }
  );

}



// =====================================
// CREATE FILE
// =====================================

async function createFile(
  options = {}
){

  const path =
  validateProjectPath(
    options.path
  );

  try{

    await getFile(
      path
    );

    throw new Error(
      "FILE_ALREADY_EXISTS"
    );

  }
  catch(error){

    if(
      error?.status !== 404
    ){

      throw error;

    }

  }

  const content =
  Buffer
  .from(
    String(
      options.content ?? ""
    ),
    "utf8"
  )
  .toString(
    "base64"
  );

  const result =
  await requestGitHub(
    path,
    {

      method:"PUT",

      body:{

        message:
        options.message ||
        `RIGO Admin: create ${path}`,

        content,

        branch:
        BRANCH

      }

    }
  );

  return {

    ok:true,

    action:"create-file",

    path,

    commit:
    result?.commit || null,

    file:
    result?.content || null

  };

}



// =====================================
// UPDATE FILE
// =====================================

async function updateFile(
  options = {}
){

  const path =
  validateProjectPath(
    options.path
  );

  const currentFile =
  await getFile(
    path
  );

  if(
    currentFile?.type !== "file" ||
    !currentFile?.sha
  ){

    throw new Error(
      "FILE_NOT_FOUND_OR_INVALID"
    );

  }

  const content =
  Buffer
  .from(
    String(
      options.content ?? ""
    ),
    "utf8"
  )
  .toString(
    "base64"
  );

  const result =
  await requestGitHub(
    path,
    {

      method:"PUT",

      body:{

        message:
        options.message ||
        `RIGO Admin: update ${path}`,

        content,

        sha:
        currentFile.sha,

        branch:
        BRANCH

      }

    }
  );

  return {

    ok:true,

    action:"update-file",

    path,

    previousSha:
    currentFile.sha,

    commit:
    result?.commit || null,

    file:
    result?.content || null

  };

}



// =====================================
// DELETE FILE
// =====================================

async function deleteFile(
  options = {}
){

  const path =
  validateProjectPath(
    options.path
  );

  const currentFile =
  await getFile(
    path
  );

  if(
    currentFile?.type !== "file" ||
    !currentFile?.sha
  ){

    throw new Error(
      "FILE_NOT_FOUND_OR_INVALID"
    );

  }

  const result =
  await requestGitHub(
    path,
    {

      method:"DELETE",

      body:{

        message:
        options.message ||
        `RIGO Admin: delete ${path}`,

        sha:
        currentFile.sha,

        branch:
        BRANCH

      }

    }
  );

  return {

    ok:true,

    action:"delete-file",

    path,

    deletedSha:
    currentFile.sha,

    commit:
    result?.commit || null

  };

}



// =====================================
// MOVE FILE
// =====================================

async function moveFile(
  options = {}
){

  const sourcePath =
  validateProjectPath(
    options.sourcePath
  );

  const destinationPath =
  validateProjectPath(
    options.destinationPath
  );

  if(
    sourcePath === destinationPath
  ){

    throw new Error(
      "SOURCE_AND_DESTINATION_ARE_EQUAL"
    );

  }

  const sourceFile =
  await getFile(
    sourcePath
  );

  if(
    sourceFile?.type !== "file" ||
    !sourceFile?.sha ||
    !sourceFile?.content
  ){

    throw new Error(
      "SOURCE_FILE_NOT_FOUND_OR_INVALID"
    );

  }

  try{

    await getFile(
      destinationPath
    );

    throw new Error(
      "DESTINATION_FILE_ALREADY_EXISTS"
    );

  }
  catch(error){

    if(
      error?.status !== 404
    ){

      throw error;

    }

  }

  const content =
  String(
    sourceFile.content
  )
  .replace(/\n/g, "");

  const createResult =
  await requestGitHub(
    destinationPath,
    {

      method:"PUT",

      body:{

        message:
        options.message ||
        `RIGO Admin: move ${sourcePath} to ${destinationPath}`,

        content,

        branch:
        BRANCH

      }

    }
  );

  try{

    const deleteResult =
    await requestGitHub(
      sourcePath,
      {

        method:"DELETE",

        body:{

          message:
          options.message ||
          `RIGO Admin: remove ${sourcePath}`,

          sha:
          sourceFile.sha,

          branch:
          BRANCH

        }

      }
    );

    return {

      ok:true,

      action:"move-file",

      sourcePath,

      destinationPath,

      createCommit:
      createResult?.commit || null,

      deleteCommit:
      deleteResult?.commit || null

    };

  }
  catch(error){

    return {

      ok:false,

      action:"move-file",

      partial:true,

      sourcePath,

      destinationPath,

      destinationCreated:true,

      sourceDeleted:false,

      error:
      error?.message || String(error)

    };

  }

}



// =====================================
// EXECUTE ACTION
// =====================================

async function executeAction(
  body = {}
){

  const action =
  String(
    body.action || ""
  )
  .trim()
  .toLowerCase();

  if(
    action === "create-file"
  ){

    return createFile(
      body
    );

  }

  if(
    action === "update-file"
  ){

    return updateFile(
      body
    );

  }

  if(
    action === "delete-file"
  ){

    return deleteFile(
      body
    );

  }

  if(
    action === "move-file"
  ){

    return moveFile(
      body
    );

  }

  throw new Error(
    `UNSUPPORTED_ADMIN_ACTION:${action || "EMPTY"}`
  );

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

    const authorization =
    authorizeRequest(
      request
    );

    if(
      !authorization.ok
    ){

      sendResponse(
        response,
        authorization.status,
        {
          ok:false,
          error:authorization.error
        }
      );

      return;

    }

    const result =
    await executeAction(
      request.body || {}
    );

    sendResponse(
      response,
      result?.ok === false
      ? 500
      : 200,
      result
    );

  }
  catch(error){

    sendResponse(
      response,
      error?.status || 500,
      {

        ok:false,

        error:
        error?.message ||
        String(error),

        details:
        error?.details || null

      }
    );

  }

}
