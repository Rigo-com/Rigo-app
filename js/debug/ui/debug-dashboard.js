// =====================================
// RIGO AI
// DEBUG DASHBOARD
// =====================================

const dashboardState =
Object.seal({

  mounted:
  false,

  visible:
  false,

  container:
  null

});



// =====================================
// COLORS
// =====================================

const DashboardColors =
Object.freeze({

  SUCCESS:
  "#22c55e",

  WARNING:
  "#facc15",

  ERROR:
  "#ef4444",

  CRITICAL:
  "#991b1b",

  INFO:
  "#3b82f6",

  PANEL:
  "#111827",

  BORDER:
  "#374151",

  TEXT:
  "#f9fafb"

});



// =====================================
// CREATE
// =====================================

function createDashboard(){

  if(
    dashboardState
    .container
  ){

    return dashboardState
    .container;

  }

  const container =

    document
    .createElement(
      "div"
    );

  container.id =
  "rigo-debug-dashboard";

  container.style.cssText = `

position:fixed;
top:0;
right:0;
width:420px;
height:100vh;
overflow:auto;
z-index:999999;
background:${DashboardColors.PANEL};
color:${DashboardColors.TEXT};
border-left:1px solid ${DashboardColors.BORDER};
padding:16px;
font-family:monospace;
font-size:13px;
display:none;

`;

  dashboardState
  .container =
  container;

  document.body
  .appendChild(
    container
  );

  return container;

}



// =====================================
// STATUS BADGE
// =====================================

function createStatusBadge(

  label,

  color

){

  return `

<span
style="
padding:4px 8px;
border-radius:4px;
background:${color};
color:white;
font-size:12px;
">

${label}

</span>

`;

}



// =====================================
// RENDER
// =====================================

function renderDashboard(

  report = {}

){

  const dashboard =

    createDashboard();

  dashboard.innerHTML = `

<h2>
RIGO DEBUG
</h2>

<hr>

<div>

${createStatusBadge(

  "HEALTH",

  DashboardColors
  .SUCCESS

)}

&nbsp;

${report.healthScore ?? 100}%

</div>

<br>

<div>

Modules:
${report.modules ?? 0}

</div>

<div>

Warnings:
${report.warnings ?? 0}

</div>

<div>

Errors:
${report.errors ?? 0}

</div>

<div>

Critical:
${report.critical ?? 0}

</div>

<br>

<pre>

${JSON.stringify(

  report,

  null,

  2

)}

</pre>

`;

  return true;

}



// =====================================
// SHOW
// =====================================

function showDashboard(){

  const dashboard =

    createDashboard();

  dashboard.style.display =
  "block";

  dashboardState
  .visible =
  true;

  return true;

}



// =====================================
// HIDE
// =====================================

function hideDashboard(){

  if(
    !dashboardState
    .container
  ){

    return true;

  }

  dashboardState
  .container
  .style
  .display =
  "none";

  dashboardState
  .visible =
  false;

  return true;

}



// =====================================
// TOGGLE
// =====================================

function toggleDashboard(){

  return dashboardState
  .visible

  ? hideDashboard()

  : showDashboard();

}



// =====================================
// API
// =====================================

export const DebugDashboard =
Object.freeze({

  render:
  renderDashboard,

  show:
  showDashboard,

  hide:
  hideDashboard,

  toggle:
  toggleDashboard

});



// =====================================
// EXPORTS
// =====================================

export default
DebugDashboard;
