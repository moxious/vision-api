USING PERIODIC COMMIT
LOAD CSV WITH HEADERS 
FROM 'file:///run2.csv' AS line 
MATCH (m:Media { md5: line.md5 })
MERGE (l:Label { name: line.description })
MERGE (m)-[r:LABELED {
  score: line.score,
  confidence: line.confidence,
  topicality: line.topicality,
  mid: line.mid
}]->(l)
RETURN count(r);
