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

  try{

    return new Date(
      timestamp
    )
    .toLocaleString();

  }
  catch{

    return "Never";

  }

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

      <div class="rigo-dashboard-heading">
        <h1>
          Dashboard
        </h1>

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
          <span
            class="rigo-dashboard-button-icon"
            aria-hidden="true"
          >
            ↻
          </span>

          <span>
            ${loading ? "Refreshing..." : "Refresh"}
          </span>
        </button>

        <button
          type="button"
          class="rigo-dashboard-button primary"
          data-dashboard-action="scan-project"
          ${loading ? "disabled" : ""}
        >
          <span
            class="rigo-dashboard-button-icon"
            aria-hidden="true"
          >
            ⌕
          </span>

          <span>
            Scan Project
          </span>
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
    <div
      class="rigo-dashboard-error"
      role="alert"
    >
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

  const updatedAt =
  formatDateTime(
    state.lastUpdatedAt
  );

  return `
    <footer class="rigo-dashboard-footer">

      <span>
        RIGO AI Studio
      </span>

      <span
        class="rigo-dashboard-footer-separator"
        aria-hidden="true"
      >
        •
      </span>

      <span>
        ${
          state.loading
          ? "Updating dashboard..."
          : "All systems ready."
        }
      </span>

      <span
        class="rigo-dashboard-footer-time"
        title="${escapeHTML(updatedAt)}"
      >
        Last updated:
        ${escapeHTML(updatedAt)}
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

      <main class="rigo-dashboard-main">
        ${renderWidgets(data)}
      </main>

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
