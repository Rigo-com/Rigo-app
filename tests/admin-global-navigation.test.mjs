import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const sidebar = await readFile(new URL("../js/admin/studio/ui/studio-sidebar.js",import.meta.url),"utf8");
const home = await readFile(new URL("../home.html",import.meta.url),"utf8");

for(const label of ["New Chat","Search chats","Chats","Memory","Admin Studio","Debug Center","Log out"]){
  assert.equal(sidebar.includes(label),true,`${label} must be available from the main Studio menu`);
}

assert.equal(sidebar.includes('topbarMenu.addEventListener("click",openGlobalDrawer)'),true);
assert.equal(sidebar.includes('mobile.more.addEventListener("click",toggleMobileSheet)'),false);
assert.equal(sidebar.includes('more.addEventListener("click",toggleMobileSheet)'),true);
assert.equal(sidebar.includes("initializeConversationStore"),true);
assert.equal(sidebar.includes("getConversationStore"),true);
assert.equal(sidebar.includes("renderGlobalHistory"),true);
assert.equal(home.includes('navigationParams.get("new")==="1"'),true);
assert.equal(home.includes('navigationParams.get("chat")'),true);

console.log("Admin global navigation tests passed");
