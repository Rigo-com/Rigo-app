// =====================================
// RIGO AI
// STUDIO SIDEBAR DATA
// =====================================

import SidebarIcons
from "./sidebar-icons.js";



// =====================================
// SIDEBAR ITEMS
// =====================================

const SidebarItems =
Object.freeze([

  {

    id:
    "dashboard",

    title:
    "Dashboard",

    icon:
    SidebarIcons.dashboard,

    route:
    "#dashboard",

    color:
    "#28C76F"

  },

  {

    id:
    "project",

    title:
    "Project",

    icon:
    SidebarIcons.project,

    route:
    "#project",

    color:
    "#FDBA2D"

  },

  {

    id:
    "system",

    title:
    "System",

    icon:
    SidebarIcons.system,

    route:
    "#system",

    color:
    "#3B82F6"

  },

  {

    id:
    "agents",

    title:
    "Agents",

    icon:
    SidebarIcons.agents,

    route:
    "#agents",

    color:
    "#EC4899"

  },

  {

    id:
    "architecture",

    title:
    "Architecture",

    icon:
    SidebarIcons.architecture,

    route:
    "#architecture",

    color:
    "#00C48C"

  },

  {

    id:
    "memory",

    title:
    "Memory",

    icon:
    SidebarIcons.memory,

    route:
    "#memory",

    color:
    "#8B5CF6"

  },

  {

    id:
    "debug",

    title:
    "Debug",

    icon:
    SidebarIcons.debug,

    route:
    "#debug",

    color:
    "#EF4444"

  },

  {

    id:
    "extensions",

    title:
    "Extensions",

    icon:
    SidebarIcons.extensions,

    route:
    "#extensions",

    color:
    "#10B981"

  },

  {

    id:
    "settings",

    title:
    "Settings",

    icon:
    SidebarIcons.settings,

    route:
    "#settings",

    color:
    "#6B7280"

  }

]);



// =====================================
// HELPERS
// =====================================

function getSidebarItems(){

  return
  SidebarItems;

}



function getSidebarItem(
  id
){

  return SidebarItems.find(

    item =>

      item.id ===
      id

  ) ?? null;

}



function hasSidebarItem(
  id
){

  return SidebarItems.some(

    item =>

      item.id ===
      id

  );

}



// =====================================
// EXPORTS
// =====================================

export {

  SidebarItems,

  getSidebarItems,

  getSidebarItem,

  hasSidebarItem

};

export default
SidebarItems;
