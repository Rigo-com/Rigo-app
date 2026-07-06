// =====================================
// RIGO AI
// STUDIO ADMIN AGENT LAYOUT
// =====================================

function escapeHTML(
  value
){

  return String(value ?? "")
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;")
  .replaceAll("'","&#039;");

}



function formatOutput(
  value
){

  if(
    typeof value === "string"
  ){

    return escapeHTML(
      value
    );

  }

  return escapeHTML(
    JSON.stringify(
      value,
      null,
      2
    )
  );

}



function renderMessages(
  messages = []
){

  if(
    !messages.length
  ){

    return `
      <div class="rigo-admin-agent-empty">
        Admin Agent is ready. Run a command.
      </div>
    `;

  }

  return messages
  .map(
    function(message){

      return `
        <div class="rigo-admin-agent-message ${escapeHTML(message.role)}">
          <div class="rigo-admin-agent-role">
            ${escapeHTML(message.role)}
          </div>

          <pre>${formatOutput(message.content)}</pre>
        </div>
      `;

    }
  )
  .join("");

}



function renderLayout(
  state = {}
){

  const admin =
  state.admin || {
    available:false,
    status:"unknown"
  };

  return `
    <div class="rigo-admin-agent-page">

      <header class="rigo-admin-agent-header">
        <div>
          <h1>Admin Agent</h1>
          <p>
            Private command console connected to RIGO Admin Agent.
          </p>
        </div>

        <span
          class="rigo-admin-agent-status"
          data-status="${escapeHTML(admin.status)}"
        >
          ${admin.available ? "ADMIN CONNECTED" : "ADMIN MISSING"}
        </span>
      </header>

      <section class="rigo-admin-agent-quick-actions">
        <button type="button" data-admin-command="scan project">
          Scan Project
        </button>

        <button type="button" data-admin-command="project snapshot">
          Project Snapshot
        </button>

        <button type="button" data-admin-command="list files">
          List Files
        </button>

        <button type="button" data-admin-command="list folders">
          List Folders
        </button>

        <button type="button" data-admin-command="list systems">
          List Systems
        </button>

        <button type="button" data-admin-command="analyze code">
          Analyze Code
        </button>
      </section>

      <section class="rigo-admin-agent-console">
        ${renderMessages(state.messages)}
      </section>

      <form class="rigo-admin-agent-form" data-admin-agent-form>
        <input
          type="text"
          data-admin-agent-input
          placeholder="Type admin command..."
          value="${escapeHTML(state.input || "")}"
          ${state.loading ? "disabled" : ""}
        >

        <button type="submit" ${state.loading ? "disabled" : ""}>
          ${state.loading ? "Running..." : "Send"}
        </button>
      </form>

    </div>
  `;

}



export {

  escapeHTML,

  formatOutput,

  renderMessages,

  renderLayout

};

export default
renderLayout;
