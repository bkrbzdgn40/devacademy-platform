import { createHash, randomBytes, scrypt as callbackScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { database, transaction } from "./db.mjs";

const scrypt = promisify(callbackScrypt);
const SCRYPT_OPTIONS = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const SESSION_DAYS = 7;
const NAME_PATTERN = /^[a-z][a-z0-9_]{2,23}$/;
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const DUMMY_SALT = Buffer.alloc(16, 71);

export function normalizeUsername(name) {
  if (typeof name !== "string") return null;
  const normalized = name.trim().toLowerCase();
  return NAME_PATTERN.test(normalized) ? normalized : null;
}
export function passwordIsValid(password) {
  return typeof password === "string" && password.length >= 15 &&
    password.length <= 128 && Buffer.byteLength(password, "utf8") <= 512;
}
export async function hashPassword(password) {
  if (!passwordIsValid(password)) throw new Error("INVALID_PASSWORD");
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64, SCRYPT_OPTIONS);
  return `scrypt$32768$8$3$${salt.toString("hex")}$${key.toString("hex")}`;
}
export async function verifyPassword(password, encoded) {
  if (typeof password !== "string" || password.length > 128 || Buffer.byteLength(password, "utf8") > 512) return false;
  if (typeof encoded !== "string") return false;
  const pieces = encoded.split("$");
  if (pieces.length !== 6 || pieces[0] !== "scrypt" || pieces[1] !== "32768" || pieces[2] !== "8" || pieces[3] !== "3" ||
      !/^[a-f0-9]{32}$/.test(pieces[4]) || !/^[a-f0-9]{128}$/.test(pieces[5])) return false;
  const expected = Buffer.from(pieces[5], "hex");
  const actual = await scrypt(password, Buffer.from(pieces[4], "hex"), expected.length, SCRYPT_OPTIONS);
  return timingSafeEqual(actual, expected);
}
const digest = (value) => createHash("sha256").update(value).digest("hex");
const expiryDate = () => new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

export async function createAccount(usernameInput, password) {
  const username = normalizeUsername(usernameInput);
  if (!username || !passwordIsValid(password)) return { status: "invalid" };
  const passwordHash = await hashPassword(password);
  try {
    return await transaction(async (client) => {
      const account = await client.query("INSERT INTO learner_accounts DEFAULT VALUES RETURNING id");
      const learnerId = account.rows[0].id;
      await client.query("INSERT INTO learner_credentials(learner_id,username,password_hash) VALUES($1,$2,$3)", [learnerId, username, passwordHash]);
      return { status: "created", learnerId, username };
    });
  } catch (error) {
    if (error?.code === "23505") return { status: "conflict" };
    throw error;
  }
}

async function claimAttempt(subject) {
  const keyHash = digest(subject);
  // Atomic UPSERT handles concurrent login requests across worker processes.
  const result = await database().query(`
    INSERT INTO auth_attempt_limits(key_hash,attempt_count,window_start)
    VALUES($1,1,now())
    ON CONFLICT(key_hash) DO UPDATE SET
      attempt_count = CASE WHEN auth_attempt_limits.window_start < now() - interval '15 minutes' THEN 1 ELSE auth_attempt_limits.attempt_count + 1 END,
      window_start = CASE WHEN auth_attempt_limits.window_start < now() - interval '15 minutes' THEN now() ELSE auth_attempt_limits.window_start END
    RETURNING attempt_count
  `, [keyHash]);
  return { allowed: result.rows[0].attempt_count <= 5, keyHash };
}

export async function authenticate(usernameInput, password) {
  const username = normalizeUsername(usernameInput);
  if (!username || typeof password !== "string" || !passwordIsValid(password)) return { status: "invalid" };
  const permit = await claimAttempt("login:" + username);
  if (!permit.allowed) return { status: "limited" };
  const result = await database().query(
    "SELECT learner_id,password_hash FROM learner_credentials WHERE username=$1", [username]
  );
  // Match computational effort for unknown usernames to reduce enumeration signals.
  const valid = result.rowCount === 1
    ? await verifyPassword(password, result.rows[0].password_hash)
    : (await scrypt(password, DUMMY_SALT, 64, SCRYPT_OPTIONS), false);
  if (!valid) return { status: "invalid" };
  await database().query("DELETE FROM auth_attempt_limits WHERE key_hash=$1", [permit.keyHash]);
  return { status: "authenticated", learnerId: result.rows[0].learner_id, username };
}

export async function issueSession(learnerId) {
  const token = randomBytes(32).toString("hex");
  const expires = expiryDate();
  await database().query(
    "INSERT INTO learner_sessions(token_hash,learner_id,expires_at) VALUES($1,$2,$3)",
    [digest(token), learnerId, expires]
  );
  return { token, expires };
}

function externallySecure(request) {
  // Browser-facing APP_ORIGIN is the trust anchor when the web process sits behind TLS termination.
  return new URL(process.env.APP_ORIGIN || request.url).protocol === "https:";
}
export function sessionCookieName(request) {
  return externallySecure(request) ? "__Host-devacademy_session" : "devacademy_session";
}
function extractToken(request) {
  const name = sessionCookieName(request);
  const cookie = request.headers.get("cookie") ?? "";
  const pair = cookie.split(";").map((s) => s.trim()).find((s) => s.startsWith(name + "="));
  const token = pair?.slice(name.length + 1);
  return token && TOKEN_PATTERN.test(token) ? token : null;
}
export async function currentLearner(request) {
  const token = extractToken(request);
  if (!token) return null;
  const result = await database().query(`
    SELECT s.learner_id AS "learnerId", c.username
    FROM learner_sessions s
    JOIN learner_credentials c ON c.learner_id=s.learner_id
    WHERE s.token_hash=$1 AND s.expires_at>now()
  `, [digest(token)]);
  return result.rows[0] ?? null;
}
export async function revokeSession(request) {
  const token = extractToken(request);
  if (token) await database().query("DELETE FROM learner_sessions WHERE token_hash=$1", [digest(token)]);
}
export function setSessionCookie(response, request, token, expires) {
  const name = sessionCookieName(request);
  const secure = externallySecure(request);
  const maxAge = Math.max(0, Math.floor((expires.getTime() - Date.now()) / 1000));
  response.headers.append("Set-Cookie", `${name}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`);
}
export function clearSessionCookie(response, request) {
  const name = sessionCookieName(request);
  const secure = externallySecure(request);
  response.headers.append("Set-Cookie", `${name}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`);
}
export async function deleteLearnerAccount(learnerId, password) {
  // Password re-verification must also be throttled after a session is compromised.
  const permit = await claimAttempt("delete:" + learnerId);
  if (!permit.allowed) return false;
  return transaction(async (client) => {
    const result = await client.query("SELECT password_hash FROM learner_credentials WHERE learner_id=$1 FOR UPDATE", [learnerId]);
    if (result.rowCount !== 1 || !(await verifyPassword(password, result.rows[0].password_hash))) return false;
    await client.query("DELETE FROM learner_accounts WHERE id=$1", [learnerId]);
    return true;
  });
}
