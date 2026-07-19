// =====================================
// RIGO AI
// ADMIN AGENT
// UTILS
// =====================================



// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(
  value
){

  return String(
    value ?? ""
  )

  .replaceAll(
    "&",
    "&amp;"
  )

  .replaceAll(
    "<",
    "&lt;"
  )

  .replaceAll(
    ">",
    "&gt;"
  )

  .replaceAll(
    '"',
    "&quot;"
  )

  .replaceAll(
    "'",
    "&#039;"
  );

}



// =====================================
// FORMAT OUTPUT
// =====================================

function formatOutput(
  value
){

  if(
    typeof value ===
    "string"
  ){

    return escapeHTML(
      value
    );

  }

  try{

    return escapeHTML(

      JSON.stringify(

        value,

        null,

        2

      )

    );

  }

  catch{

    return escapeHTML(

      String(
        value
      )

    );

  }

}



// =====================================
// FORMAT TIME
// =====================================

function formatTime(
  value
){

  const date =

    value
    ? new Date(
        value
      )
    : new Date();

  if(

    Number.isNaN(

      date.getTime()

    )

  ){

    return "";

  }

  return date
  .toLocaleTimeString(
    [],
    {

      hour:
      "2-digit",

      minute:
      "2-digit"

    }
  );

}



// =====================================
// NORMALIZE ROLE
// =====================================

function normalizeRole(
  role
){

  switch(

    String(
      role || ""
    )
    .toLowerCase()

  ){

    case "user":

      return "user";

    case "system":

      return "system";

    case "error":

      return "error";

    default:

      return "assistant";

  }

}



// =====================================
// EXPORTS
// =====================================

export {

  escapeHTML,

  formatOutput,

  formatTime,

  normalizeRole

};

export default {

  escapeHTML,

  formatOutput,

  formatTime,

  normalizeRole

};
