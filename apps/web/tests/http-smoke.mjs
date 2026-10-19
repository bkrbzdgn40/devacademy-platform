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
  assert.equal(home.headers.get("x-frame-options"),"DENY");
  assert.equal(home.headers.get("x-content-type-options"),"nosniff");
  assert.equal(home.headers.get("referrer-policy"),"strict-origin-when-cross-origin");
  const homeHtml=await home.text();
  assert.match(homeHtml,/Öğrenme yollarını keşfet/);
  assert.match(homeHtml,/Kaldığın yeri arama/);
  assert.match(homeHtml,/Haber akışını aç/);
  assert.ok(homeHtml.includes('href="/radar"'));
  const radar=await fetch(`${base}/radar`);
  assert.equal(radar.status,200);
  const radarHtml=await radar.text();
  assert.match(radarHtml,/Kaynakların durumu/);
  assert.match(radarHtml,/Sektör Radarı/);
  const catalog = await fetch(`${base}/kutuphane/diller`);
  assert.equal(catalog.status, 200);
  assert.ok((await catalog.text()).includes('href="/kurslar/javascript-temelleri"'));
  const lessons = await fetch(`${base}/dersler`);
  assert.equal(lessons.status, 200);
  assert.match(await lessons.text(), /Değişkenler: let ve const/);
  const lesson = await fetch(`${base}/dersler/degiskenler`);
  assert.equal(lesson.status, 200);
  assert.match(await lesson.text(), /Ders aşamaları/);
  assert.equal((await fetch(`${base}/dersler/not-a-lesson`)).status, 404);

  // Generic course routes and second-language questions remain fully server-rendered.
  const courseList = await fetch(`${base}/kurslar`);
  assert.equal(courseList.status,200);
  const courseHtml=await courseList.text();
  assert.match(courseHtml,/Java Temelleri/);
  assert.match(courseHtml,/Kurs veya ders ara/);
  const javaCourse = await fetch(`${base}/kurslar/java-temelleri`);
  assert.equal(javaCourse.status,200);
  assert.match(await javaCourse.text(),/Değişkenler ve veri türleri/);
  const javaLesson = await fetch(`${base}/kurslar/java-temelleri/degiskenler-ve-turler`);
  assert.equal(javaLesson.status,200);
  const javaHtml = await javaLesson.text();
  assert.ok(javaHtml.includes("Ders aşamaları"));
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
  assert.match(pythonHtml,/Ders aşamaları/);
  assert.match(pythonHtml,/Cevabımı kontrol et/);
  assert.equal((await fetch(`${base}/kurslar/python-temelleri/olmayan-ders`)).status,404);
  const pythonCorrect=await jsonPost({questionId:"python.variables.division",optionId:"b"});
  assert.equal(pythonCorrect.status,200);
  assert.equal((await pythonCorrect.json()).correct,true);
  const pythonWrong=await jsonPost({questionId:"python.collections.get",optionId:"a"});
  assert.equal(pythonWrong.status,200);
  assert.equal((await pythonWrong.json()).correct,false);
  // M6 guided learning: page phases, grammar-ready editor, and tailored misconception feedback.
  assert.match(javaHtml,/Hata avcısı/);
  assert.match(javaHtml,/Önce kendi tahminini yap/);
  assert.match(pythonHtml,/Hata avcısı/);
  assert.match(pythonHtml,/Anla ve izle/);
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

  const sqlCourse=await fetch(`${base}/kurslar/sql-temelleri`);
  assert.equal(sqlCourse.status,200);
  assert.match(await sqlCourse.text(),/SQL Temelleri/);
  const sqlData=await fetch(`${base}/sql-ornek-veri`);
  assert.equal(sqlData.status,200);
  assert.match(await sqlData.text(),/musteriler/);
  const sqlLesson=await fetch(`${base}/kurslar/sql-temelleri/where-ve-null`);
  assert.equal(sqlLesson.status,200);
  assert.match(await sqlLesson.text(),/WHERE, AND ve NULL/);
  assert.equal((await fetch(`${base}/kurslar/sql-temelleri/missing`)).status,404);
  const sqlGrade=await jsonPost({questionId:"sql.where.null",optionId:"a"});
  assert.equal(sqlGrade.status,200);
  assert.equal((await sqlGrade.json()).correct,true);
  const practice = await fetch(`${base}/pratik`);
  assert.equal(practice.status,200);
  const practiceHtml=await practice.text();
  assert.match(practiceHtml,/Çift sayıları topla/);
  assert.match(practiceHtml,/Serbest JavaScript laboratuvarını aç/);
  const task=await fetch(`${base}/pratik/cift-sayilari-topla`);
  assert.equal(task.status,200);
  assert.match(await task.text(),/sumEven/);
  assert.equal((await fetch(`${base}/pratik/no-such-task`)).status,404);
  for(const [slug,needle] of [["python-cift-topla","sum_even"],["java-araliga-sinirla","class Solution"]]){
    const page=await fetch(`${base}/pratik/${slug}`);
    assert.equal(page.status,200);
    assert.match(await page.text(),new RegExp(needle));
  }
  const availability=await (await fetch(`${base}/api/executions/availability`)).json();
  assert.equal(availability.enabled,false);
  const review=await fetch(`${base}/tekrar`);
  assert.equal(review.status,200);
  assert.match(await review.text(),/Hatırladığını kanıtla/);
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
