// =====================================
// RIGO AI
// APP ENTRYPOINT
// =====================================



// =====================================
// BOOTSTRAP
// =====================================

async function bootstrapApplication(){

  try{

    await startApp();

  }

  catch(error){

    safeLogError(

      getSafeErrorMessage(
        error
      )

    );

  }

}



// =====================================
// START APPLICATION
// =====================================

if(
  typeof document !==
  "undefined"
){

  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(

      "DOMContentLoaded",

      bootstrapApplication,

      { once:true }

    );

  }

  else{

    bootstrapApplication();

  }

}
