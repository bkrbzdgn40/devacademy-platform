import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { gradeSubmission, answerKeyIds } from "../src/server/grade.ts";

const lessons = JSON.parse(readFileSync(new URL("../src/data/lessons.json", import.meta.url), "utf8")).filter(x=>x.id.startsWith("lesson.javascript."));
const questions = JSON.parse(readFileSync(new URL("../src/data/questions.json", import.meta.url), "utf8")).filter(x=>x.id.startsWith("js."));

function assertUnique(rows, key) { assert.equal(new Set(rows.map((row) => row[key])).size, rows.length); }

test("lesson identities and graph are consistent", () => {
  assert.equal(lessons.length, 7);
  assertUnique(lessons, "id");
  assertUnique(lessons, "slug");
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const visited = new Set();
  function check(id, parents = new Set()) {
    assert.ok(!parents.has(id), "prerequisite cycle");
    if (visited.has(id)) return;
    const lesson = byId.get(id);
    assert.ok(lesson, `Missing prerequisite: ${id}`);
    const ancestry = new Set([...parents, id]);
    for (const predecessor of lesson.prerequisites) check(predecessor, ancestry);
    visited.add(id);
  }
  for (const lesson of lessons) {
    assert.ok(lesson.title && lesson.explanation && lesson.objective && lesson.code);
    assert.ok(lesson.questionIds.length >= 2);
    check(lesson.id);
  }
});

test("published questions have complete private answer keys and no public answers", () => {
  assert.equal(questions.length, 14);
  assertUnique(questions, "id");
  assert.deepEqual(answerKeyIds().filter(id=>id.startsWith("js.")).sort(), questions.map(question=>question.id).sort());
  const questionIds = new Set(questions.map((q) => q.id));
  for (const question of questions) {
    assert.ok(!("correctOptionId" in question) && !("explanation" in question), "answers leaked into public lesson content");
    assert.ok(lessons.some((lesson) => lesson.id === question.lessonId && lesson.questionIds.includes(question.id)));
    assert.ok(question.options.length >= 2);
    assertUnique(question.options, "id");
    const grade = question.options.map((option) => gradeSubmission({questionId:question.id, optionId:option.id}));
    assert.equal(grade.filter((result) => result.status === "graded" && result.correct).length, 1);
    assert.ok(grade.every((result) => result.status === "graded" && result.explanation.length > 0));
    assert.ok(questionIds.has(question.id));
  }
});

test("correct answers match actual trusted example outputs", async () => {
  for (const question of questions) {
    const lines = [];
    // Fixtures are version-controlled developer-reviewed snippets, never learner submissions.
    await Promise.resolve(vm.runInNewContext(`(async () => { ${question.code}\nawait Promise.resolve(); })()`, { console: { log: (...args) => lines.push(args.map(String).join(" ")) }, queueMicrotask }, {timeout: 500}));
    const correct = question.options.find((option) => gradeSubmission({ questionId:question.id, optionId:option.id }).correct);
    assert.equal(lines[0], correct.text, `Snippet mismatch for ${question.id}`);
  }
});

test("malformed and unknown submissions fail closed", () => {
  for (const input of [null, [], {}, {questionId: "unknown",optionId:"a"}, {questionId:"js.binding.increment",optionId:"x"}, {questionId:42,optionId:"b"}, {questionId:"js.binding.increment",optionId:null}]) {
    assert.deepEqual(gradeSubmission(input), {status:"invalid"});
  }
});
