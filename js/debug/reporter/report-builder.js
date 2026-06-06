// =====================================
// RIGO AI
// REPORT BUILDER
// =====================================

const ReportSeverity =
Object.freeze({

  INFO:
  "info",

  SUCCESS:
  "success",

  WARNING:
  "warning",

  ERROR:
  "error",

  CRITICAL:
  "critical"

});



// =====================================
// CREATE ITEM
// =====================================

function createReportItem({

  title = "",

  message = "",

  severity =
  ReportSeverity.INFO,

  source = null,

  data = null

} = {}){

  return Object.freeze({

    id:

    crypto.randomUUID(),

    title,

    message,

    severity,

    source,

    data,

    timestamp:
    Date.now()

  });

}



// =====================================
// CREATE REPORT
// =====================================

function createReport({

  title =

  "RIGO Diagnostics Report",

  summary = "",

  items = []

} = {}){

  const report = {

    id:
    crypto.randomUUID(),

    title,

    summary,

    items,

    createdAt:
    Date.now()

  };

  return Object.freeze(
    report
  );

}



// =====================================
// HEALTH REPORT
// =====================================

function createHealthReport({

  healthScore = 100,

  warnings = 0,

  errors = 0,

  critical = 0

} = {}){

  const items = [];

  items.push(

    createReportItem({

      title:
      "Health Score",

      message:
      `${healthScore}%`,

      severity:

      healthScore >= 90

      ? ReportSeverity.SUCCESS

      : healthScore >= 70

      ? ReportSeverity.WARNING

      : ReportSeverity.ERROR

    })

  );

  if(
    warnings
  ){

    items.push(

      createReportItem({

        title:
        "Warnings",

        message:
        String(
          warnings
        ),

        severity:
        ReportSeverity
        .WARNING

      })

    );

  }

  if(
    errors
  ){

    items.push(

      createReportItem({

        title:
        "Errors",

        message:
        String(
          errors
        ),

        severity:
        ReportSeverity
        .ERROR

      })

    );

  }

  if(
    critical
  ){

    items.push(

      createReportItem({

        title:
        "Critical Issues",

        message:
        String(
          critical
        ),

        severity:
        ReportSeverity
        .CRITICAL

      })

    );

  }

  return createReport({

    title:
    "System Health Report",

    summary:

    `Health Score: ${healthScore}%`,

    items

  });

}



// =====================================
// API
// =====================================

export const ReportBuilder =
Object.freeze({

  createItem:
  createReportItem,

  create:
  createReport,

  health:
  createHealthReport

});



// =====================================
// EXPORTS
// =====================================

export {

  ReportSeverity

};

export default
ReportBuilder;
