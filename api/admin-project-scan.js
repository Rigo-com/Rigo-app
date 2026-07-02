// =====================================
// RIGO AI
// ADMIN PROJECT SCAN API
// VERCEL SERVERLESS FUNCTION
// =====================================

const OWNER =
"Rigo-com";

const REPO =
"Rigo-app";

const BRANCH =
"main";

const ROOT =
"js";

function createGitHubApiUrl(
  path = ""
){

  const cleanPath =
  String(path || "")
  .replace(/^\/+/, "");

  return [
    "https://api.github.com/repos",
    OWNER,
    REPO,
    "contents",
    cleanPath
  ]
  .join("/") +
  `?ref=${BRANCH}`;

}

async function fetchGitHubJson(
  path
){

  const headers = {
    "Accept":
    "application/vnd.github+json",

    "User-Agent":
    "RIGO-Admin-Agent"
  };

  if(
    process.env.GITHUB_TOKEN
  ){

    headers.Authorization =
    `Bearer ${process.env.GITHUB_TOKEN}`;

  }

  const response =
  await fetch(
    createGitHubApiUrl(
      path
    ),
    {
      headers
    }
  );

  if(
    !response.ok
  ){

    const body =
    await response
    .text();

    throw new Error(
      `GITHUB_REQUEST_FAILED:${response.status}:${path}:${body}`
    );

  }

  return response
  .json();

}

async function readDirectory(
  path
){

  const result =
  await fetchGitHubJson(
    path
  );

  if(
    !Array.isArray(result)
  ){

    return [];

  }

  return result;

}

async function scanDirectory(
  path,
  output
){

  const entries =
  await readDirectory(
    path
  );

  for(
    const entry
    of entries
  ){

    if(
      entry.type === "dir"
    ){

      output
      .folders
      .push({
        name:
        entry.name,

        path:
        entry.path,

        url:
        entry.html_url
      });

      await scanDirectory(
        entry.path,
        output
      );

    }

    if(
      entry.type === "file"
    ){

      output
      .files
      .push({
        name:
        entry.name,

        path:
        entry.path,

        url:
        entry.html_url,

        size:
        entry.size || 0
      });

    }

  }

  return output;

}

export default async function handler(
  request,
  response
){

  try{

    if(
      request.method !== "GET"
    ){

      response
      .status(405)
      .json({
        ok:
        false,

        error:
        "METHOD_NOT_ALLOWED"
      });

      return;

    }

    const raw = {
      files:
      [],

      folders:
      []
    };

    await scanDirectory(
      ROOT,
      raw
    );

    response
    .status(200)
    .json({
      ok:
      true,

      source:
      "github-server",

      owner:
      OWNER,

      repo:
      REPO,

      branch:
      BRANCH,

      root:
      ROOT,

      raw
    });

  }
  catch(error){

    response
    .status(500)
    .json({
      ok:
      false,

      error:
      error?.message || String(error)
    });

  }

}
