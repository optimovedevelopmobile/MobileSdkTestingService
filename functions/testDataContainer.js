const optitrackTestCases = {
  userSignedUp: {
    description: "Visitor to Customer First Conversion test case",
		name: "userSignedUp",
    components: ["OptiTrack", "OptiPush"]
  },
	userLoggedIn: {
		description: "Visitor to Customer Conversion test case",
		name: "userLoggedIn",
    components: ["OptiTrack"]
	},
  userLoggedOut: {
		description: "Customer to Visitor Conversion test case",
		name: "userLoggedOut",
    components: ["OptiTrack"]
  },
  reportValidEvent: {
		description: "Report a Valid Event test case",
		name: "reportValidEvent",
    components: ["OptiTrack"]
  },
  reportInvalidEvent: {
		description: "Report a Invalid Event test case",
		name: "reportInvalidEvent",
    components: ["OptiTrack"]
  }
};

const optipushTestCases = {
  pushCampaignUserOpened: {
    description: 'Sending an OptiPush campaign message that the client opens',
    name: 'pushCampaignUserOpened',
    components: ['OptiPush']
  },
  pushCampaignUserDismissed: {
    description: 'Sending an OptiPush campaign message that the client dismisses',
    name: 'pushCampaignUserDismissed',
    components: ['OptiPush']
  },
  newDeviceIsRegisteredWithOptIn: {
    description: 'A new device is registered and is optted-in to OptiPush messages',
    name: 'newDeviceIsRegisteredWithOptIn',
    components: ['OptiPush']
  },
  newDeviceIsRegisteredWithOptOut: {
    description: 'A new device is registered and is optted-out to OptiPush messages',
    name: 'newDeviceIsRegisteredWithOptOut',
    components: ['OptiPush']
  }
};

const groupedTestCases = {
  optitrack: optitrackTestCases,
  optipush: optipushTestCases
};

function getAllTestCases() {
	let result = {};
	for (let componentCasesKey in groupedTestCases) {
		let componentCases = groupedTestCases[componentCasesKey];
		for (let caseKey in componentCases) {
			result[caseKey] = componentCases[caseKey];
		}
	}
	return result;
}

function getTestCases(component) {
	if (component) {
		return testCases[component];
	} else {
		return getAllTestCases();
	}
}

var testCases = {
	allFlat: getAllTestCases(),
	allGrouped: groupedTestCases,
};

exports.testCases = Object.assign(testCases, groupedTestCases);
