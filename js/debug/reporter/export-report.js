// =====================================
// RIGO AI
// EXPORT REPORT
// =====================================

import JsonReport
from "./json-report.js";

import HtmlReport
from "./html-report.js";



// =====================================
// EXPORT JSON
// =====================================

function exportJsonReport(
  report
){

  const content =

    JsonReport
    .create(
      report
    );

  return {

    type:
    "application/json",

    filename:

    `report-${
      Date.now()
    }.json`,

    content

  };

}



// =====================================
// EXPORT HTML
// =====================================

function exportHtmlReport(
  report
){

  const content =

    HtmlReport
    .create(
      report
    );

  return {

    type:
    "text/html",

    filename:

    `report-${
      Date.now()
    }.html`,

    content

  };

}



// =====================================
// DOWNLOAD
// =====================================

function downloadReport(
  exported
){

  const blob =

    new Blob(

      [
        exported
        .content
      ],

      {

        type:
        exported
        .type

      }

    );

  const url =

    URL
    .createObjectURL(
      blob
    );

  const link =

    document
    .createElement(
      "a"
    );

  link.href =
  url;

  link.download =
  exported
  .filename;

  document.body
  .appendChild(
    link
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(
    url
  );

  return true;

}



// =====================================
// API
// =====================================

export const ExportReport =
Object.freeze({

  json:
  exportJsonReport,

  html:
  exportHtmlReport,

  download:
  downloadReport

});



// =====================================
// EXPORTS
// =====================================

export default
ExportReport;
