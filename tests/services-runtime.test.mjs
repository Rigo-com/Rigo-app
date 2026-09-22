import assert from "node:assert/strict";
import ServiceManager from "../js/services/service-manager.js";
import { getServiceRegistrationDiagnostics } from "../js/services/service-registration.js";
import Analytics from "../js/services/analytics/index.js";
import Files, { addFile, removeFile, getFiles, findFileById, clearFiles, enqueueUpload, getUploadQueue, createFileURL, cleanupObjectURLs, sanitizeFileName, validateFile } from "../js/services/files/index.js";

await ServiceManager.reset();
const suffix=Date.now().toString(36);
const lifecycle=[];
const serviceName="test-service-"+suffix;

await ServiceManager.register(serviceName, async()=>({
  async initialize(){lifecycle.push("initialize");return true;},
  async boot(){lifecycle.push("boot");return true;},
  async shutdown(){lifecycle.push("shutdown");return true;}
}));

assert.equal(await ServiceManager.initialize(),true);
assert.equal(await ServiceManager.boot(),true);
assert.deepEqual(lifecycle,["initialize","boot"]);
assert.equal(ServiceManager.snapshot().runtime.booted,true);
assert.equal(ServiceManager.snapshot().runtime.serviceStates[serviceName].state,"active");
assert.equal(await ServiceManager.shutdown(),true);
assert.deepEqual(lifecycle,["initialize","boot","shutdown"]);
await ServiceManager.reset();
assert.equal(ServiceManager.snapshot().runtime.initialized,false);
assert.equal(ServiceManager.snapshot().runtime.services,0);

assert.throws(()=>ServiceManager.register("",()=>({})),/INVALID_SERVICE_NAME/);
assert.throws(()=>ServiceManager.register("bad-"+suffix,123),/INVALID_SERVICE_FACTORY/);
assert.throws(()=>ServiceManager.register("bad-"+suffix,()=>({}),{lifecycle:"invalid"}),/INVALID_SERVICE_LIFECYCLE/);
assert.throws(()=>ServiceManager.register("bad-"+suffix,()=>({}),{dependencies:[""]}),/INVALID_SERVICE_DEPENDENCIES/);
assert.equal(getServiceRegistrationDiagnostics().registered,ServiceManager.list().length);

Analytics.reset();
assert.equal(Analytics.track("before-init"),false);
assert.equal(Analytics.initialize(),true);
const metadata={nested:{value:1}};
const event=Analytics.track("test.event",metadata);
assert.equal(event.event,"test.event");
metadata.nested.value=99;
assert.equal(event.metadata.nested.value,1);
assert.equal(Analytics.diagnostics().trackedEvents,1);
assert.equal(Analytics.track(""),false);
Analytics.reset();

await clearFiles();
const fakeFile={name:"photo.png",size:1024,type:"image/png",lastModified:1};
assert.equal(validateFile(fakeFile),true);
assert.equal(sanitizeFileName("../photo.png"),"..photo.png");
assert.equal(await addFile(fakeFile),true);
assert.equal(getFiles().length,1);
const fileId=getFiles()[0].id;
assert.equal(findFileById(fileId)?.id,fileId);
assert.equal(enqueueUpload(fileId),true);
assert.equal(enqueueUpload(fileId),false);
assert.equal(enqueueUpload("file_missing"),false);
assert.deepEqual(getUploadQueue(),[fileId]);
assert.equal(await removeFile(fileId),true);
assert.deepEqual(getUploadQueue(),[]);

const originalURL=globalThis.URL;
let revoked=0;
globalThis.URL={createObjectURL:()=> "blob:test",revokeObjectURL:()=>{revoked++;}};
assert.equal(createFileURL(fakeFile),"blob:test");
assert.equal(cleanupObjectURLs(),true);
assert.equal(revoked,1);
globalThis.URL=originalURL;

await Files.reset();
assert.equal(Files.snapshot().activeObjectURLs,0);
console.log("Services runtime checks passed.");
