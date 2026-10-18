# M8.3: Independent Code-Writing Transfer

## Educational contract

The previous M8.1/M8.2 loop measured prediction of output under a
counterfactual change. M8.3 adds **actual independent function construction**,
so learners can demonstrate that they can produce executable behavior from a
new requirement, not merely recognize a result.

The first six authored challenges map one-to-one to prior lessons:

- JS variable/objects -> snapshotScore(score,delta), output pair
- JS Array.map -> scaleCopy(values,factor), array output
- Java integer division -> exactDivide(numerator,denominator), floating output
- Java inheritance/overloads -> combineSounds(base,extra,value), integer output
- Python range boundary -> sum_exclusive(start,stop), integer output
- Python print/return -> return_product(value,factor), actual returned integer

Students receive a function signature, requirement and **two public input/output
examples**. They must write the body from scratch. Two or three hidden test
cases per task are held only by the trusted worker (never imported by Next.js,
not sent in a response). This test verifies *behavioral correctness*, not use
of a specific algorithm, method override or a cognitive model. In particular,
the Java overload task encourages that technique but output-only assessment
cannot prove it was used. Do not describe this as a complete programming
competency certificate.

## Strict provenance of evidence

The code proof is calculated **read-only** from existing durable
execution_jobs records; it is not an API claim that a client can assert.

For an eligible proof, all conditions must hold:
- owner is authenticated; the lesson has an M8.1 independent stage-0 pass;
- the assessment job belongs to the same account and matching exercise/revision;
- the job was created after the initial independent transfer timestamp;
- the job has actually completed with a trusted worker's 'passed' summary,
  where passed == total and the untrusted source has been erased.

Coached M8.2 probes cannot unlock code proof. Passing an unrelated public
practice job or a prior attempt cannot inflate proof. The account dashboard
counts unique verified lessons, separate from guided completion, predicted
transfer and delayed retention.

## Security and privacy

DO NOT enable the public runner. Execution remains behind:
RUNNER_LAB_ENABLED=1, non-production Next, loopback APP_ORIGIN, auth, same-origin
POST requests, queue quota and an external trusted worker with pinned image
digests. Every test runs in a fresh read-only, non-root, network-disabled
container with memory, CPU, file and output limits. Learner source is present
only transiently in queued/running execution_jobs and cleared at terminal
status; database logs, backups and WAL still need separate retention policy.
Results persist only as bounded grade summaries. The proofs need no new
migration; prior 0007 and 0008 must already have been applied.

Production and shared public environments intentionally show an editable
exercise but **cannot mark it as passed** until a separately approved
safe public execution service exists. This is a validated local-lab
prototype, not an internet-facing sandbox.

## Quality gate

- CI: lesson mappings and private/public test contract validation.
- Disposable PostgreSQL: verifies the worker-completion provenance,
  historical ordering, owner isolation and cascade deletion.
- Docker CI: genuinely executes six correct reference implementations
  in isolated Java/Python/Node containers against all public and hidden
  tests, plus rejects solutions hardcoding only the two public examples.
- Responsive/browser tests preserve previous coursework interactions.

## Next research question

Collect paired outcomes from volunteers: independent prediction accuracy vs
actual code-writing transfer accuracy, time to successful solution, time
spent in remedial probes, and delayed code-writing accuracy. Distinguish
*observed correctness* from *explanation quality*; avoid silently grading
learner free text.
