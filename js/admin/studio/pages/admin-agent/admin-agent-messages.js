// =====================================
// RIGO AI
// ADMIN AGENT
// MESSAGES
// =====================================

import AdminAgentIcons
from "./admin-agent-icons.js";

import {

  escapeHTML,

  formatOutput,

  formatTime,

  normalizeRole

}
from "./admin-agent-utils.js";



// =====================================
// RENDER EMPTY STATE
// =====================================

function renderEmptyState(){

  return `
    <div class="rigo-admin-agent-empty">

      <div class="rigo-admin-agent-empty-avatar">
        ${AdminAgentIcons.admin}
      </div>

      <div class="rigo-admin-agent-empty-content">

        <div class="rigo-admin-agent-empty-heading">

          <span class="rigo-admin-agent-empty-name">
            Admin Agent
          </span>

          <span class="rigo-admin-agent-empty-time">
            ${escapeHTML(
              formatTime()
            )}
          </span>

        </div>

        <div class="rigo-admin-agent-empty-message">
          Admin Agent is ready. Run a command.
        </div>

        <div class="rigo-admin-agent-empty-subtitle">
          How can I help you today?
        </div>

      </div>

    </div>
  `;

}



// =====================================
// GET ROLE LABEL
// =====================================

function getRoleLabel(
  role
){

  switch(
    role
  ){

    case "user":

      return "You";

    case "system":

      return "System";

    case "error":

      return "Error";

    default:

      return "Admin Agent";

  }

}



// =====================================
// GET ROLE ICON
// =====================================

function getRoleIcon(
  role
){

  switch(
    role
  ){

    case "user":

      return AdminAgentIcons.user;

    case "system":

      return AdminAgentIcons.terminal;

    default:

      return AdminAgentIcons.admin;

  }

}



// =====================================
// RENDER MESSAGE
// =====================================

function renderMessage(
  message = {}
){

  const role =
  normalizeRole(
    message.role
  );

  const roleLabel =
  getRoleLabel(
    role
  );

  const messageIcon =
  getRoleIcon(
    role
  );

  return `
    <article
      class="rigo-admin-agent-message ${escapeHTML(role)}"
      data-admin-message-role="${escapeHTML(role)}"
    >

      <div class="rigo-admin-agent-message-icon">
        ${messageIcon}
      </div>

      <div class="rigo-admin-agent-message-main">

        <div class="rigo-admin-agent-message-header">

          <span class="rigo-admin-agent-role">
            ${escapeHTML(roleLabel)}
          </span>

          <span class="rigo-admin-agent-message-time">
            ${escapeHTML(
              formatTime(
                message.timestamp
              )
            )}
          </span>

        </div>

        <pre>${formatOutput(message.content)}</pre>

      </div>

    </article>
  `;

}



// =====================================
// RENDER MESSAGES
// =====================================

function renderMessages(
  messages = []
){

  if(
    !Array.isArray(
      messages
    )
    ||
    messages.length === 0
  ){

    return renderEmptyState();

  }

  return messages
  .map(
    function(message){

      return renderMessage(
        message
      );

    }
  )
  .join("");

}



// =====================================
// RENDER LOADING LABEL
// =====================================

function renderLoadingLabel(){

  return `
    <span
      class="rigo-admin-agent-loading"
      aria-label="Loading"
    >

      <span
        class="rigo-admin-agent-loading-dot"
        aria-hidden="true"
      ></span>

      <span
        class="rigo-admin-agent-loading-dot"
        aria-hidden="true"
      ></span>

      <span
        class="rigo-admin-agent-loading-dot"
        aria-hidden="true"
      ></span>

    </span>
  `;

}



// =====================================
// EXPORTS
// =====================================

export {

  renderEmptyState,

  renderMessage,

  renderMessages,

  renderLoadingLabel

};

export default
renderMessages;
