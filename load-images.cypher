USING PERIODIC COMMIT
LOAD CSV 
FROM 'file:///images.csv' AS line 
WITH line[0] as fileName, line[1] as md5, line[2] as tweetid, line[3] as userid, line[4] as segment

MERGE (m:Media {
    file: fileName,
    type: 'image',
    md5: md5,
    segment: segment
})

RETURN count(m);
