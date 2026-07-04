// =====================================
// RIGO AI
// STUDIO DASHBOARD LAYOUT
// =====================================

import {
  escapeHTML,
  renderWidgets
}
from "./dashboard-widgets.js";



// =====================================
// FORMATTERS
// =====================================

function formatDateTime(
  timestamp
){

  if(
    !timestamp
  ){

    return "Never";

  }

  return new Date(
    timestamp
  )
  .toLocaleString();

}



// =====================================
// HEADER
// =====================================

function renderHeader(
  state = {}
){

  const loading =
  Boolean(
    state.loading
  );

  return `
    <header class="rigo-dashboard-header">
      <div>
        <h1>Dashboard</h1>
        <p>
          RIGO Studio control center for project, agents, debug, and runtime status.
        </p>
      </div>

      <div class="rigo-dashboard-actions">
        <button
          type="button"
          class="rigo-dashboard-button"
          data-dashboard-action="refresh"
          ${loading ? "disabled" : ""}
        >
          ${loading ? "Refreshing..." : "Refresh"}
        </button>

        <button
          type="button"
          class="rigo-dashboard-button primary"
          data-dashboard-action="scan-project"
          ${loading ? "disabled" : ""}
        >
          Scan Project
        </button>
      </div>
    </header>
  `;

}



// =====================================
// ERROR
// =====================================

function renderError(
  error
){

  if(
    !error
  ){

    return "";

  }

  const message =
  error?.message ||
  String(error);

  return `
    <div class="rigo-dashboard-error">
      ${escapeHTML(message)}
    </div>
  `;

}



// =====================================
// FOOTER
// =====================================

function renderFooter(
  state = {}
){

  return `
    <footer class="rigo-dashboard-footer">
      <span>
        Last updated:
        ${escapeHTML(formatDateTime(state.lastUpdatedAt))}
      </span>
    </footer>
  `;

}



// =====================================
// LAYOUT
// =====================================

function renderLayout(
  state = {}
){

  const data =
  state.data || {};

  return `
    <div class="rigo-dashboard-page">
      ${renderHeader(state)}
      ${renderError(state.error)}
      ${renderWidgets(data)}
      ${renderFooter(state)}
    </div>
  `;

}



// =====================================
// EXPORTS
// =====================================

export {

  formatDateTime,

  renderHeader,

  renderError,

  renderFooter,

  renderLayout

};

export default
renderLayout;
