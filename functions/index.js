const functions = require('firebase-functions');
const admin = require('firebase-admin');
const mySql = require('mysql');
const testManager = require('./testManager').testManager;
const pushDispatcher = require('./pushDispatcher').pushDispatcher;
const gcpKey = require('./.gcpKey.json');


// admin.initializeApp(functions.config().firebase);
admin.initializeApp({
  credential: admin.credential.cert(gcpKey),
  databaseURL: "https://mobilesdktestingservice.firebaseio.com"
});
const db = admin.database();
testManager.init(db);

const appNames = {
	1: "Full",
	2: "NoFirebase",
	3: "OptiTrack",
	4: "OptiPush"
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

exports.piwikDemo = functions.https.onRequest((req, res) => {

	function queryDb() {
		let sql = "SELECT *, hex(idvisitor) FROM piwik_log_link_visit_action ORDER BY idlink_va DESC LIMIT 1";
		mySqlConnector.query(sql, function(error, result) {
			if (error) {
				console.error(error);
				res.send("query error!");
			} else {
				res.json(result);
			}
		});
	}

	const mySqlConnector = mySql.createConnection(functions.config().piwikdb);

	mySqlConnector.connect(function(error){
		if (error) {
			res.json(Object.assign(error, { whatHappened:'connection error!'}));
		} else {
			queryDb();
		}
	});
});

//Testing Functions

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

		let testRef = db.ref(sourceOs).push();
		let testId = testRef.key;

		testRef.set({
			story: testCase.name,
			components: testCase.components,
			status: "pending",
			appName: appNames[tenantId]
		}, function(error) {
			console.log("basdubasduibasudasudygasuydgasuydgausydguy");
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
				let payload = testManager.generateStartTestPayload(testCase, testId);
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

	let tenantId = req.body.tenantId;
	let deviceId = req.body.deviceId;
	let osVersion = req.body.osVersion;
	let token = req.body.token;
	let publicCustomerId = req.body.publicCustomerId;
	let isCustomer = req.body.isCustomer;
	let email = req.body.email;

	let customer = {
		androidTokens: {
			deviceId: deviceId,
			osVersion: osVersion,
			token: token
		},
		info: {
			email: email,
			tenantId: tenantId,
			publicCustomerId: publicCustomerId,
			isCustomer: isCustomer
		}
	}

	res.json(customer);
});
