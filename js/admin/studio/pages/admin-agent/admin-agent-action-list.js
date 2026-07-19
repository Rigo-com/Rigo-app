// =====================================
// RIGO AI
// ADMIN AGENT ACTION LIST
// =====================================

import AdminAgentIcons
from "./admin-agent-icons.js";

import {

  escapeHTML

}
from "./admin-agent-utils.js";



// =====================================
// ACTION DEFINITIONS
// =====================================

const AdminAgentActionDefinitions =
Object.freeze([

  Object.freeze({

    command:
    "scan project",

    label:
    "Scan Project",

    icon:
    AdminAgentIcons.search,

    tone:
    "scan"

  }),

  Object.freeze({

    command:
    "project snapshot",

    label:
    "Project Snapshot",

    icon:
    AdminAgentIcons.snapshot,

    tone:
    "snapshot"

  }),

  Object.freeze({

    command:
    "list files",

    label:
    "List Files",

    icon:
    AdminAgentIcons.file,

    tone:
    "files"

  }),

  Object.freeze({

    command:
    "list folders",

    label:
    "List Folders",

    icon:
    AdminAgentIcons.folder,

    tone:
    "folders"

  }),

  Object.freeze({

    command:
    "list systems",

    label:
    "List Systems",

    icon:
    AdminAgentIcons.system,

    tone:
    "systems"

  }),

  Object.freeze({

    command:
    "analyze code",

    label:
    "Analyze Code",

    icon:
    AdminAgentIcons.code,

    tone:
    "analyze"

  })

]);



// =====================================
// RENDER ACTION BUTTON
// =====================================

function renderActionButton(
  action = {},
  loading = false
){

  const command =
  escapeHTML(
    action.command || ""
  );

  const label =
  escapeHTML(
    action.label || ""
  );

  const tone =
  escapeHTML(
    action.tone || ""
  );

  const icon =
  action.icon || "";

  return `
    <button
      class="rigo-admin-agent-action ${tone}"
      type="button"
      data-admin-command="${command}"
      aria-label="${label}"
      ${loading ? "disabled" : ""}
    >

      <span
        class="rigo-admin-agent-action-icon"
        aria-hidden="true"
      >
        ${icon}
      </span>

      <span class="rigo-admin-agent-action-label">
        ${label}
      </span>

    </button>
  `;

}



// =====================================
// RENDER ACTION LIST
// =====================================

function renderActionList(
  loading = false
){

  return AdminAgentActionDefinitions
  .map(
    function(action){

      return renderActionButton(
        action,
        loading
      );

    }
  )
  .join("");

}



// =====================================
// EXPORTS
// =====================================

export {

  AdminAgentActionDefinitions,

  renderActionButton,

  renderActionList

};

export default
renderActionList;
