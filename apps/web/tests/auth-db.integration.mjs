import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { database } from "../src/server/db.mjs";
import { createAccount, authenticate, issueSession, currentLearner, deleteLearnerAccount, revokeSession, hashPassword, verifyPassword, normalizeUsername } from "../src/server/auth.mjs";
import { recordAttempt, getLearningProgress, updateLessonProgress } from "../src/server/learning-store.mjs";
import { gradeSubmission } from "../src/server/grade.ts";
import { isSameOrigin } from "../src/server/http.mjs";

const password = "Correct-Horse-Battery-Staple-2026";
const namespace = randomBytes(5).toString("hex");
const userA = "alpha_" + namespace, userB = "beta_" + namespace;

test("auth, durable progress, authorization and cascade integration", async () => {
  assert.equal(normalizeUsername("  "+userA.toUpperCase()+"  "), userA);
  assert.equal(normalizeUsername("not valid!"), null);
  const passhash = await hashPassword(password);
  assert.equal(passhash.includes(password), false);
  assert.equal(await verifyPassword(password,passhash), true);
  assert.equal(await verifyPassword("not-the-password",passhash), false);

  const a = await createAccount(userA,password);
  assert.equal(a.status,"created");
  const duplicate = await createAccount(userA,password);
  assert.equal(duplicate.status,"conflict");
  const b = await createAccount(userB,password);
  assert.equal(b.status,"created");

  try {
    assert.equal((await authenticate(userA,"incorrect-password-long")).status,"invalid");
    assert.equal((await authenticate(userA,password)).status,"authenticated");
    const sessionA = await issueSession(a.learnerId);
    const sessionB = await issueSession(b.learnerId);
    const url = "http://localhost:3000/api/progress";
    const requestA = new Request(url,{headers:{cookie:"devacademy_session="+sessionA.token}});
    const requestB = new Request(url,{headers:{cookie:"devacademy_session="+sessionB.token}});
    assert.equal((await currentLearner(requestA)).learnerId,a.learnerId);
    assert.equal((await currentLearner(requestB)).learnerId,b.learnerId);
    assert.equal(await currentLearner(new Request(url,{headers:{cookie:"devacademy_session=abc"}})),null);
    assert.equal(isSameOrigin(new Request(url,{headers:{origin:"http://evil.example"}})),false);
    assert.equal(isSameOrigin(new Request(url,{headers:{origin:"http://localhost:3000"}})),true);

    const lessonId="lesson.javascript.let-const";
    assert.equal((await updateLessonProgress(a.learnerId,lessonId,"complete")).status,"incomplete");
    await updateLessonProgress(a.learnerId,lessonId,"view");
    const wrong=gradeSubmission({questionId:"js.binding.increment",optionId:"a"});
    assert.equal(wrong.status,"graded");
    await recordAttempt(a.learnerId,wrong,"a");
    assert.equal((await updateLessonProgress(a.learnerId,lessonId,"complete")).status,"incomplete");
    for(const [id,optionId] of [["js.binding.increment","b"],["js.binding.object","c"]]){
      const grade=gradeSubmission({questionId:id,optionId});
      assert.equal(grade.correct,true);
      await recordAttempt(a.learnerId,grade,optionId);
    }
    assert.equal((await updateLessonProgress(a.learnerId,lessonId,"complete")).status,"completed");
    const own=await getLearningProgress(a.learnerId);
    const other=await getLearningProgress(b.learnerId);
    assert.ok(own.lessons.some(x=>x.lessonId===lessonId&&x.completedAt));
    assert.equal(own.recentAttempts.length,3);
    assert.equal(other.lessons.length,0);
    assert.equal(other.recentAttempts.length,0);
    assert.equal((await updateLessonProgress(b.learnerId,lessonId,"complete")).status,"incomplete");

    await revokeSession(requestA);
    assert.equal(await currentLearner(requestA),null);
    const fresh = await issueSession(a.learnerId);
    const requestFresh=new Request(url,{headers:{cookie:"devacademy_session="+fresh.token}});
    assert.ok(await currentLearner(requestFresh));
    assert.equal(await deleteLearnerAccount(a.learnerId,"incorrect-password-long"),false);
    assert.ok(await currentLearner(requestFresh));
    assert.equal(await deleteLearnerAccount(a.learnerId,password),true);
    assert.equal(await currentLearner(requestFresh),null);
    assert.equal((await database().query("SELECT count(*)::int AS n FROM learning_attempts WHERE learner_id=$1",[a.learnerId])).rows[0].n,0);
    assert.equal((await database().query("SELECT count(*)::int AS n FROM learner_sessions WHERE learner_id=$1",[a.learnerId])).rows[0].n,0);
    assert.ok(await currentLearner(requestB),"another account is not deleted");
  } finally {
    await database().query("DELETE FROM learner_accounts WHERE id=ANY($1::uuid[])",[[a.learnerId,b.learnerId]]);
  }
});

test("login throttling is enforced at database layer", async () => {
  const username="throttle_" + randomBytes(4).toString("hex");
  for(let i=0;i<5;i++) assert.equal((await authenticate(username,password)).status,"invalid");
  assert.equal((await authenticate(username,password)).status,"limited");
  await database().query("DELETE FROM auth_attempt_limits WHERE key_hash=$1",[createHash("sha256").update("login:"+username).digest("hex")]);
});

test.after(async () => { await database().end(); });
