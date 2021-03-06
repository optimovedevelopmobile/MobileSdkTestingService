const functions = require('firebase-functions');
const admin = require('firebase-admin');
const testManager = require('./testManager').testManager;
const registrationManager = require('./registrationManager').registrationManager;
const pushDispatcher = require('./pushDispatcher').pushDispatcher;
const gcpKey = require('./.gcpKey.json');

// admin.initializeApp(functions.config().firebase);
admin.initializeApp({
  credential: admin.credential.cert(gcpKey),
  databaseURL: "https://mobilesdktestingservice.firebaseio.com"
});
const db = admin.database();
testManager.init(db);
registrationManager.init(db);

const appNames = {
	1: "Full",
	2: "NoFirebase",
	3: "OptiTrack",
	4: "OptiPush",
  5: "SDKDevelopmentProject"
};

//Get Information Functions

exports.testCases = functions.https.onRequest((req, res) => {
	let component = req.query.component;
	if (component) {
		let testCases = testManager.testCases[component];
		if (!testCases) {
			res.json({error: "No such component"});
		} else {
			res.json(testCases);
		}
	} else {
		res.json(testManager.testCases.allGrouped);
	}
});

//Testing Functions

exports.testDbConnection = functions.https.onRequest((req, res) => {
  return admin.database().ref().once('value')
  .then(function(snapshot) {
      res.json(snapshot);
  }).catch(function(error) {
      res.json(error);
  });
});

exports.testSdk = functions.https.onRequest((req, res) => {

	function startNewTest() {

		function sendStartTestPushMessage(payload) {
			pushDispatcher.sendPush(tenantId, payload)
			.then(function(response){
		    res.json(response);
		  }).catch(function(error){
		    res.json(error);
		  });
		}

		let testCase = testManager.testCases.allFlat[req.body.testCase];
		let tenantId = req.body.tenantId;
		let sourceOs = req.body.sourceOs;
    let testParams = req.body.testParams;

		let testRef = db.ref(sourceOs).push();
		let testId = testRef.key;

		testRef.set({
			story: testCase.name,
			components: testCase.components,
			status: "pending",
			appName: appNames[tenantId]
		}, function(error) {
			if (error) {
				console.error("Failed to create new test node at firebase");
				res.status(500).send('Internal Server Error');
				return;
			}
			testManager.reportTestManagerTestStep("start", {
				testId: testId,
				testCaseName: testCase.name,
				sourceOs: sourceOs
			})
			.then(function() {
				let payload = testManager.generateStartTestPayload(testCase, testId, testParams);
				sendStartTestPushMessage(payload);
			})
			.catch(function(error) {
				console.error(error);
				res.status(500).send('Internal Server Error');
			});
		});
	}

	function reportTestStep() {

		let stepData = {
			stepSource: "client",
			stepPhase: req.body.stepPhase,
			stepMessage: req.body.stepMessage,
			testId: req.body.testId,
			testCaseName: req.body.testCaseName,
			timestamp: req.body.timestamp,
			sourceOs: req.body.sourceOs
		};
		testManager.reportTestStep(stepData)
		.then(function(response){
			console.log(response);
			res.json(response);
			if (stepData.stepPhase === "finish") {
				testManager.validatePiwikData(stepData, functions.config().piwikdb);
			}
		}).catch(function(error){
			console.error(error);
			res.json(error);
		});
	}

	let method = req.query.method;
	if (method === "start") {
		startNewTest();
	} else if (method === "report") {
		reportTestStep();
	} else {
		res.json({error: "Unknown test method"});
	}
});

//Registration Functions

exports.registration = functions.https.onRequest((req, res) => {

  registrationManager.registerNewDevice({
    tenantId: req.body.tenantId,
    deviceId: req.body.deviceId,
    osVersion: req.body.osVersion,
    fcmToken: req.body.fcmToken,
    publicCustomerId: req.body.publicCustomerId,
    isCustomer: req.body.isCustomer,
    optIn: req.body.optIn,
    os: req.body.osName
  }).then(function(status) {
    res.json(status);
  }).catch(function(error) {
    res.json(error);
  });
});
