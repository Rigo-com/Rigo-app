import assert from "node:assert/strict";
import ServiceManager from "../js/services/service-manager.js";
import { RIGOContainer } from "../js/core/container/index.js";
import { getServiceRegistrationDiagnostics } from "../js/services/service-registration.js";
import Analytics from "../js/services/analytics/index.js";
import Files, {
  addFile,
  removeFile,
  getFiles,
  findFileById,
  clearFiles,
  enqueueUpload,
  getUploadQueue,
  createFileURL,
  cleanupObjectURLs,
  sanitizeFileName,
  validateFile,
  validateFileExtension,
  formatFileSize,
  readFileText
} from "../js/services/files/index.js";

await ServiceManager.reset();
RIGOContainer.clear();

const suffix=Date.now().toString(36);

const dependencyLifecycle=[];
const dependencyName="dependency-"+suffix;
const rootName="root-"+suffix;

await ServiceManager.register(rootName, async({services})=>({
  dependency:services[dependencyName],
  async initialize(){dependencyLifecycle.push("root.initialize");},
  async boot(){dependencyLifecycle.push("root.boot");},
  async shutdown(){dependencyLifecycle.push("root.shutdown");}
}), {dependencies:[dependencyName]});

await ServiceManager.register(dependencyName, async()=>({
  async initialize(){dependencyLifecycle.push("dependency.initialize");},
  async boot(){dependencyLifecycle.push("dependency.boot");},
  async shutdown(){dependencyLifecycle.push("dependency.shutdown");}
}));

assert.equal(await ServiceManager.initialize(),true);
assert.equal(await ServiceManager.boot(),true);
assert.deepEqual(dependencyLifecycle,[
  "dependency.initialize",
  "dependency.boot",
  "root.initialize",
  "root.boot"
]);
assert.equal(ServiceManager.snapshot().runtime.booted,true);
assert.equal(ServiceManager.snapshot().runtime.serviceStates[rootName].state,"active");
assert.equal(getServiceRegistrationDiagnostics().registered,2);
assert.equal(await ServiceManager.shutdown(),true);
assert.deepEqual(dependencyLifecycle,[
  "dependency.initialize",
  "dependency.boot",
  "root.initialize",
  "root.boot",
  "root.shutdown",
  "dependency.shutdown"
]);

await ServiceManager.reset();
RIGOContainer.clear();
assert.equal(ServiceManager.snapshot().runtime.initialized,false);

const concurrentSingletonName="concurrent-singleton-"+suffix;
let singletonCreates=0;
await ServiceManager.register(concurrentSingletonName, async()=>{
  singletonCreates++;
  await new Promise(resolve=>setTimeout(resolve,10));
  return {created:singletonCreates};
});
const [singletonA,singletonB]=await Promise.all([
  ServiceManager.resolve(concurrentSingletonName),
  ServiceManager.resolve(concurrentSingletonName)
]);
assert.strictEqual(singletonA,singletonB);
assert.equal(singletonCreates,1);

const concurrentScopedName="concurrent-scoped-"+suffix;
let scopedCreates=0;
await ServiceManager.register(concurrentScopedName, async()=>{
  scopedCreates++;
  await new Promise(resolve=>setTimeout(resolve,10));
  return {created:scopedCreates};
},{lifecycle:"scoped"});
const [scopedA,scopedB]=await Promise.all([
  ServiceManager.resolve(concurrentScopedName,"scope-a"),
  ServiceManager.resolve(concurrentScopedName,"scope-a")
]);
assert.strictEqual(scopedA,scopedB);
assert.equal(scopedCreates,1);
const scopedC=await ServiceManager.resolve(concurrentScopedName,"scope-b");
assert.notStrictEqual(scopedA,scopedC);
assert.equal(scopedCreates,2);

await ServiceManager.reset();
RIGOContainer.clear();

const circularA="circular-a-"+suffix;
const circularB="circular-b-"+suffix;
await ServiceManager.register(circularA, async()=>({}), {dependencies:[circularB]});
await ServiceManager.register(circularB, async()=>({}), {dependencies:[circularA]});
await assert.rejects(
  ServiceManager.resolve(circularA),
  new RegExp("CIRCULAR_DEPENDENCY:"+circularA)
);
await ServiceManager.reset();
RIGOContainer.clear();

assert.throws(()=>ServiceManager.register("",()=>({})),/INVALID_SERVICE_NAME/);
assert.throws(()=>ServiceManager.register("bad-"+suffix,123),/INVALID_SERVICE_FACTORY/);
assert.throws(()=>ServiceManager.register("bad-"+suffix,()=>({}),{lifecycle:"invalid"}),/INVALID_SERVICE_LIFECYCLE/);
assert.throws(()=>ServiceManager.register("bad-"+suffix,()=>({}),{dependencies:[""]}),/INVALID_SERVICE_DEPENDENCIES/);

Analytics.reset();
assert.equal(Analytics.track("before-init"),false);
assert.equal(Analytics.diagnostics().failedEvents,1);
assert.equal(Analytics.initialize(),true);
const metadata={nested:{value:1}};
const event=Analytics.track("test.event",metadata);
assert.equal(event.event,"test.event");
metadata.nested.value=99;
assert.equal(event.metadata.nested.value,1);
assert.equal(Analytics.diagnostics().trackedEvents,1);
assert.deepEqual(Analytics.snapshot(),Analytics.diagnostics());
assert.equal(Analytics.track(""),false);
Analytics.reset();

await clearFiles();
const fakeFile={name:"photo.png",size:1024,type:"image/png",lastModified:1};
assert.equal(validateFile(fakeFile),true);
assert.equal(validateFileExtension("photo.png"),true);
assert.equal(formatFileSize(2048),"2.0 KB");
assert.equal(sanitizeFileName("../photo.png"),"..photo.png");
assert.equal(await addFile(fakeFile),true);
assert.equal(typeof getFiles()[0].sizeLabel,"string");
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
globalThis.URL={
  createObjectURL:()=> "blob:test",
  revokeObjectURL:()=>{revoked++;}
};
assert.equal(createFileURL(fakeFile),"blob:test");
assert.equal(cleanupObjectURLs(),true);
assert.equal(revoked,1);
globalThis.URL=originalURL;

await Files.reset();
assert.equal(Files.snapshot().activeObjectURLs,0);

RIGOContainer.clear();
console.log("Services runtime checks passed.");
