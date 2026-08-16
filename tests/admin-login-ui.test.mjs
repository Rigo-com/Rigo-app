import assert from "node:assert/strict";

import {
  ADMIN_AUTH_ENDPOINT,
  login,
  logout,
  restoreAuthSession
} from "../js/auth/auth-actions.js";

import {
  authRuntimeState,
  resetAuthRuntimeState
} from "../js/auth/auth-state.js";

function response(status, payload){
  return {
    ok:status >= 200 && status < 300,
    status,
    text:async() => JSON.stringify(payload)
  };
}

const originalFetch = globalThis.fetch;

try{
  resetAuthRuntimeState();
  const requests = [];
  globalThis.fetch = async(url, options = {}) => {
    requests.push({url, options});
    return response(200, {
      ok:true,
      authenticated:true,
      admin:true,
      email:"admin@example.com",
      persistent:true
    });
  };

  assert.equal(await login({
    email:"ADMIN@example.com",
    password:"valid-password",
    staySignedIn:true
  }), true);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, ADMIN_AUTH_ENDPOINT);
  assert.equal(requests[0].options.method, "POST");
  assert.deepEqual(JSON.parse(requests[0].options.body), {
    email:"admin@example.com",
    password:"valid-password",
    staySignedIn:true
  });
  assert.equal(authRuntimeState.authenticated, true);
  assert.equal(authRuntimeState.user.role, "admin");

  resetAuthRuntimeState();
  requests.length = 0;
  assert.equal(await restoreAuthSession(), true);
  assert.equal(requests[0].url, ADMIN_AUTH_ENDPOINT);
  assert.equal(requests[0].options.method, "GET");
  assert.equal(authRuntimeState.user.role, "admin");

  requests.length = 0;
  assert.equal(await logout(), true);
  assert.equal(requests.some(item => item.url === ADMIN_AUTH_ENDPOINT && item.options.method === "DELETE"), true);
  assert.equal(authRuntimeState.authenticated, false);
}
finally{
  globalThis.fetch = originalFetch;
  resetAuthRuntimeState();
}

console.log("Admin login UI integration tests passed");
