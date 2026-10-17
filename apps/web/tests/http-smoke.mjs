// Run after production build; tests the actual Next.js server, not mocked handlers.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

async function reserveAvailablePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const port = address.port;
  server.close();
  await once(server, "close");
  return port;
}

const cwd = fileURLToPath(new URL("../", import.meta.url));
const port = await reserveAvailablePort();
const base = `http://127.0.0.1:${port}`;
const nextCli = join(cwd, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(port)],
  { cwd, env: { ...process.env, APP_ORIGIN: base, NEXT_TELEMETRY_DISABLED: "1" }, stdio: ["ignore", "pipe", "pipe"] });
let logs = "";
for (const output of [child.stdout, child.stderr]) output.on("data", (data) => { logs = (logs + data.toString()).slice(-5000); });

async function jsonPost(input) {
  return fetch(`${base}/api/assess`, { method: "POST", headers: { "Content-Type": "application/json", "Origin": base }, body: JSON.stringify(input) });
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (child.exitCode !== null) throw Error(`Server exited: ${child.exitCode}\n${logs}`);
    try {
      const probe = await fetch(`${base}/api/health`);
      ready = probe.ok;
      if (ready) break;
    } catch { /* Server still starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(ready, `Production server did not start.\n${logs}`);

  const home = await fetch(base);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /İlk derslere başla/);
  const catalog = await fetch(`${base}/kutuphane/diller`);
  assert.equal(catalog.status, 200);
  assert.ok((await catalog.text()).includes('href="/kurslar/javascript-temelleri"'));
  const lessons = await fetch(`${base}/dersler`);
  assert.equal(lessons.status, 200);
  assert.match(await lessons.text(), /Değişkenler: let ve const/);
  const lesson = await fetch(`${base}/dersler/degiskenler`);
  assert.equal(lesson.status, 200);
  assert.match(await lesson.text(), /Cevabımı kontrol et/);
  assert.equal((await fetch(`${base}/dersler/not-a-lesson`)).status, 404);

  // Generic course routes and second-language questions remain fully server-rendered.
  const courseList = await fetch(`${base}/kurslar`);
  assert.equal(courseList.status,200);
  assert.match(await courseList.text(),/Java Temelleri/);
  const javaCourse = await fetch(`${base}/kurslar/java-temelleri`);
  assert.equal(javaCourse.status,200);
  assert.match(await javaCourse.text(),/Değişkenler ve veri türleri/);
  const javaLesson = await fetch(`${base}/kurslar/java-temelleri/degiskenler-ve-turler`);
  assert.equal(javaLesson.status,200);
  const javaHtml = await javaLesson.text();
  assert.ok(javaHtml.includes("Java kod editörü"));
  assert.match(javaHtml,/Cevabımı kontrol et/);
  assert.equal((await fetch(`${base}/kurslar/java-temelleri/does-not-exist`)).status,404);
  assert.equal((await fetch(`${base}/kurslar/no-course`)).status,404);
  assert.equal((await fetch(`${base}/kurslar/javascript-temelleri/degiskenler`)).status,200);
  const pythonCourse=await fetch(`${base}/kurslar/python-temelleri`);
  assert.equal(pythonCourse.status,200);
  assert.match(await pythonCourse.text(),/Listeler ve sözlükler/);
  const pythonLesson=await fetch(`${base}/kurslar/python-temelleri/degiskenler-ve-turler`);
  assert.equal(pythonLesson.status,200);
  const pythonHtml=await pythonLesson.text();
  assert.match(pythonHtml,/Python/);
  assert.match(pythonHtml,/Düz metin modu/);
  assert.match(pythonHtml,/Cevabımı kontrol et/);
  assert.equal((await fetch(`${base}/kurslar/python-temelleri/olmayan-ders`)).status,404);
  const pythonCorrect=await jsonPost({questionId:"python.variables.division",optionId:"b"});
  assert.equal(pythonCorrect.status,200);
  assert.equal((await pythonCorrect.json()).correct,true);
  const pythonWrong=await jsonPost({questionId:"python.collections.get",optionId:"a"});
  assert.equal(pythonWrong.status,200);
  assert.equal((await pythonWrong.json()).correct,false);
  // M6 guided learning: page phases, grammar-ready editor, and tailored misconception feedback.
  assert.match(javaHtml,/Hatayı düzelt/);
  assert.match(javaHtml,/Önce kendi tahminini yap/);
  assert.match(pythonHtml,/Hata avcısı/);
  assert.match(pythonHtml,/Kodun zihinsel izini çıkar/);
  const misconception=await jsonPost({questionId:"debug.python.variables",optionId:"b"});
  assert.equal(misconception.status,200);
  const detail=await misconception.json();
  assert.equal(detail.correct,false);
  assert.match(detail.tailoredFeedback,/str ile int/);
  const repaired=await jsonPost({questionId:"debug.java.methods",optionId:"a"});
  assert.equal(repaired.status,200);
  assert.equal((await repaired.json()).correct,true);
  const javaGrade=await jsonPost({questionId:"java.variables.increment",optionId:"b"});
  assert.equal(javaGrade.status,200);
  assert.equal((await javaGrade.json()).correct,true);
  const javaWrong=await jsonPost({questionId:"java.polymorphism.field",optionId:"b"});
  assert.equal(javaWrong.status,200);
  assert.equal((await javaWrong.json()).correct,false);

  const practice = await fetch(`${base}/pratik`);
  assert.equal(practice.status,200);
  assert.match(await practice.text(),/Çift sayıları topla/);
  const task=await fetch(`${base}/pratik/cift-sayilari-topla`);
  assert.equal(task.status,200);
  assert.match(await task.text(),/sumEven/);
  assert.equal((await fetch(`${base}/pratik/no-such-task`)).status,404);
  const availability=await (await fetch(`${base}/api/executions/availability`)).json();
  assert.equal(availability.enabled,false);
  assert.equal((await fetch(`${base}/hesap`)).status, 200);
  assert.equal((await fetch(`${base}/api/me`)).status, 200);
  const valid = await jsonPost({ questionId: "js.binding.increment", optionId: "b" });
  assert.equal(valid.status, 200);
  assert.equal(valid.headers.get("cache-control"), "no-store");
  const passed = await valid.json();
  assert.equal(passed.correct, true);
  assert.equal(passed.correctOptionId, "b");
  const incorrect = await jsonPost({ questionId: "js.binding.increment", optionId: "a" });
  assert.equal(incorrect.status, 200);
  assert.equal((await incorrect.json()).correct, false);
  assert.equal((await jsonPost({ questionId: "unknown", optionId: "a" })).status, 400);
  assert.equal((await jsonPost({ questionId: "js.binding.increment", optionId: "x" })).status, 400);
  const oversized = await fetch(`${base}/api/assess`, { method: "POST", headers: { "Content-Type": "application/json", "Origin": base }, body: "x".repeat(4096) });
  assert.equal(oversized.status, 413);
  const unsupportedType = await fetch(`${base}/api/assess`, { method: "POST", headers: { "Content-Type": "text/plain", "Origin": base }, body: "hello" });
  assert.equal(unsupportedType.status, 415);
  assert.equal((await fetch(`${base}/api/assess`)).status, 405);
  console.log("Production HTTP smoke PASS: routes, grading, invalid inputs and body limits.");
} catch (error) {
  console.error(logs);
  throw error;
} finally {
  child.kill("SIGTERM");
}
