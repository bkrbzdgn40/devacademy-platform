// Trusted SQL fixtures only. Requires an isolated local CI database, never a
// connection used by the application or a real learner. No learner queries.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import pg from "pg";
import lessons from "../src/data/lessons.json" with {type:"json"};
import questions from "../src/data/questions.json" with {type:"json"};
import answers from "../src/server/answer-keys.json" with {type:"json"};

const raw=process.env.M11_SQL_TEST_DATABASE_URL;
if(!raw)throw Error("M11_SQL_TEST_DATABASE_URL_REQUIRED");
const url=new URL(raw);
assert.ok(["127.0.0.1","localhost"].includes(url.hostname),"M11 SQL fixtures must stay local");
assert.equal(url.pathname,"/devacademy_sql_ci","Never connect to live learner data");
const {Client}=pg;
const client=new Client({connectionString:raw,connectionTimeoutMillis:3000});
const rows={
 "sql.select.desc":[["Can"]],
 "sql.select.columns":[[1,"Ayşe"],[2,"Bora"],[3,"Can"]],
 "sql.where.delivered":[[10],[12],[14]],
 "sql.where.null":[[11]],
 "sql.join.left":[["Can"]],
 "sql.join.inner":[["Ayşe",10],["Ayşe",11],["Bora",12],["Bora",13],["Ayşe",14]],
 "sql.group.totals":[["250"]], // SUM(integer) is bigint; node-postgres preserves 64-bit values as strings.
 "sql.group.having":[[2]]
};
const expectedOptions={
 "sql.select.desc":"Can","sql.select.columns":"2",
 "sql.where.delivered":"3","sql.where.null":"11",
 "sql.join.left":"Can","sql.join.inner":"5",
 "sql.group.totals":"250","sql.group.having":"2"
};
await client.connect();
try{
  await client.query("BEGIN");
  // Both tables are TEMP and automatically disappear after the connection.
  await client.query(readFileSync(new URL("./fixtures/m11-sql-seed.sql",import.meta.url),"utf8"));
  const sqlLessons=lessons.filter(x=>x.id.startsWith("lesson.sql."));
  assert.equal(sqlLessons.length,4);
  for(const lesson of sqlLessons){
    assert.match(lesson.code,/^SELECT\s/i);
    const result=await client.query(lesson.code);
    assert.ok(result.rows.length>0,"Example produced no rows: "+lesson.id);
  }
  let checked=0;
  for(const q of questions.filter(x=>x.id.startsWith("sql."))){
    assert.ok(Object.hasOwn(rows,q.id),q.id+" missing SQL fixture");
    assert.match(q.code,/^SELECT\s/i);
    const result=await client.query(q.code);
    const actual=result.rows.map(x=>Object.values(x));
    assert.deepEqual(actual,rows[q.id],q.id+" PostgreSQL result differs from reviewed key");
    const key=answers[q.id];
    assert.ok(key);
    const correct=q.options.find(x=>x.id===key.optionId);
    assert.equal(correct.text,expectedOptions[q.id],q.id+" answer key mismatch");
    checked++;
  }
  assert.equal(checked,8);
  console.log("PostgreSQL 16 trusted SQL curriculum fixtures PASS: 4 lessons and 8 graded questions.");
}finally{
  await client.query("ROLLBACK").catch(()=>{});
  await client.end();
}
