import { escapeHTML } from "./admin-agent-utils.js";
function renderPendingChanges(plans=[],history=[]){
  const items=Array.isArray(plans)?plans:[];
  const records=Array.isArray(history)?history:[];
  return `<section class="rigo-admin-pending" data-admin-pending>
    <div class="rigo-admin-pending-head"><div><strong>Pending Changes</strong><span>${items.length} waiting</span></div><button type="button" data-admin-command="execution history">History (${records.length})</button></div>
    <div class="rigo-admin-pending-list">${items.length?items.map(renderPlan).join(""):'<p class="rigo-admin-pending-empty">No changes waiting for approval.</p>'}</div>
  </section>`;
}
function renderPlan(plan={}){
  const id=escapeHTML(plan.id||"");
  const risk=escapeHTML(plan.risk?.level||"unknown");
  const operations=Object.values(plan.graph?.nodes||{});
  const paths=operations.map(operation=>operation.payload?.path||operation.payload?.sourcePath).filter(Boolean);
  const approved=Boolean(plan.approval?.approved);
  return `<article class="rigo-admin-plan" data-risk="${risk}">
    <div class="rigo-admin-plan-info"><strong>${escapeHTML(plan.title||id)}</strong><span>${id} · ${risk} risk · ${operations.length} operation(s)</span><small>${escapeHTML(paths.join(", ")||"No file path")}</small></div>
    <div class="rigo-admin-plan-actions">
      <button type="button" data-admin-plan-action="approve" data-plan-id="${id}" ${approved?"disabled":""}>${approved?"Approved":"Approve"}</button>
      <button type="button" data-admin-plan-action="execute" data-plan-id="${id}" ${approved?"":"disabled"}>Execute</button>
      <button type="button" data-admin-plan-action="cancel" data-plan-id="${id}">Cancel</button>
    </div>
  </article>`;
}
export{renderPendingChanges,renderPlan};export default renderPendingChanges;
