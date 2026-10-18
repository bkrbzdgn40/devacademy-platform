# M8.2 - Yanılgı Laboratuvarı

## Observation-based adaptation

This experimental learning system **does not read minds**. It observes which
of two predicted outputs was wrong, and routes the learner to a deliberately
different code sample designed to test one possible misconception.

- A wrong, B correct: focus on the first operation or binding.
- A correct, B wrong: focus on the contrasted second operation.
- Both wrong: alternate A and B-focused interventions to isolate a cause.
- Both correct: eligible for evidence only when the current task is independent.

Each of the six concepts (JS binding/map; Java casting/overloading; Python
range/return) has two reviewed interventions, twelve in total. Explanations
are authored, concrete and explicitly uncertain. A confidence self-report
helps reflect on overconfidence but does not change the grading algorithm.

## Evidence separation

Coached diagnostic questions have assisted=true. A correct coached answer
only switches the student to a **fresh independent challenge**. It does not
set passed_at or unlock a 24-hour recall checkpoint. Independent passing and
delayed retention preserve the previous M8.1 semantics. All stages continue
to share the 8-attempt cap, followed by a 24-hour cooldown.

## Security, privacy and rollout

The additive migration db/migrations/0008_adaptive_probes.sql must be
applied after 0007 to a disposable local or QA PostgreSQL database before
using this feature. Historic trial rows default to standard focus.

The server stores only focus (standard/a/b), the most recent observed
error shape (a/b/both) and a random per-problem challenge UUID. The latter
is a **stale-form guard**, not a substitute for authenticated sessions.
All writes remain owner-scoped and serialize on the existing lesson lock.
Each new task rotates its challenge identifier. No raw outputs, student
source code, or causal reflections are stored. No learner code is executed.

The UI explains that these are falsifiable pedagogic hypotheses, not
psychological diagnoses or learning-quality certification. Public runner
availability and Docker safety boundaries are unchanged.

## Tests and remaining questions

- Unit tests check both error patterns and all 12 focused templates.
- CI runs six concepts x three focuses x two seeds, 36 executable
  JavaScript, Java and Python fixtures.
- Disposable PostgreSQL tests check the additive schema, learner isolation,
  stale submissions, coached success not granting progress, retention delay,
  cooldown and cascade deletion.
- Authenticated HTTP tests cover ownership, CSRF and challenge rotation.

This method is experimental. Improvements to learning are not established
without controlled learner trials comparing delayed success and independent
code writing. A validated mental model cannot be inferred from two outputs
alone. A future release should test a separate code-writing transfer task.
