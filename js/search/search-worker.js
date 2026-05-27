// =====================================
// RIGO AI
// SEARCH WORKER
// OPTIMIZED FINAL
// =====================================



// =====================================
// WORKER CONFIG
// =====================================

const SEARCH_WORKER_CONFIG =
Object.freeze({

  TASK_TIMEOUT:
  10000

});



// =====================================
// WORKER STATE
// =====================================

const searchWorkerState =
Object.seal({

  enabled:false,

  activeJobs:0,

  completedJobs:0,

  failedJobs:0,

  abortedJobs:0,

  lastJobAt:null

});



// =====================================
// EXECUTE WORKER TASK
// =====================================

async function executeSearchWorkerTask(
  task,
  timeout =
  SEARCH_WORKER_CONFIG
  .TASK_TIMEOUT
){

  if(
    typeof task !==
    "function"
  ){

    return null;

  }

  searchWorkerState
  .activeJobs++;

  searchWorkerState
  .lastJobAt =
  Date.now();

  try{

    const result =
    await Promise.race([

      Promise.resolve()
      .then(task),

      new Promise((_,reject) => {

        setTimeout(() => {

          reject(
            new Error(
              "SEARCH_TASK_TIMEOUT"
            )
          );

        },

        timeout);

      })

    ]);

    searchWorkerState
    .completedJobs++;

    return result;

  }

  catch(error){

    searchWorkerState
    .failedJobs++;

    return null;

  }

  finally{

    searchWorkerState
    .activeJobs =

    Math.max(

      0,

      searchWorkerState
      .activeJobs - 1

    );

  }

}



// =====================================
// ABORT WORKER TASK
// =====================================

function abortSearchWorkerTask(){

  searchWorkerState
  .abortedJobs++;

  return true;

}



// =====================================
// WORKER DIAGNOSTICS
// =====================================

function getSearchWorkerDiagnostics(){

  return {

    enabled:
    searchWorkerState
    .enabled,

    activeJobs:
    searchWorkerState
    .activeJobs,

    completedJobs:
    searchWorkerState
    .completedJobs,

    failedJobs:
    searchWorkerState
    .failedJobs,

    abortedJobs:
    searchWorkerState
    .abortedJobs,

    lastJobAt:
    searchWorkerState
    .lastJobAt

  };

}



// =====================================
// EXPORTS
// =====================================

export {

  SEARCH_WORKER_CONFIG,

  searchWorkerState,

  executeSearchWorkerTask,

  abortSearchWorkerTask,

  getSearchWorkerDiagnostics

};
