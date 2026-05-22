// =====================================
// SANDBOX EXECUTION
// =====================================

async function executeInSandbox(
  callback,
  options = {}
){

  if(
    typeof callback !==
    "function"
  ){

    return null;

  }

  const timeout =

    Number.isFinite(
      options.timeout
    )

    &&

    options.timeout > 0

    ?

    options.timeout

    :

    5000;

  const executionId =
  generateSecureRandomId();

  const startedAt =
  Date.now();

  let timeoutId =
  null;

  let completed =
  false;

  try{

    const timeoutPromise =
    new Promise((_,reject) => {

      timeoutId =
      setTimeout(() => {

        reject(

          new Error(
            "SANDBOX_TIMEOUT"
          )

        );

      },timeout);

    });

    const executionPromise =
    Promise.resolve()
    .then(() => {

      return callback();

    });

    const result =
    await Promise.race([

      executionPromise,

      timeoutPromise

    ]);

    completed = true;

    return deepFreezeSecurity({

      success:true,

      executionId,

      duration:

        Date.now() -
        startedAt,

      result

    });

  }

  catch(error){

    logSecurityEvent(

      "SANDBOX EXECUTION FAILED",

      {

        executionId,

        message:

          safeString(
            error?.message
          )

      }

    );

    return deepFreezeSecurity({

      success:false,

      executionId,

      duration:

        Date.now() -
        startedAt,

      timedOut:

        error?.message ===
        "SANDBOX_TIMEOUT"

    });

  }

  finally{

    if(timeoutId){

      clearTimeout(
        timeoutId
      );

    }

    if(!completed){

      logSecurityEvent(

        "SANDBOX EXECUTION INCOMPLETE",

        {

          executionId

        }

      );

    }

  }

}
