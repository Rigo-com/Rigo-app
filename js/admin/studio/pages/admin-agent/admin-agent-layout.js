// =====================================
// RIGO AI
// STUDIO ADMIN AGENT LAYOUT
// =====================================

import AdminAgentIcons
from "./admin-agent-icons.js";

import mountStyle
from "./admin-agent-style.js";

import {

  escapeHTML

}
from "./admin-agent-utils.js";

import {

  renderMessages,

  renderLoadingLabel

}
from "./admin-agent-messages.js";

import renderActionList
from "./admin-agent-action-list.js";

import renderPendingChanges
from "./admin-agent-pending.js";



// =====================================
// RENDER HEADER
// =====================================

function renderHeader(
  admin = {}
){

  const available =
  Boolean(
    admin.available
  );

  const status =
  String(
    admin.status ||
    "unknown"
  );

  return `
    <header class="rigo-admin-agent-header">

      <div class="rigo-admin-agent-identity">

        <div
          class="rigo-admin-agent-avatar"
          aria-hidden="true"
        >
          ${AdminAgentIcons.admin}
        </div>

        <div class="rigo-admin-agent-heading">

          <div class="rigo-admin-agent-title-line">

            <h1>
              Admin Agent
            </h1>

            <span
              class="rigo-admin-agent-shield"
              aria-hidden="true"
            >
              ${AdminAgentIcons.shield}
            </span>

          </div>

          <p class="rigo-admin-agent-description">
            Private command console connected to RIGO Admin Agent.
          </p>

          <span
            class="rigo-admin-agent-status"
            data-available="${available}"
            data-status="${escapeHTML(status)}"
          >
            ${
              available
              ? "ADMIN CONNECTED"
              : "ADMIN MISSING"
            }
          </span>

        </div>

      </div>

      <div class="rigo-admin-agent-access">

        <span
          class="rigo-admin-agent-access-icon"
          aria-hidden="true"
        >
          ${AdminAgentIcons.shield}
        </span>

        <span>
          Private Admin Access
        </span>

      </div>

    </header>
  `;

}



// =====================================
// RENDER QUICK ACTIONS
// =====================================

function renderQuickActions(
  loading = false
){

  return `
    <section
      class="rigo-admin-agent-quick-actions"
      aria-label="Admin Agent quick actions"
    >
      ${renderActionList(loading)}
    </section>
  `;

}



// =====================================
// RENDER CONSOLE
// =====================================

function renderConsole(
  messages = []
){

  return `
    <section
      class="rigo-admin-agent-console"
      data-admin-agent-console
      aria-live="polite"
      aria-label="Admin Agent console"
    >
      ${renderMessages(messages)}
    </section>
  `;

}



// =====================================
// RENDER FORM
// =====================================

function renderForm(
  state = {}
){

  const loading =
  Boolean(
    state.loading
  );

  const input =
  escapeHTML(
    state.input || ""
  );

  return `
    <form
      class="rigo-admin-agent-form"
      data-admin-agent-form
    >

      <div class="rigo-admin-agent-input-wrap">

        <span
          class="rigo-admin-agent-input-icon"
          aria-hidden="true"
        >
          ${AdminAgentIcons.terminal}
        </span>

        <input
          type="text"
          autocomplete="off"
          spellcheck="false"
          data-admin-agent-input
          aria-label="Admin command"
          placeholder="Type admin command..."
          value="${input}"
          ${loading ? "disabled" : ""}
        >

      </div>

      <button
        class="rigo-admin-agent-submit"
        type="submit"
        ${loading ? "disabled" : ""}
      >

        ${
          loading
          ? renderLoadingLabel()
          : `
              ${AdminAgentIcons.send}

              <span>
                Send
              </span>
            `
        }

      </button>

    </form>
  `;

}



// =====================================
// RENDER LAYOUT
// =====================================

function renderLayout(
  state = {}
){

  mountStyle();

  const admin =
  state.admin || {

    available:
    false,

    status:
    "unknown"

  };

  const messages =
  Array.isArray(
    state.messages
  )
  ? state.messages
  : [];

  const loading =
  Boolean(
    state.loading
  );

  return `
    <div
      class="rigo-admin-agent-page"
      data-admin-agent-page
      data-loading="${loading}"
    >

      ${renderHeader(admin)}

      ${renderQuickActions(loading)}

      ${renderPendingChanges(state.pendingChanges,state.executionHistory)}

      ${renderConsole(messages)}

      ${renderForm(state)}

    </div>
  `;

}



// =====================================
// EXPORTS
// =====================================

export {

  renderHeader,

  renderQuickActions,

  renderConsole,

  renderForm,

  renderLayout

};

export default
renderLayout;
