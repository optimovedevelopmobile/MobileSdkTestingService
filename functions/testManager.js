const mySql = require('mysql');
const testDataContainer = require('./testDataContainer');
const testCases = testDataContainer.testCases;
var firebaseDb;

function generateStartTestPayload(testCase, testId) {

  function generatePayloadForPushCampaign() {
    return {
      uiTitle: "Unique Title",
      uiBody: "Your money in my wallet",
      dynamicLink: "https://e8zjm.app.goo.gl/OkyPDf352gT4qJZ42",
      isOptipushMessage: "true"
    };
  }

  function generatePayloadToStartTest(caseName) {
    return {
      isOptipushMessage: "false",
      isTestMessage: "true",
      testData: {
        testId: testId,
        testName: caseName,
        parameters: {
          userId: "FirstTestEver"
        }
      }
    };
  }

  let caseName = testCase.name;
  if (Object.keys(testCases.optipush).includes(caseName)) {
    return generatePayloadForPushCampaign();
  } else {
    return generatePayloadToStartTest(caseName);
  }
}

function reportTestStep(stepData) {

  let stepSource = stepData.stepSource;
  let stepPhase = stepData.stepPhase;
  let testId = stepData.testId;
  let testCaseName = stepData.testCaseName;
  let timestamp = stepData.timestamp;
  let sourceOs = stepData.sourceOs;
  let stepMessage = stepData.stepMessage;

  console.log(stepData);
  let currentStepRef = firebaseDb.ref(`tests/${sourceOs}/${testId}/steps/${stepSource}-${stepPhase}`);
  let stepValue = {
    timestamp: timestamp
  };
  if (stepMessage) {
    stepValue.message = stepMessage;
  }

  return new Promise(function(resolve, reject) {

    currentStepRef.set(stepValue, function(error) {
      if (error) {
        console.error(error);
        reject({status: "Failure", error: error});
      } else {
        console.log("Step was updated");
        resolve({ status: "Success" });
      }
    });
  });
}

function reportTestManagerTestStep(stepPhase, stepData) {

  return reportTestStep({
      stepSource: "manager",
      stepPhase: stepPhase,
      testId: stepData.testId,
      testCaseName: stepData.testCaseName,
      timestamp: Math.floor(Date.now()),
      sourceOs: stepData.sourceOs
  });
}

function reportValidatorTestStep(stepPhase, stepData) {

  return reportTestStep({
      stepSource: "validator",
      stepPhase: stepPhase,
      testId: stepData.testId,
      testCaseName: stepData.testCaseName,
      timestamp: Math.floor(Date.now()),
      sourceOs: stepData.sourceOs
  });
}

function validatePiwikData(stepData, piwikDb) {

  function queryDb() {
		let sql = "SELECT *, hex(idvisitor) FROM piwik_log_link_visit_action ORDER BY idlink_va DESC LIMIT 1";
		mySqlConnector.query(sql, function(error, result) {
			if (error) {
				console.error(error);
        reportValidatorTestStep("error", stepData);
        reportTestManagerTestStep("error", stepData);
			} else {
        reportValidatorTestStep("finish", stepData);
        reportTestManagerTestStep("finish", stepData);
			}
		});
	}

  console.log(piwikDb);
  reportValidatorTestStep("start", stepData);
	const mySqlConnector = mySql.createConnection(piwikDb);

	mySqlConnector.connect(function(error){
		if (error) {
			console.error(Object.assign(error, { whatHappened:'connection error!'}));
      reportValidatorTestStep("error", stepData);
      reportTestManagerTestStep("error", stepData);
		} else {
			queryDb();
		}
	});
}

function init(db) {
  firebaseDb = db;
}

exports.testManager = {
  init: init,
  testCases: testCases,
  generateStartTestPayload: generateStartTestPayload,
  reportTestStep: reportTestStep,
  validatePiwikData: validatePiwikData,
  reportTestManagerTestStep: reportTestManagerTestStep
};
