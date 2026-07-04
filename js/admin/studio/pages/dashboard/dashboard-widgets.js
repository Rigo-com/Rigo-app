// =====================================
// RIGO AI
// STUDIO DASHBOARD WIDGETS
// =====================================



// =====================================
// FORMATTERS
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



function formatNumber(
  value
){

  const number =
  Number(value || 0);

  return number
  .toLocaleString(
    "en-US"
  );

}



function formatStatus(
  value
){

  return String(
    value || "unknown"
  )
  .replaceAll(
    "-",
    " "
  )
  .toUpperCase();

}



// =====================================
// BASE WIDGET
// =====================================

function createWidget(
  options = {}
){

  const title =
  escapeHTML(
    options.title || "Widget"
  );

  const subtitle =
  escapeHTML(
    options.subtitle || ""
  );

  const body =
  options.body || "";

  const footer =
  options.footer || "";

  return `
    <section
      class="rigo-dashboard-widget"
      data-widget="${escapeHTML(options.id || title)}"
    >
      <div class="rigo-dashboard-widget-header">
        <div>
          <h3>${title}</h3>
          ${
            subtitle
            ? `<p>${subtitle}</p>`
            : ""
          }
        </div>
      </div>

      <div class="rigo-dashboard-widget-body">
        ${body}
      </div>

      ${
        footer
        ? `
          <div class="rigo-dashboard-widget-footer">
            ${footer}
          </div>
        `
        : ""
      }
    </section>
  `;

}



// =====================================
// METRIC
// =====================================

function createMetric(
  label,
  value,
  hint = ""
){

  return `
    <div class="rigo-dashboard-metric">
      <span>${escapeHTML(label)}</span>
      <strong>${formatNumber(value)}</strong>
      ${
        hint
        ? `<small>${escapeHTML(hint)}</small>`
        : ""
      }
    </div>
  `;

}



// =====================================
// STATUS PILL
// =====================================

function createStatusPill(
  status
){

  const normalized =
  String(
    status || "unknown"
  );

  const safeStatus =
  escapeHTML(
    normalized
  );

  return `
    <span
      class="rigo-dashboard-status-pill"
      data-status="${safeStatus}"
    >
      ${formatStatus(normalized)}
    </span>
  `;

}



// =====================================
// WIDGETS
// =====================================

function createProjectOverviewWidget(
  data = {}
){

  const project =
  data.project || {};

  const name =
  project.name ||
  project.fullName ||
  project.full_name ||
  "RIGO AI";

  const description =
  project.description ||
  "Project index and repository overview.";

  return createWidget({

    id:"project-overview",

    title:"Project Overview",

    subtitle:
    description,

    body:
    `
      <div class="rigo-dashboard-project-title">
        ${escapeHTML(name)}
      </div>

      <div class="rigo-dashboard-metric-grid">
        ${createMetric("Files", data.files)}
        ${createMetric("Folders", data.folders)}
        ${createMetric("Systems", data.systems)}
        ${createMetric("Agents", data.agents)}
      </div>
    `

  });

}



function createCodeMapWidget(
  data = {}
){

  return createWidget({

    id:"code-map",

    title:"Code Map",

    subtitle:"Imports, exports, and relationships extracted from the project index.",

    body:
    `
      <div class="rigo-dashboard-metric-grid">
        ${createMetric("Imports", data.imports)}
        ${createMetric("Exports", data.exports)}
        ${createMetric("Relationships", data.relationships)}
      </div>
    `

  });

}



function createGitHubWidget(
  data = {}
){

  const github =
  data.github || {};

  return createWidget({

    id:"github-status",

    title:"GitHub Status",

    subtitle:"Repository provider connection.",

    body:
    `
      <div class="rigo-dashboard-status-row">
        <span>Connection</span>
        ${createStatusPill(github.status)}
      </div>

      <div class="rigo-dashboard-status-row">
        <span>Connected</span>
        <strong>${github.connected ? "YES" : "NO"}</strong>
      </div>
    `

  });

}



function createMemoryWidget(
  data = {}
){

  const memory =
  data.memory || {};

  return createWidget({

    id:"memory-status",

    title:"Memory Status",

    subtitle:"Memory subsystem availability.",

    body:
    `
      <div class="rigo-dashboard-status-row">
        <span>Status</span>
        ${createStatusPill(memory.status)}
      </div>

      <div class="rigo-dashboard-status-row">
        <span>Available</span>
        <strong>${memory.available ? "YES" : "NO"}</strong>
      </div>
    `

  });

}



function createDebugWidget(
  data = {}
){

  const debug =
  data.debug || {};

  return createWidget({

    id:"debug-status",

    title:"Debug Status",

    subtitle:"Debug and diagnostics subsystem.",

    body:
    `
      <div class="rigo-dashboard-status-row">
        <span>Status</span>
        ${createStatusPill(debug.status)}
      </div>

      <div class="rigo-dashboard-status-row">
        <span>Available</span>
        <strong>${debug.available ? "YES" : "NO"}</strong>
      </div>
    `

  });

}



function createActivityWidget(){

  return createWidget({

    id:"recent-activity",

    title:"Recent Activity",

    subtitle:"Studio activity stream placeholder.",

    body:
    `
      <div class="rigo-dashboard-empty">
        No activity events loaded yet.
      </div>
    `

  });

}



// =====================================
// RENDER
// =====================================

function renderWidgets(
  data = {}
){

  return `
    <div class="rigo-dashboard-widgets">
      ${createProjectOverviewWidget(data)}
      ${createGitHubWidget(data)}
      ${createCodeMapWidget(data)}
      ${createMemoryWidget(data)}
      ${createDebugWidget(data)}
      ${createActivityWidget(data)}
    </div>
  `;

}



// =====================================
// EXPORTS
// =====================================

export {

  escapeHTML,

  formatNumber,

  formatStatus,

  createWidget,

  createMetric,

  createStatusPill,

  createProjectOverviewWidget,

  createCodeMapWidget,

  createGitHubWidget,

  createMemoryWidget,

  createDebugWidget,

  createActivityWidget,

  renderWidgets

};

export default
renderWidgets;
