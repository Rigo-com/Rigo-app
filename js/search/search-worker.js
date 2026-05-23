// =====================================
// RIGO AI
// SEARCH WORKER
// ENTERPRISE READY
// =====================================



const searchWorkerState =
Object.seal({

  enabled:false,

  activeJobs:0,

  completedJobs:0,

  failedJobs:0

});



async function executeSearchWorkerTask(
  task
){

  searchWorkerState
  .activeJobs++;

  try{

    const result =
    await task();

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
    .activeJobs--;

  }

}
