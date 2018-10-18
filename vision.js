// export GOOGLE_APPLICATION_CREDENTIALS=/home/davidallen/servicekey.json
// suggested arg /home/david_allen/iran/images.csv
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
		makeHeader('md5'),
		makeHeader('description'),
		makeHeader('score'),
		makeHeader('confidence'),
		makeHeader('topicality'),
		makeHeader('mid'),
	],
});

let recs = 0;
const seen = {};

const text = (file, md5) => {
	if (recs % 1000 === 0) {
		console.log(recs, 'records');
	}

	recs++;
	if (seen[md5]) {
		return true;
	}

	seen[md5] = true;

	return client.textDetection(file)
		.then(results => {
			const dets = results[0].textAnnotations;
			if (dets.length === 0) { return null; }
			const csvRecords = dets.map(text => {
				const obj = {
					md5,
					description: text.description,
					score: text.score,
					confidence: text.confidence,
					topicality: text.topicality,
					mid: text.mid,
				};

				return obj;
			});
			return csvWriter.writeRecords(csvRecords);
		});
};

// Performs label detection on the image file
const labels = (file, md5) => {
	console.log('labels',file,md5);
	if (recs % 1000 === 0) {
		console.log(recs, 'records');
	}

	recs++;
	if (seen[md5]) {
		return true;
	}

	seen[md5] = true;

	return client.labelDetection(file)/* .textDetection(file).faceDetection(fileName).logoDetection(fileName) */
		.then(results => {
			const labels = results[0].labelAnnotations;
			const csvRecords = labels.map(label => ({
				md5,
				description: label.description,
				score: label.score,
				confidence: label.confidence,
				topicality: label.topicality,
				mid: label.mid,
			}));
			return csvWriter.writeRecords(csvRecords);
		});
};

const promises = Promise.map(lines.filter(x => x), line => labels(...line.split(',')), { concurrency: 80 });

promises.then(() => console.log('Done'))
	.catch(err => console.error('Fail', err));

