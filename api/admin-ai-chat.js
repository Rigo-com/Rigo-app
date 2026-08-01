// =====================================
// RIGO AI
// ADMIN AI CHAT API
// VERCEL SERVERLESS FUNCTION
// =====================================



// =====================================
// CONFIG
// =====================================

const OPENROUTER_URL =
"https://openrouter.ai/api/v1/chat/completions";

const DEFAULT_MODEL =
process.env.OPENROUTER_MODEL ||
"openrouter/free";

const MAX_MESSAGE_LENGTH =
20000;

const SYSTEM_PROMPT =
`
You are RIGO Admin Agent.

You are the private administrative AI assistant for the RIGO project.

Your responsibilities include:

- understanding the RIGO architecture
- reviewing project code
- explaining files and systems
- finding architectural problems
- proposing implementation plans
- generating and refactoring JavaScript code
- assisting with debugging
- preparing safe project changes

Important rules:

- Do not claim that you executed a project change unless execution actually happened.
- Do not claim that you read a file unless its content was provided in the request.
- Clearly separate analysis, recommendations, and executable changes.
- Project-changing operations require explicit admin approval.
- Prefer precise, structured, implementation-ready responses.
- Preserve the existing RIGO architecture and Container-first rules.
`
.trim();



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
// NORMALIZATION
// =====================================

function normalizeText(
  value
){

  return String(
    value || ""
  )
  .trim();

}



function normalizeMessages(
  value
){

  if(
    !Array.isArray(
      value
    )
  ){

    return [];

  }

  return value
  .filter(
    function(message){

      return (

        message &&

        typeof message ===
        "object" &&

        [
          "system",
          "user",
          "assistant"
        ]
        .includes(
          message.role
        ) &&

        typeof message.content ===
        "string" &&

        message.content.trim()

      );

    }
  )
  .map(
    function(message){

      return {

        role:
        message.role,

        content:
        message.content
        .trim()
        .slice(
          0,
          MAX_MESSAGE_LENGTH
        )

      };

    }
  );

}



// =====================================
// REQUEST BODY
// =====================================

function getRequestBody(
  request
){

  if(
    typeof request.body ===
    "string"
  ){

    try{

      return JSON.parse(
        request.body
      );

    }
    catch{

      return {};

    }

  }

  if(
    request.body &&
    typeof request.body ===
    "object"
  ){

    return request.body;

  }

  return {};

}



// =====================================
// BUILD MESSAGES
// =====================================

function buildMessages(
  body
){

  const history =
  normalizeMessages(
    body.messages
  );

  const message =
  normalizeText(
    body.message ||
    body.input ||
    body.prompt
  );

  const context =
  normalizeText(
    body.context
  );

  const messages = [

    {
      role:
      "system",

      content:
      SYSTEM_PROMPT
    }

  ];

  if(
    context
  ){

    messages.push({

      role:
      "system",

      content:
      `
Project context supplied by the RIGO application:

${context}
      `
      .trim()

    });

  }

  messages.push(
    ...history
  );

  if(
    message
  ){

    messages.push({

      role:
      "user",

      content:
      message.slice(
        0,
        MAX_MESSAGE_LENGTH
      )

    });

  }

  return messages;

}



// =====================================
// OPENROUTER HEADERS
// =====================================

function createOpenRouterHeaders(
  request
){

  const apiKey =
  process.env
  .OPENROUTER_API_KEY;

  if(
    !apiKey
  ){

    throw new Error(
      "OPENROUTER_API_KEY_NOT_CONFIGURED"
    );

  }

  const origin =
  normalizeText(
    request.headers?.origin
  );

  return {

    "Authorization":
    `Bearer ${apiKey}`,

    "Content-Type":
    "application/json",

    "HTTP-Referer":
    origin ||
    process.env.RIGO_SITE_URL ||
    "https://rigo-app.vercel.app",

    "X-OpenRouter-Title":
    "RIGO Admin Agent"

  };

}



// =====================================
// OPENROUTER REQUEST
// =====================================

async function requestOpenRouter(
  request,
  body
){

  const messages =
  buildMessages(
    body
  );

  if(
    messages.length <= 1
  ){

    throw new Error(
      "ADMIN_AI_MESSAGE_REQUIRED"
    );

  }

  const model =
  normalizeText(
    body.model
  ) ||
  DEFAULT_MODEL;

  const openRouterResponse =
  await fetch(
    OPENROUTER_URL,
    {

      method:
      "POST",

      headers:
      createOpenRouterHeaders(
        request
      ),

      body:
      JSON.stringify({

        model,

        messages,

        temperature:

          Number.isFinite(
            body.temperature
          )

          ?

          body.temperature

          :

          0.2,

        max_tokens:

          Number.isFinite(
            body.maxTokens
          )

          ?

          body.maxTokens

          :

          2000

      })

    }
  );

  const rawBody =
  await openRouterResponse
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

      raw:
      rawBody

    };

  }

  if(
    !openRouterResponse.ok
  ){

    const error =
    new Error(

      result?.error?.message ||

      result?.message ||

      `OPENROUTER_REQUEST_FAILED:${openRouterResponse.status}`

    );

    error.status =
    openRouterResponse.status;

    error.details =
    result;

    throw error;

  }

  const assistantMessage =
  result
  ?.choices
  ?.[0]
  ?.message
  ?.content;

  if(
    typeof assistantMessage !==
    "string" ||
    !assistantMessage.trim()
  ){

    const error =
    new Error(
      "OPENROUTER_EMPTY_RESPONSE"
    );

    error.details =
    result;

    throw error;

  }

  return {

    ok:
    true,

    mode:
    "admin-ai-chat",

    message:
    assistantMessage.trim(),

    model:
    result?.model ||
    model,

    usage:
    result?.usage ||
    null,

    requestId:
    result?.id ||
    null,

    createdAt:
    Date.now()

  };

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
      request.method !==
      "POST"
    ){

      sendResponse(
        response,
        405,
        {

          ok:
          false,

          error:
          "METHOD_NOT_ALLOWED"

        }
      );

      return;

    }

    const body =
    getRequestBody(
      request
    );

    const result =
    await requestOpenRouter(
      request,
      body
    );

    sendResponse(
      response,
      200,
      result
    );

  }
  catch(error){

    sendResponse(
      response,
      error?.status ||
      500,
      {

        ok:
        false,

        error:
        error?.message ||
        String(error),

        details:
        error?.details ||
        null,

        timestamp:
        Date.now()

      }
    );

  }

}
