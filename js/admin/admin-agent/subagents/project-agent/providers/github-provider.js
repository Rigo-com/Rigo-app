// =====================================
// RIGO AI
// GITHUB PROJECT PROVIDER
// =====================================



// =====================================
// INTERNAL STATE
// =====================================

const githubProviderState =
Object.seal({

  authenticated:
  false,

  lastScanAt:
  null,

  lastWriteAt:
  null,

  lastAction:
  null,

  lastResult:
  null,

  lastError:
  null

});



// =====================================
// RESPONSE PARSER
// =====================================

async function parseResponse(
  response
){

  const raw =
  await response.text();

  if(
    !raw
  ){

    return {};

  }

  try{

    return JSON.parse(
      raw
    );

  }
  catch{

    return {

      ok:false,

      error:
      raw

    };

  }

}



// =====================================
// PROJECT SCAN
// =====================================

async function scanProject(){

  try{

    const response =
    await fetch(
      "/api/admin-project-scan",
      {

        credentials:
        "same-origin"

      }
    );

    const result =
    await parseResponse(
      response
    );

    if(
      !response.ok ||
      !result.ok
    ){

      throw new Error(
        result.error ||
        "ADMIN_PROJECT_SCAN_FAILED"
      );

    }

    githubProviderState.lastScanAt =
    Date.now();

    githubProviderState.lastResult =
    result;

    githubProviderState.lastError =
    null;

    return {

      ok:true,

      source:
      result.source,

      owner:
      result.owner,

      repo:
      result.repo,

      branch:
      result.branch,

      root:
      result.root,

      data:
      result.raw

    };

  }
  catch(error){

    githubProviderState.lastError =
    error;

    return {

      ok:false,

      error:
      error?.message ||
      String(error)

    };

  }

}



// =====================================
// WRITE REQUEST
// =====================================

async function executeWrite(
  body = {}
){

  try{

    const response =
    await fetch(
      "/api/admin-project-write",
      {

        method:
        "POST",

        credentials:
        "same-origin",

        headers:{

          "Content-Type":
          "application/json"

        },

        body:
        JSON.stringify(
          body
        )

      }
    );

    const result =
    await parseResponse(
      response
    );

    if(
      response.status === 401
    ){

      githubProviderState.authenticated =
      false;

    }

    if(
      !response.ok ||
      !result.ok
    ){

      throw new Error(
        result.error ||
        "ADMIN_PROJECT_WRITE_FAILED"
      );

    }

    githubProviderState.authenticated =
    true;

    githubProviderState.lastWriteAt =
    Date.now();

    githubProviderState.lastAction =
    body.action || null;

    githubProviderState.lastResult =
    result;

    githubProviderState.lastError =
    null;

    return result;

  }
  catch(error){

    githubProviderState.lastError =
    error;

    return {

      ok:false,

      error:
      error?.message ||
      String(error)

    };

  }

}



// =====================================
// CREATE FILE
// =====================================

async function createFile(
  path,
  content = "",
  message = null
){

  return executeWrite({

    action:
    "create-file",

    path,

    content,

    message

  });

}



// =====================================
// UPDATE FILE
// =====================================

async function updateFile(
  path,
  content = "",
  message = null
){

  return executeWrite({

    action:
    "update-file",

    path,

    content,

    message

  });

}



// =====================================
// DELETE FILE
// =====================================

async function deleteFile(
  path,
  message = null
){

  return executeWrite({

    action:
    "delete-file",

    path,

    message

  });

}



// =====================================
// MOVE FILE
// =====================================

async function moveFile(
  sourcePath,
  destinationPath,
  message = null
){

  return executeWrite({

    action:
    "move-file",

    sourcePath,

    destinationPath,

    message

  });

}



// =====================================
// READ FILE
// =====================================

async function readFile(path){
  try{
    const response=await fetch(
      "/api/admin-project-file?path=" + encodeURIComponent(String(path || "")),
      { credentials:"same-origin", cache:"no-store" }
    );
    const result=await parseResponse(response);
    if(response.status===401 || response.status===403){
      githubProviderState.authenticated=false;
    }
    if(!response.ok || !result.ok){
      throw new Error(result.error || "ADMIN_PROJECT_FILE_READ_FAILED");
    }
    githubProviderState.authenticated=true;
    githubProviderState.lastResult=result;
    githubProviderState.lastError=null;
    return result;
  }catch(error){
    githubProviderState.lastError=error;
    return {ok:false,error:error?.message || String(error)};
  }
}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    id:
    "github-provider",

    authenticated:
    githubProviderState.authenticated,

    lastScanAt:
    githubProviderState.lastScanAt,

    lastWriteAt:
    githubProviderState.lastWriteAt,

    lastAction:
    githubProviderState.lastAction,

    lastResult:
    githubProviderState.lastResult,

    lastError:
    githubProviderState.lastError
    ? githubProviderState.lastError.message ||
      String(githubProviderState.lastError)
    : null

  };

}



// =====================================
// API
// =====================================

const GitHubProvider =
Object.freeze({

  id:
  "github-provider",


  scanProject,

  readFile,

  createFile,

  updateFile,

  deleteFile,

  moveFile,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {


  scanProject,

  readFile,

  createFile,

  updateFile,

  deleteFile,

  moveFile,

  snapshot,

  GitHubProvider

};

export default
GitHubProvider;
