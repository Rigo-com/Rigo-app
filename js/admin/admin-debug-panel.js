// =====================================
// RIGO AI
// ADMIN DEBUG PANEL
// TEMP MOBILE TEST UI
// =====================================

function createAdminDebugPanel(
  Admin
){

  if(
    document.getElementById(
      "rigo-admin-debug-panel"
    )
  ){

    return true;

  }

  const panel =
  document.createElement(
    "div"
  );

  panel.id =
  "rigo-admin-debug-panel";

  panel.style.cssText =
  `
    position: fixed;
    inset: 12px;
    z-index: 999999;
    background: #050914;
    color: #ffffff;
    border: 1px solid #1f2937;
    border-radius: 16px;
    padding: 12px;
    font-family: monospace;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;

  panel.innerHTML =
  `
    <div style="font-weight:700;font-size:16px;">
      RIGO Admin Debug
    </div>

    <textarea
      id="rigo-admin-debug-input"
      style="
        width:100%;
        min-height:70px;
        background:#0b1220;
        color:#fff;
        border:1px solid #334155;
        border-radius:10px;
        padding:10px;
      "
    >analyze code</textarea>

    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button data-command="execute">Execute</button>
      <button data-command="scan project">Scan</button>
      <button data-command="project snapshot">Snapshot</button>
      <button data-command="list files">Files</button>
      <button data-command="clear">Clear</button>
      <button data-command="close">Close</button>
    </div>

    <pre
      id="rigo-admin-debug-output"
      style="
        flex:1;
        overflow:auto;
        background:#020617;
        color:#d1fae5;
        border:1px solid #334155;
        border-radius:10px;
        padding:10px;
        white-space:pre-wrap;
        font-size:12px;
      "
    ></pre>
  `;

  document.body.appendChild(panel);

  const input =
  panel.querySelector(
    "#rigo-admin-debug-input"
  );

  const output =
  panel.querySelector(
    "#rigo-admin-debug-output"
  );

  async function runCommand(
    command
  ){

    try{

      output.textContent =
      "Running...";

      const result =
      await Admin.command(
        command
      );

      output.textContent =
      JSON.stringify(
        result,
        null,
        2
      );

    }
    catch(error){

      output.textContent =
      error?.stack ||
      error?.message ||
      String(error);

    }

  }

  panel.addEventListener(
    "click",
    async event => {

      const button =
      event.target.closest(
        "button"
      );

      if(
        !button
      ){

        return;

      }

      const command =
      button.dataset.command;

      if(
        command === "close"
      ){

        panel.remove();
        return;

      }

      if(
        command === "clear"
      ){

        output.textContent =
        "";

        return;

      }

      if(
        command === "execute"
      ){

        await runCommand(
          input.value
        );

        return;

      }

      input.value =
      command;

      await runCommand(
        command
      );

    }
  );

  return true;

}

export {
  createAdminDebugPanel
};

export default
createAdminDebugPanel;
