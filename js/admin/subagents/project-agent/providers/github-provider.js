// =====================================
// RIGO AI
// GITHUB PROJECT PROVIDER
// PRIVATE ADMIN PROJECT AGENT
// =====================================

const githubProviderState =
Object.seal({

  owner:
  "Rigo-com",

  repo:
  "Rigo-app",

  branch:
  "main",

  root:
  "js",

  lastScanAt:
  null,

  lastError:
  null

});

function createGitHubApiUrl(
  path = ""
){

  const cleanPath =
  String(path || "")
  .replace(/^\/+/, "");

  return [
    "https://api.github.com/repos",
    githubProviderState.owner,
    githubProviderState.repo,
    "contents",
    cleanPath
  ]
  .join("/") +
  `?ref=${githubProviderState.branch}`;

}

async function fetchGitHubJson(
  path
){

  const response =
  await fetch(
    createGitHubApiUrl(
      path
    ),
    {
      headers:
      {
        "Accept":
        "application/vnd.github+json"
      }
    }
  );

  if(
    !response.ok
  ){

    throw new Error(
      `GITHUB_REQUEST_FAILED:${response.status}:${path}`
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

function classifyFile(
  file
){

  const path =
  String(file.path || "");

  if(
    path.includes("/ai/")
  ){

    return "ai";

  }

  if(
    path.includes("/memory/")
  ){

    return "memory";

  }

  if(
    path.includes("/debug/")
  ){

    return "debug";

  }

  if(
    path.includes("/ui/")
  ){

    return "ui";

  }

  if(
    path.includes("/core/")
  ){

    return "core";

  }

  if(
    path.includes("/bootstrap/")
  ){

    return "bootstrap";

  }

  if(
    path.includes("/services/")
  ){

    return "services";

  }

  if(
    path.includes("/admin/")
  ){

    return "admin";

  }

  return "unknown";

}

function buildProjectData(
  raw
){

  const files =
  raw
  .files || [];

  const folders =
  raw
  .folders || [];

  const systems =
  folders
  .filter(
    folder =>
    folder.path
    .split("/")
    .length === 2
  )
  .map(
    folder => ({
      id:
      folder.name,

      path:
      folder.path,

      source:
      "github"
    })
  );

  const ai =
  files
  .filter(
    file =>
    classifyFile(file) === "ai"
  );

  const memory =
  files
  .filter(
    file =>
    classifyFile(file) === "memory"
  );

  const debug =
  files
  .filter(
    file =>
    classifyFile(file) === "debug"
  );

  const ui =
  files
  .filter(
    file =>
    classifyFile(file) === "ui"
  );

  const graphNodes =
  [
    ...folders
    .map(
      folder => ({
        id:
        folder.path,

        type:
        "folder",

        label:
        folder.name
      })
    ),

    ...files
    .map(
      file => ({
        id:
        file.path,

        type:
        "file",

        label:
        file.name
      })
    )
  ];

  const graphEdges =
  files
  .map(
    file => ({
      from:
      file.path
      .split("/")
      .slice(0, -1)
      .join("/"),

      to:
      file.path,

      type:
      "contains"
    })
  );

  return {

    files,

    folders,

    imports:
    [],

    exports:
    [],

    systems,

    services:
    [],

    routes:
    [],

    ui,

    ai,

    memory,

    debug,

    relationships:
    graphEdges,

    graph:
    {
      nodes:
      graphNodes,

      edges:
      graphEdges
    }

  };

}

async function scanProject(){

  try{

    const raw = {

      files:
      [],

      folders:
      []

    };

    await scanDirectory(
      githubProviderState.root,
      raw
    );

    githubProviderState
    .lastScanAt =
    Date.now();

    return {

      ok:
      true,

      source:
      "github",

      owner:
      githubProviderState
      .owner,

      repo:
      githubProviderState
      .repo,

      branch:
      githubProviderState
      .branch,

      root:
      githubProviderState
      .root,

      data:
      buildProjectData(
        raw
      )

    };

  }
  catch(error){

    githubProviderState
    .lastError =
    error;

    return {

      ok:
      false,

      error:
      error?.message || String(error)

    };

  }

}

function configure(
  config = {}
){

  if(
    config.owner
  ){

    githubProviderState
    .owner =
    config.owner;

  }

  if(
    config.repo
  ){

    githubProviderState
    .repo =
    config.repo;

  }

  if(
    config.branch
  ){

    githubProviderState
    .branch =
    config.branch;

  }

  if(
    config.root
  ){

    githubProviderState
    .root =
    config.root;

  }

  return true;

}

function snapshot(){

  return {

    id:
    "github-provider",

    owner:
    githubProviderState
    .owner,

    repo:
    githubProviderState
    .repo,

    branch:
    githubProviderState
    .branch,

    root:
    githubProviderState
    .root,

    lastScanAt:
    githubProviderState
    .lastScanAt,

    lastError:
    githubProviderState
    .lastError

  };

}

const GitHubProvider =
Object.freeze({

  id:
  "github-provider",

  configure,

  scanProject,

  snapshot

});

export {

  configure,

  scanProject,

  snapshot,

  GitHubProvider

};

export default
GitHubProvider;
