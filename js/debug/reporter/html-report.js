// =====================================
// RIGO AI
// HTML REPORTER
// =====================================

function createHtmlReport(
  report
){

  const items =

  (report.items || [])

  .map(item => `

<div class="report-item">

  <h3>
    ${item.title}
  </h3>

  <p>
    ${item.message}
  </p>

  <small>
    ${item.severity}
  </small>

</div>

`)

  .join("");



  return `

<div class="rigo-report">

  <h1>
    ${report.title}
  </h1>

  <p>
    ${report.summary}
  </p>

  ${items}

</div>

`;

}



// =====================================
// API
// =====================================

export const HtmlReport =
Object.freeze({

  create:
  createHtmlReport

});



// =====================================
// EXPORTS
// =====================================

export default
HtmlReport;
