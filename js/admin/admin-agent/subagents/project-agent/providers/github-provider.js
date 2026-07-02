// =====================================
// RIGO AI
// GITHUB PROJECT PROVIDER
// =====================================

const githubProviderState =
Object.seal({

  lastScanAt:
  null,

  lastError:
  null

});

async function scanProject(){

  try{

    const response =
    await fetch(
      "/api/admin-project-scan"
    );

    const result =
    await response.json();

    if(
      !response.ok ||
      !result.ok
    ){

      throw new Error(
        result.error ||
        "ADMIN_PROJECT_SCAN_FAILED"
      );

    }

    githubProviderState
    .lastScanAt =
    Date.now();

    return {

      ok:
      true,

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

function snapshot(){

  return {

    id:
    "github-provider",

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

  scanProject,

  snapshot

});

export {

  scanProject,

  snapshot,

  GitHubProvider

};

export default
GitHubProvider;
