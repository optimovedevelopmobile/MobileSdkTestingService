const tenantTokens = [
  "c10d36d2f267e295f7a43f631025a60b",
  "8ec0b468286ccccdfaf75eb656c573a2",
  "c0458fb79ea03ef7be4589549a969ede",
  "de9e1f28cce9e92106d237d437b69f05"
]

var firebaseDb;

function init(db) {
  firebaseDb = db;
}

function registerNewDevice(deviceData) {

  let tenantToken = tenantTokens[deviceData.tenantId];

  return new Promise(function(resolve, reject) {

    firebaseDb.ref(`registration/${tenantToken}/${deviceData.publicCustomerId}/${deviceData.os}/${deviceData.deviceId}`).set({
      fcmToken: deviceData.fcmToken,
      osVersion: deviceData.osVersion,
      isCustomer: deviceData.isCustomer,
      optipushOptIn: deviceData.optIn
    }, function(error) {
      if (error) {
        reject({reason: "Failed to register the device", error: error});
      } else {
        resolve({status: "success"});
      }
    });
  });
}

exports.registrationManager = {
  init: init,
  registerNewDevice: registerNewDevice
};
