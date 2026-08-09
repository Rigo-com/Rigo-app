// =====================================
// RIGO AI
// STUDIO WORKSPACE MANAGER
// UI V2
// =====================================

import {
  WorkspaceState,
  createTab,
  addTab,
  hasTab,
  setActiveTab,
  getActiveTab,
  reset as resetWorkspaceState,
  snapshot
}
from "./workspace-state.js";

import {
  mountWorkspaceLayout,
  unmountWorkspaceLayout,
  getWorkspaceContent,
  getWorkspaceTabs,
  renderWorkspaceEmpty
}
from "./workspace-layout.js";

import ViewManager
from "./view-manager.js";

function initialize(){
  if(WorkspaceState.initialized){return true;}
  WorkspaceState.initialized = true;
  return true;
}

function mount(container){
  initialize();
  const root = mountWorkspaceLayout(container);
  WorkspaceState.root = root;
  WorkspaceState.mounted = Boolean(root);
  renderTabs();
  if(WorkspaceState.tabs.length === 0){renderWorkspaceEmpty();}
  return root;
}

async function register(view){
  if(!view || !view.id){return false;}
  return ViewManager.register(view);
}

function createViewTab(view){
  return createTab({id:view.id,type:"view",title:view.title || view.id,icon:view.icon || "",closable:view.closable === true,payload:null});
}

async function openView(viewId,payload=null){
  initialize();
  const view = ViewManager.get(viewId);
  if(!view){
    const content = getWorkspaceContent();
    if(content){content.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:24px;color:var(--rigo-muted);font-size:12px;text-align:center;">View not registered: ${String(viewId)}</div>`;}
    return false;
  }

  const previousTab = getActiveTab();
  if(previousTab && previousTab.id !== view.id){await ViewManager.unmount(previousTab.id);}
  if(!hasTab(view.id)){addTab(createViewTab(view));}
  if(!setActiveTab(view.id)){return false;}
  renderTabs();

  const content = getWorkspaceContent();
  if(!content){return false;}
  content.innerHTML = "";
  await ViewManager.mount(view.id,content,payload);
  return true;
}

function createTabIcon(icon){
  if(!icon){return "";}
  return `<span class="rigo-workspace-tab-icon">${icon}</span>`;
}

function createTabButton(tab,activeTab){
  const button = document.createElement("button");
  const isActive = activeTab?.id === tab.id;
  button.type = "button";
  button.className = "rigo-workspace-tab";
  button.dataset.tab = tab.id;
  button.dataset.active = isActive ? "true" : "false";
  button.title = tab.title;
  button.setAttribute("role","tab");
  button.setAttribute("aria-selected",isActive ? "true" : "false");
  button.innerHTML = `${createTabIcon(tab.icon)}<span class="rigo-workspace-tab-title">${tab.title}</span>`;
  button.addEventListener("click",async function(){await openView(tab.id,tab.payload || null);});
  return button;
}

function ensureTabStyles(){
  if(document.getElementById("rigo-workspace-tab-styles")){return true;}
  const style = document.createElement("style");
  style.id = "rigo-workspace-tab-styles";
  style.textContent = `
    .rigo-workspace-tab{position:relative;height:32px;min-width:0;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;margin:0;border:1px solid transparent;border-bottom:none;border-radius:var(--rigo-radius-sm) var(--rigo-radius-sm) 0 0;color:var(--rigo-muted);background:transparent;font-family:var(--rigo-font);font-size:11px;line-height:1;font-weight:600;white-space:nowrap;cursor:pointer;transition:color var(--rigo-transition-normal),background var(--rigo-transition-normal),border-color var(--rigo-transition-normal);}
    .rigo-workspace-tab:hover{color:var(--rigo-text-secondary);background:rgba(21,36,58,.42);}
    .rigo-workspace-tab[data-active="true"]{color:var(--rigo-text);background:rgba(16,29,49,.96);border-color:var(--rigo-border);}
    .rigo-workspace-tab[data-active="true"]::after{content:"";position:absolute;right:8px;bottom:0;left:8px;height:2px;border-radius:999px 999px 0 0;background:var(--rigo-primary);box-shadow:0 0 8px var(--rigo-primary-glow);}
    .rigo-workspace-tab-icon{min-width:14px;display:inline-flex;align-items:center;justify-content:center;color:inherit;font-size:13px;line-height:1;}
    .rigo-workspace-tab-title{max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    @media(max-width:760px){.rigo-workspace-tab{height:31px;padding:0 10px;font-size:10px;}.rigo-workspace-tab-title{max-width:100px;}}
  `;
  document.head.appendChild(style);
  return true;
}

function renderTabs(){
  const tabsContainer = getWorkspaceTabs();
  if(!tabsContainer){return false;}
  ensureTabStyles();
  tabsContainer.innerHTML = "";
  const activeTab = getActiveTab();
  for(const tab of WorkspaceState.tabs){tabsContainer.appendChild(createTabButton(tab,activeTab));}
  return true;
}

async function refreshActiveView(){
  const activeTab = getActiveTab();
  if(!activeTab){return false;}
  return ViewManager.refresh(activeTab.id);
}

async function unmount(){
  const activeTab = getActiveTab();
  if(activeTab){await ViewManager.unmount(activeTab.id);}
  unmountWorkspaceLayout();
  resetWorkspaceState();
  return true;
}

function getSnapshot(){return {workspace:snapshot(),views:ViewManager.snapshot()};}

const WorkspaceManager = Object.freeze({initialize,mount,register,openView,renderTabs,refreshActiveView,unmount,snapshot:getSnapshot});

export {initialize,mount,register,openView,renderTabs,refreshActiveView,unmount,getSnapshot,WorkspaceManager};
export default WorkspaceManager;
