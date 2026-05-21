function executeInSandbox(
  callback
){

  if(
    typeof callback !==
    "function"
  ){

    return null;

  }

  try{

    return callback();

  }

  catch(error){

    logSecurityEvent(
      "SANDBOX EXECUTION FAILED"
    );

    return null;

  }

}
