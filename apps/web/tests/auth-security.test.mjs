import test from "node:test";
import assert from "node:assert/strict";
import { setSessionCookie, clearSessionCookie, sessionCookieName, normalizeUsername, passwordIsValid } from "../src/server/auth.mjs";
import { isSameOrigin } from "../src/server/http.mjs";

test("canonical HTTPS origin determines secure host-only session cookie behind proxy", () => {
  const previous=process.env.APP_ORIGIN;
  process.env.APP_ORIGIN="https://learning.example";
  try {
    const request=new Request("http://127.0.0.1:3000/api/auth/login",{headers:{origin:"https://learning.example"}});
    assert.equal(isSameOrigin(request),true);
    assert.equal(sessionCookieName(request),"__Host-devacademy_session");
    const response=new Response(null,{status:200});
    setSessionCookie(response,request,"a".repeat(64),new Date(Date.now()+60000));
    const header=response.headers.get("set-cookie");
    assert.match(header,/^__Host-devacademy_session=[a-f0-9]{64}/);
    assert.match(header,/; Secure/);
    assert.match(header,/; HttpOnly/);
    assert.match(header,/; SameSite=Lax/);
    clearSessionCookie(response,request);
    assert.match(response.headers.getSetCookie()[1],/Max-Age=0/);
    assert.equal(isSameOrigin(new Request(request.url,{headers:{origin:"https://fake.learning.example"}})),false);
    assert.equal(isSameOrigin(new Request(request.url,{headers:{origin:"null"}})),false);
  } finally {
    if(previous===undefined) delete process.env.APP_ORIGIN; else process.env.APP_ORIGIN=previous;
  }
});
test("input normalization and basic password requirements",()=>{
  assert.equal(normalizeUsername(" Student_1 "),"student_1");
  assert.equal(normalizeUsername("bad!"),null);
  assert.equal(passwordIsValid("12345678901234"),false);
  assert.equal(passwordIsValid("123456789012345"),true);
});
