import assert from "node:assert/strict";
import { MAX_FILE_SIZE, safeName, parseMultipart } from "../api/files-upload.js";

const boundary="rigo-test-boundary";
const body=Buffer.from([
  `--${boundary}`,
  'Content-Disposition: form-data; name="file"; filename="test file.txt"',
  "Content-Type: text/plain",
  "",
  "hello RIGO",
  `--${boundary}--`,
  ""
].join("\r\n"));

const file=parseMultipart(body,`multipart/form-data; boundary=${boundary}`);
assert.equal(file.name,"test file.txt");
assert.equal(file.type,"text/plain");
assert.equal(file.data.toString(),"hello RIGO");
assert.equal(safeName("../bad file?.txt"),"-bad-file-.txt");
assert.equal(MAX_FILE_SIZE,4*1024*1024);
assert.throws(()=>parseMultipart(Buffer.from("bad"),"text/plain"),/MULTIPART_BOUNDARY_REQUIRED/);
console.log("Blob upload tests passed");
