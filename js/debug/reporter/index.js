// =====================================
// RIGO AI
// REPORTER INDEX
// PUBLIC API
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  ReportBuilder,
  ReportSeverity
}
from "./report-builder.js";

import {
  JsonReport
}
from "./json-report.js";

import {
  HtmlReport
}
from "./html-report.js";

import {
  ExportReport
}
from "./export-report.js";



// =====================================
// EXPORTS
// =====================================

export {

  ReportBuilder,

  ReportSeverity,

  JsonReport,

  HtmlReport,

  ExportReport

};



// =====================================
// DEFAULT API
// =====================================

const Reporter =
Object.freeze({

  builder:
  ReportBuilder,

  json:
  JsonReport,

  html:
  HtmlReport,

  export:
  ExportReport

});



// =====================================
// EXPORTS
// =====================================

export default
Reporter;
