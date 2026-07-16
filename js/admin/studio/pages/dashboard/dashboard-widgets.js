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
  Number(
    value || 0
  );

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



function formatDateTime(
  value
){

  if(
    !value
  ){

    return "-";

  }

  try{

    return new Date(
      value
    )
    .toLocaleString();

  }
  catch{

    return "-";

  }

}



// =====================================
// VALUE HELPERS
// =====================================

function getBooleanLabel(
  value
){

  return value
  ? "YES"
  : "NO";

}



function getStatusClass(
  value
){

  const normalized =
  String(
    value || ""
  )
  .trim()
  .toLowerCase();

  if(
    normalized === "connected" ||
    normalized === "ready" ||
    normalized === "healthy" ||
    normalized === "available" ||
    normalized === "online" ||
    normalized === "completed"
  ){

    return "success";

  }

  if(
    normalized === "waiting" ||
    normalized === "waiting-for-scan" ||
    normalized === "pending" ||
    normalized === "not-indexed" ||
    normalized === "unknown"
  ){

    return "warning";

  }

  if(
    normalized === "missing" ||
    normalized === "failed" ||
    normalized === "error" ||
    normalized === "unavailable" ||
    normalized === "offline"
  ){

    return "danger";

  }

  return "muted";

}



// =====================================
// STYLES
// =====================================

function renderDashboardStyles(){

  return `
    <style>
      .rigo-dashboard-page{
        width:100%;
        min-height:100%;
        padding:22px;
        color:#f8fafc;
        background:
          radial-gradient(
            circle at 15% 0%,
            rgba(16,185,129,.05),
            transparent 28%
          ),
          #020817;
        font-family:
          Inter,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
      }

      .rigo-dashboard-header{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:20px;
        margin-bottom:18px;
      }

      .rigo-dashboard-header h1{
        margin:0 0 6px;
        color:#f8fafc;
        font-size:32px;
        line-height:1.1;
        font-weight:800;
        letter-spacing:-.6px;
      }

      .rigo-dashboard-header p{
        margin:0;
        color:#cbd5e1;
        font-size:14px;
        line-height:1.6;
      }

      .rigo-dashboard-actions{
        display:flex;
        align-items:center;
        gap:10px;
        flex-wrap:wrap;
      }

      .rigo-dashboard-button{
        min-height:38px;
        padding:0 16px;
        border:1px solid rgba(16,185,129,.35);
        border-radius:9px;
        color:#34d399;
        background:rgba(6,78,59,.18);
        font-size:13px;
        font-weight:700;
        cursor:pointer;
        transition:
          background .18s ease,
          border-color .18s ease,
          transform .18s ease;
      }

      .rigo-dashboard-button:hover:not(:disabled){
        background:rgba(6,95,70,.32);
        border-color:rgba(52,211,153,.6);
        transform:translateY(-1px);
      }

      .rigo-dashboard-button.primary{
        color:#38bdf8;
        border-color:rgba(14,165,233,.42);
        background:rgba(3,105,161,.16);
      }

      .rigo-dashboard-button.primary:hover:not(:disabled){
        background:rgba(3,105,161,.28);
        border-color:rgba(56,189,248,.65);
      }

      .rigo-dashboard-button:disabled{
        opacity:.55;
        cursor:not-allowed;
      }

      .rigo-dashboard-error{
        margin-bottom:16px;
        padding:12px 14px;
        border:1px solid rgba(248,113,113,.32);
        border-radius:10px;
        color:#fca5a5;
        background:rgba(127,29,29,.16);
        font-size:13px;
      }

      .rigo-dashboard-content{
        display:flex;
        flex-direction:column;
        gap:14px;
      }

      .rigo-dashboard-metrics{
        display:grid;
        grid-template-columns:
          repeat(
            6,
            minmax(0,1fr)
          );
        gap:14px;
      }

      .rigo-dashboard-metric-card{
        position:relative;
        min-width:0;
        min-height:108px;
        padding:17px 18px 14px;
        overflow:hidden;
        border:1px solid rgba(148,163,184,.16);
        border-radius:14px;
        background:
          linear-gradient(
            145deg,
            rgba(15,28,47,.96),
            rgba(8,17,31,.96)
          );
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.025),
          0 12px 32px rgba(0,0,0,.18);
      }

      .rigo-dashboard-metric-main{
        display:flex;
        align-items:center;
        gap:14px;
      }

      .rigo-dashboard-metric-icon{
        flex:0 0 auto;
        width:44px;
        height:44px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:11px;
        font-size:29px;
        line-height:1;
        background:rgba(15,23,42,.76);
        box-shadow:
          inset 0 0 0 1px rgba(255,255,255,.035);
      }

      .rigo-dashboard-metric-value{
        min-width:0;
      }

      .rigo-dashboard-metric-value strong{
        display:block;
        color:#f8fafc;
        font-size:28px;
        line-height:1;
        font-weight:800;
      }

      .rigo-dashboard-metric-value span{
        display:block;
        margin-top:7px;
        color:#cbd5e1;
        font-size:13px;
        white-space:nowrap;
      }

      .rigo-dashboard-metric-line{
        position:absolute;
        right:17px;
        bottom:13px;
        left:17px;
        height:4px;
        border-radius:999px;
        background:var(
          --metric-color,
          #38bdf8
        );
        box-shadow:
          0 0 14px
          color-mix(
            in srgb,
            var(--metric-color,#38bdf8) 45%,
            transparent
          );
      }

      .rigo-dashboard-panels{
        display:grid;
        grid-template-columns:
          1.05fr
          1fr
          1fr;
        gap:14px;
      }

      .rigo-dashboard-widget{
        min-width:0;
        padding:17px;
        border:1px solid rgba(148,163,184,.16);
        border-radius:14px;
        background:
          linear-gradient(
            145deg,
            rgba(15,28,47,.96),
            rgba(8,17,31,.96)
          );
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.025),
          0 12px 32px rgba(0,0,0,.18);
      }

      .rigo-dashboard-widget-header{
        display:flex;
        align-items:flex-start;
        gap:10px;
        margin-bottom:10px;
      }

      .rigo-dashboard-widget-icon{
        flex:0 0 auto;
        width:28px;
        min-width:28px;
        display:flex;
        justify-content:center;
        color:#34d399;
        font-size:22px;
        line-height:1.2;
      }

      .rigo-dashboard-widget-header h3{
        margin:0;
        color:#f8fafc;
        font-size:17px;
        line-height:1.3;
        font-weight:800;
      }

      .rigo-dashboard-widget-header p{
        margin:6px 0 0;
        color:#cbd5e1;
        font-size:12px;
        line-height:1.5;
      }

      .rigo-dashboard-widget-body{
        margin-top:14px;
      }

      .rigo-dashboard-status-list{
        display:flex;
        flex-direction:column;
        gap:14px;
      }

      .rigo-dashboard-status-row{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:16px;
        min-width:0;
      }

      .rigo-dashboard-status-row > span:first-child{
        color:#e2e8f0;
        font-size:13px;
      }

      .rigo-dashboard-status-value{
        max-width:62%;
        overflow:hidden;
        color:#f8fafc;
        font-size:13px;
        font-weight:700;
        text-overflow:ellipsis;
        white-space:nowrap;
        text-align:right;
      }

      .rigo-dashboard-status-value.success{
        color:#34d399;
      }

      .rigo-dashboard-status-value.warning{
        color:#facc15;
      }

      .rigo-dashboard-status-value.danger{
        color:#fb7185;
      }

      .rigo-dashboard-status-value.muted{
        color:#94a3b8;
      }

      .rigo-dashboard-status-dot{
        display:inline-block;
        width:9px;
        height:9px;
        margin-right:7px;
        border-radius:50%;
        background:#facc15;
        box-shadow:0 0 10px rgba(250,204,21,.7);
      }

      .rigo-dashboard-debug{
        grid-column:1 / -1;
      }

      .rigo-dashboard-debug-grid{
        display:grid;
        grid-template-columns:
          repeat(
            6,
            minmax(0,1fr)
          );
        margin-top:10px;
      }

      .rigo-dashboard-debug-item{
        min-width:0;
        padding:2px 15px;
        border-right:1px solid rgba(148,163,184,.25);
        text-align:center;
      }

      .rigo-dashboard-debug-item:last-child{
        border-right:none;
      }

      .rigo-dashboard-debug-item span{
        display:block;
        margin-bottom:10px;
        overflow:hidden;
        color:#e2e8f0;
        font-size:12px;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .rigo-dashboard-debug-item strong{
        display:block;
        font-size:24px;
        line-height:1;
        font-weight:800;
      }

      .rigo-dashboard-debug-item.red strong{
        color:#fb7185;
      }

      .rigo-dashboard-debug-item.yellow strong{
        color:#facc15;
      }

      .rigo-dashboard-debug-item.purple strong{
        color:#c084fc;
      }

      .rigo-dashboard-debug-item.blue strong{
        color:#38bdf8;
      }

      .rigo-dashboard-debug-item.green strong{
        color:#a3e635;
      }

      .rigo-dashboard-footer{
        display:flex;
        justify-content:flex-end;
        margin-top:16px;
        color:#64748b;
        font-size:11px;
      }

      @media(max-width:1250px){

        .rigo-dashboard-metrics{
          grid-template-columns:
            repeat(
              3,
              minmax(0,1fr)
            );
        }

        .rigo-dashboard-panels{
          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );
        }

        .rigo-dashboard-panels
        .rigo-dashboard-widget:last-child{
          grid-column:1 / -1;
        }

      }

      @media(max-width:780px){

        .rigo-dashboard-page{
          padding:14px;
        }

        .rigo-dashboard-header{
          flex-direction:column;
        }

        .rigo-dashboard-header h1{
          font-size:27px;
        }

        .rigo-dashboard-metrics{
          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );
        }

        .rigo-dashboard-panels{
          grid-template-columns:
            1fr;
        }

        .rigo-dashboard-panels
        .rigo-dashboard-widget:last-child{
          grid-column:auto;
        }

        .rigo-dashboard-debug-grid{
          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );
          row-gap:20px;
        }

        .rigo-dashboard-debug-item{
          border-right:none;
        }

      }

      @media(max-width:480px){

        .rigo-dashboard-metrics{
          grid-template-columns:
            1fr;
        }

        .rigo-dashboard-actions{
          width:100%;
        }

        .rigo-dashboard-button{
          flex:1;
        }

      }
    </style>
  `;

}



// =====================================
// STATUS ROW
// =====================================

function createStatusRow(
  label,
  value,
  status = "muted",
  options = {}
){

  const dot =
  options.dot
  ? `<span class="rigo-dashboard-status-dot"></span>`
  : "";

  return `
    <div class="rigo-dashboard-status-row">
      <span>
        ${escapeHTML(label)}
      </span>

      <strong
        class="
          rigo-dashboard-status-value
          ${escapeHTML(status)}
        "
      >
        ${dot}${escapeHTML(value)}
      </strong>
    </div>
  `;

}



// =====================================
// METRIC CARD
// =====================================

function createMetricCard(
  options = {}
){

  const value =
  options.raw === true
  ? escapeHTML(
      options.value
    )
  : formatNumber(
      options.value
    );

  return `
    <article
      class="rigo-dashboard-metric-card"
      style="
        --metric-color:
        ${escapeHTML(options.color || "#38bdf8")};
      "
    >
      <div class="rigo-dashboard-metric-main">
        <div class="rigo-dashboard-metric-icon">
          ${options.icon || "📊"}
        </div>

        <div class="rigo-dashboard-metric-value">
          <strong>${value}</strong>
          <span>${escapeHTML(options.label || "")}</span>
        </div>
      </div>

      <div class="rigo-dashboard-metric-line"></div>
    </article>
  `;

}



// =====================================
// BASE WIDGET
// =====================================

function createWidget(
  options = {}
){

  return `
    <section
      class="
        rigo-dashboard-widget
        ${options.className || ""}
      "
      data-widget="${escapeHTML(options.id || "")}"
    >
      <div class="rigo-dashboard-widget-header">
        <span class="rigo-dashboard-widget-icon">
          ${options.icon || ""}
        </span>

        <div>
          <h3>
            ${escapeHTML(options.title || "Widget")}
          </h3>

          ${
            options.subtitle
            ? `
              <p>
                ${escapeHTML(options.subtitle)}
              </p>
            `
            : ""
          }
        </div>
      </div>

      <div class="rigo-dashboard-widget-body">
        ${options.body || ""}
      </div>
    </section>
  `;

}



// =====================================
// METRICS
// =====================================

function renderMetricCards(
  data = {}
){

  const memory =
  data.memory || {};

  return `
    <div class="rigo-dashboard-metrics">

      ${createMetricCard({
        icon:"📁",
        label:"Files",
        value:data.files,
        color:"#249cff"
      })}

      ${createMetricCard({
        icon:"📂",
        label:"Folders",
        value:data.folders,
        color:"#facc15"
      })}

      ${createMetricCard({
        icon:"💻",
        label:"Systems",
        value:data.systems,
        color:"#a855f7"
      })}

      ${createMetricCard({
        icon:"⚙️",
        label:"Agents",
        value:data.agents,
        color:"#ec4899"
      })}

      ${createMetricCard({
        icon:"</>",
        label:"Code Imports",
        value:data.imports,
        color:"#84cc16"
      })}

      ${createMetricCard({
        icon:"🗄️",
        label:"Memory",
        value:
        memory.available
        ? (
          memory.usage ??
          memory.entries ??
          0
        )
        : "N/A",
        raw:true,
        color:"#0ea5e9"
      })}

    </div>
  `;

}



// =====================================
// PROJECT OVERVIEW
// =====================================

function createProjectOverviewWidget(
  data = {}
){

  const project =
  data.project || {};

  const projectName =
  project.name ||
  project.fullName ||
  project.full_name ||
  "RIGO AI";

  const projectPath =
  project.path ||
  project.root ||
  "/";

  const indexStatus =
  project.indexStatus ||
  project.status ||
  (
    data.files > 0
    ? "indexed"
    : "not-indexed"
  );

  return createWidget({

    id:
    "project-overview",

    icon:
    "📄",

    title:
    "Project Overview",

    subtitle:
    "Project index and repository overview.",

    body:
    `
      <div class="rigo-dashboard-status-list">
        ${createStatusRow(
          "Project Name",
          projectName
        )}

        ${createStatusRow(
          "Project Path",
          projectPath
        )}

        ${createStatusRow(
          "Index Status",
          formatStatus(indexStatus),
          getStatusClass(indexStatus),
          {
            dot:true
          }
        )}

        ${createStatusRow(
          "Last Updated",
          formatDateTime(
            project.updatedAt ||
            data.lastUpdatedAt
          ),
          "muted"
        )}
      </div>
    `

  });

}



// =====================================
// GITHUB
// =====================================

function createGitHubWidget(
  data = {}
){

  const github =
  data.github || {};

  const status =
  github.status ||
  github.connection ||
  "waiting-for-scan";

  return createWidget({

    id:
    "github-status",

    icon:
    "●",

    title:
    "GitHub Status",

    subtitle:
    "Repository provider connection.",

    body:
    `
      <div class="rigo-dashboard-status-list">
        ${createStatusRow(
          "Provider",
          github.provider ||
          "GitHub"
        )}

        ${createStatusRow(
          "Connection",
          formatStatus(status),
          getStatusClass(status)
        )}

        ${createStatusRow(
          "Connected",
          getBooleanLabel(
            github.connected
          ),
          github.connected
          ? "success"
          : "danger"
        )}

        ${createStatusRow(
          "Repository",
          github.repository ||
          github.repo ||
          "-"
        )}

        ${createStatusRow(
          "Last Scan",
          formatDateTime(
            github.lastScanAt
          ),
          "muted"
        )}
      </div>
    `

  });

}



// =====================================
// MEMORY
// =====================================

function createMemoryWidget(
  data = {}
){

  const memory =
  data.memory || {};

  const status =
  memory.status ||
  (
    memory.available
    ? "available"
    : "missing"
  );

  return createWidget({

    id:
    "memory-status",

    icon:
    "🧠",

    title:
    "Memory Status",

    subtitle:
    "Memory subsystem availability.",

    body:
    `
      <div class="rigo-dashboard-status-list">
        ${createStatusRow(
          "Status",
          formatStatus(status),
          getStatusClass(status)
        )}

        ${createStatusRow(
          "Available",
          getBooleanLabel(
            memory.available
          ),
          memory.available
          ? "success"
          : "danger"
        )}

        ${createStatusRow(
          "Last Sync",
          formatDateTime(
            memory.lastSyncAt
          ),
          "muted"
        )}

        ${createStatusRow(
          "Usage",
          memory.usage ??
          memory.entries ??
          "-",
          "muted"
        )}
      </div>
    `

  });

}



// =====================================
// DEBUG
// =====================================

function createDebugWidget(
  data = {}
){

  const debug =
  data.debug || {};

  return createWidget({

    id:
    "debug-status",

    className:
    "rigo-dashboard-debug",

    icon:
    "🐞",

    title:
    "Debug Status",

    subtitle:
    "Runtime and system debug overview.",

    body:
    `
      <div class="rigo-dashboard-debug-grid">

        <div class="rigo-dashboard-debug-item red">
          <span>Runtime Errors</span>
          <strong>
            ${formatNumber(
              debug.runtimeErrors
            )}
          </strong>
        </div>

        <div class="rigo-dashboard-debug-item red">
          <span>Console Errors</span>
          <strong>
            ${formatNumber(
              debug.consoleErrors
            )}
          </strong>
        </div>

        <div class="rigo-dashboard-debug-item yellow">
          <span>Warnings</span>
          <strong>
            ${formatNumber(
              debug.warnings
            )}
          </strong>
        </div>

        <div class="rigo-dashboard-debug-item purple">
          <span>Memory Issues</span>
          <strong>
            ${formatNumber(
              debug.memoryIssues
            )}
          </strong>
        </div>

        <div class="rigo-dashboard-debug-item blue">
          <span>Performance Issues</span>
          <strong>
            ${formatNumber(
              debug.performanceIssues
            )}
          </strong>
        </div>

        <div class="rigo-dashboard-debug-item green">
          <span>Network Issues</span>
          <strong>
            ${formatNumber(
              debug.networkIssues
            )}
          </strong>
        </div>

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
    ${renderDashboardStyles()}

    <div class="rigo-dashboard-content">

      ${renderMetricCards(data)}

      <div class="rigo-dashboard-panels">
        ${createProjectOverviewWidget(data)}
        ${createGitHubWidget(data)}
        ${createMemoryWidget(data)}
      </div>

      ${createDebugWidget(data)}

    </div>
  `;

}



// =====================================
// LEGACY HELPERS
// =====================================

function createMetric(
  label,
  value,
  hint = ""
){

  return `
    <div class="rigo-dashboard-status-row">
      <span>
        ${escapeHTML(label)}
      </span>

      <strong class="rigo-dashboard-status-value">
        ${formatNumber(value)}
        ${
          hint
          ? `
            <small>
              ${escapeHTML(hint)}
            </small>
          `
          : ""
        }
      </strong>
    </div>
  `;

}



function createStatusPill(
  status
){

  const normalized =
  String(
    status || "unknown"
  );

  return `
    <strong
      class="
        rigo-dashboard-status-value
        ${getStatusClass(normalized)}
      "
    >
      ${escapeHTML(
        formatStatus(normalized)
      )}
    </strong>
  `;

}



function createCodeMapWidget(
  data = {}
){

  return createWidget({

    id:
    "code-map",

    icon:
    "</>",

    title:
    "Code Map",

    subtitle:
    "Imports, exports, and relationships.",

    body:
    `
      <div class="rigo-dashboard-status-list">
        ${createStatusRow(
          "Imports",
          formatNumber(
            data.imports
          )
        )}

        ${createStatusRow(
          "Exports",
          formatNumber(
            data.exports
          )
        )}

        ${createStatusRow(
          "Relationships",
          formatNumber(
            data.relationships
          )
        )}
      </div>
    `

  });

}



function createActivityWidget(){

  return createWidget({

    id:
    "recent-activity",

    icon:
    "◷",

    title:
    "Recent Activity",

    subtitle:
    "Studio activity stream.",

    body:
    `
      <div class="rigo-dashboard-status-value muted">
        No activity events loaded yet.
      </div>
    `

  });

}



// =====================================
// EXPORTS
// =====================================

export {

  escapeHTML,

  formatNumber,

  formatStatus,

  renderDashboardStyles,

  createWidget,

  createMetric,

  createMetricCard,

  createStatusPill,

  createStatusRow,

  createProjectOverviewWidget,

  createCodeMapWidget,

  createGitHubWidget,

  createMemoryWidget,

  createDebugWidget,

  createActivityWidget,

  renderMetricCards,

  renderWidgets

};

export default
renderWidgets;
