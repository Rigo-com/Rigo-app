import assert from "node:assert/strict";
import ServiceManager from "../js/services/service-manager.js";

const requests=[];
globalThis.fetch=async(url,options={})=>{
  const body=options.body?JSON.parse(options.body):null;
  requests.push({url:String(url),body});
  assert.equal(typeof body,"object");
  assert.equal(Array.isArray(body),false);

  if(String(url).startsWith("/api/weather")){
    return new Response(JSON.stringify({ok:true,source:"test-weather",current:{temperature:24}}),{status:200,headers:{"content-type":"application/json"}});
  }

  if(String(url)==="/api/ai-chat"){
    assert.equal(body.message,"شلون الجو؟");
    assert.match(body.context,/LIVE WEATHER TOOL RESULT/);
    return new Response(JSON.stringify({ok:true,message:"الجو معتدل، 24 درجة.",requestId:"ai-test"}),{status:200,headers:{"content-type":"application/json"}});
  }

  throw new Error(`UNEXPECTED_FETCH:${url}`);
};

await ServiceManager.register("memory",async()=>({
  search:async()=>[],create:async()=>true,clearContext:async()=>true,
  addContext:async()=>true,getContext:()=>[]
}));
await ServiceManager.register("events",async()=>({emit:async()=>true}));

const {default:AI}=await import("../js/ai/index.js");
assert.equal(await AI.initialize(),true);
assert.equal(ServiceManager.has("ai"),true);
assert.equal(await ServiceManager.resolve("ai"),AI);

const result=await AI.process({
  message:"شلون الجو؟",
  location:{latitude:36.19,longitude:44.01},
  metadata:{userId:"runtime-user",conversationId:"runtime-chat"}
});

assert.equal(result.message,"الجو معتدل، 24 درجة.");
assert.deepEqual(requests.map(request=>request.url),[
  "/api/weather?lat=36.19&lon=44.01",
  "/api/ai-chat"
]);
await AI.shutdown();
console.log("AI main assistant end-to-end runtime checks passed.");
