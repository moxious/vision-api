// export GOOGLE_APPLICATION_CREDENTIALS=/home/davidallen/servicekey.json
const vision = require('@google-cloud/vision');
const yargs = require('yargs');
const Promise = require('bluebird');
const csv = require('csv');
const argv = yargs.argv;
const fs = require('fs');

console.log(argv);

if (argv._.length === 0) {
   console.log('Usage: node vision.js filename');
   process.exit(1);
}

const inputFile = argv._[0];
const data = fs.readFileSync(inputFile).toString('utf-8');
const lines = data.split(/\n/);

// Creates a client
const client = new vision.ImageAnnotatorClient();

const makeHeader = val => ({ id: val, title: val });

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
   path: 'output.csv',
   header: [
	   makeHeader('description'),
	   makeHeader('score'),
	   makeHeader('confidence'),
	   makeHeader('topicality'),
	   makeHeader('mid'),
	   makeHeader('file'),
   ],
});

const text = file => {
  return client.textDetection(file)
	.then(results => {
		const dets = results[0].textAnnotations;
		if (dets.length === 0) { return null; }
		const csvRecords = dets.map(text => {
			const obj = {
				description: text.description,
				score: text.score,
				confidence: text.confidence,
				topicality: text.topicality,
				mid: text.mid,
				file,
			};

			return obj;
		});
		return csvWriter.writeRecords(csvRecords);
	});
};

// Performs label detection on the image file
const labels = file => {
   return client.labelDetection(file)/* .textDetection(file).faceDetection(fileName).logoDetection(fileName) */
	.then(results => {
		// console.log(JSON.stringify(results, null, 2));
		// const dets = results[0].textAnnotations;
		const labels = results[0].labelAnnotations;
                const csvRecords = labels.map(label => ({
                    description: label.description,
		    score: label.score,
		    confidence: label.confidence,
		    topicality: label.topicality,
		    mid: label.mid,
		    file,
		}));
		return csvWriter.writeRecords(csvRecords);
	});
};


const promises = Promise.map(lines.filter(x => x), labels, { concurrency: 80 });

promises.then(() => console.log('Done'))
  .catch(err => console.error('Fail',err));

