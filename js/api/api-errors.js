// =====================================
// RIGO AI
// API ERRORS
// =====================================



// =====================================
// BASE ERROR
// =====================================

class APIError
extends Error{

  constructor(
    message = "API Error",
    code = "API_ERROR",
    details = null
  ){

    super(message);

    this.name =
    "APIError";

    this.code =
    code;

    this.details =
    details;

    this.timestamp =
    Date.now();

  }

}



// =====================================
// REQUEST ERROR
// =====================================

class APIRequestError
extends APIError{

  constructor(
    message = "Request Failed",
    code = "REQUEST_ERROR",
    details = null
  ){

    super(
      message,
      code,
      details
    );

    this.name =
    "APIRequestError";

  }

}



// =====================================
// NETWORK ERROR
// =====================================

class APINetworkError
extends APIError{

  constructor(
    message = "Network Error",
    details = null
  ){

    super(

      message,

      "NETWORK_ERROR",

      details

    );

    this.name =
    "APINetworkError";

  }

}



// =====================================
// TIMEOUT ERROR
// =====================================

class APITimeoutError
extends APIError{

  constructor(
    message = "Request Timeout",
    details = null
  ){

    super(

      message,

      "TIMEOUT_ERROR",

      details

    );

    this.name =
    "APITimeoutError";

  }

}



// =====================================
// ABORT ERROR
// =====================================

class APIAbortError
extends APIError{

  constructor(
    message = "Request Aborted",
    details = null
  ){

    super(

      message,

      "ABORT_ERROR",

      details

    );

    this.name =
    "APIAbortError";

  }

}



// =====================================
// VALIDATION ERROR
// =====================================

class APIValidationError
extends APIError{

  constructor(
    message = "Validation Failed",
    details = null
  ){

    super(

      message,

      "VALIDATION_ERROR",

      details

    );

    this.name =
    "APIValidationError";

  }

}



// =====================================
// EXPORTS
// =====================================

export {

  APIError,

  APIRequestError,

  APINetworkError,

  APITimeoutError,

  APIAbortError,

  APIValidationError

};
