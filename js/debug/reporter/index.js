// =====================================
// RIGO AI
// REPORTER INDEX
// PUBLIC API
// =====================================

export {
  ReportBuilder,
  ReportSeverity
}
from "./report-builder.js";

export {
  JsonReport
}
from "./json-report.js";

export {
  HtmlReport
}
from "./html-report.js";

export {
  ExportReport
}
from "./export-report.js";



import {
  ReportBuilder
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



export default
Reporter;
