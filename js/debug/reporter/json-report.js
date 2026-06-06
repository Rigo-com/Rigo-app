// =====================================
// RIGO AI
// JSON REPORTER
// =====================================



// =====================================
// CREATE JSON
// =====================================

function createJsonReport(
  report
){

  try{

    return JSON.stringify(

      report,

      null,

      2

    );

  }

  catch(error){

    return JSON.stringify({

      error:
      error?.message,

      timestamp:
      Date.now()

    });

  }

}



// =====================================
// PARSE JSON
// =====================================

function parseJsonReport(
  json
){

  try{

    return JSON.parse(
      json
    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// VALIDATE
// =====================================

function validateJsonReport(
  report
){

  return Boolean(

    report &&

    typeof report ===
    "object" &&

    report.id &&

    report.title

  );

}



// =====================================
// API
// =====================================

export const JsonReport =
Object.freeze({

  create:
  createJsonReport,

  parse:
  parseJsonReport,

  validate:
  validateJsonReport

});



// =====================================
// EXPORTS
// =====================================

export default
JsonReport;
