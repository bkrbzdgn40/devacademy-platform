import { createHash, timingSafeEqual } from "node:crypto";
import { executionLabEnabled } from "./execution-store.mjs";
import { json } from "./http.mjs";

function tokenBytes(value) {
  return typeof value === "string" && value.length >= 32 && value.length <= 256
    ? createHash("sha256").update(value).digest() : null;
}
export function workerAuthorized(request) {
  if(!executionLabEnabled()) return false;
  const secret=tokenBytes(process.env.RUNNER_WORKER_TOKEN);
  const authorization=request.headers.get("authorization")??"";
  if(!authorization.startsWith("Bearer "))return false;
  const presented=tokenBytes(authorization.slice(7));
  return Boolean(secret && presented && timingSafeEqual(secret,presented));
}
export function workerGuard(request) {
  if(!executionLabEnabled())return json({error:"Execution lab disabled."},503);
  if(!workerAuthorized(request))return json({error:"Unauthorized."},401);
  return null;
}
