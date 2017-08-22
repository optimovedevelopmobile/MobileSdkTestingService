const request = require("request");

const fcmServerKeys = {
	1: "AAAAgIiDER4:APA91bF0r7-FsKfOksnSDAAmG3AkCUvFXZ_OTmitTkl4UEzwhypE6XUNhp90J7aEzTyXFNFGVw6fEAr-6fqsJ0Bgsc3sC2c91NhKdCz_GtCplL1Kzxn_mJZ8sPjDQjaKG8lD7LNHIzNy",
	2: "AAAAMsRHNFw:APA91bENKODvB9lIOkypVzDGxgTolqX0kK1xoZeMSk6E863ut7_OdQZUDz0CbK5JKpcl-NyWuJXPYHMiYYsKYv9l6NtegrsmgYQuDxdtDXTYqYlGFaCvi6P7bC2kD6sQn9JK8iDLAZmj",
	3: "AAAAs5E2zyA:APA91bF38r-OlsJmTgj3AfkAOu4eT9neiZlqvcjWh82T_zmM89T2rBfiFAQFNNS_gAyC11duJw7xQvEsm4q8uGoe2XrXRWDMlUTrsdoOdORoIMkOQAQC3XEsfdEH4ON3UMtN8kKqWs0T",
	4: "AAAA3Hb7B5U:APA91bFFdZg7HkIG3dFgpfyuIfRwimap5sr3HBrLaenPfwTlgAwL7mzy2QUXsii5reUZbJSP6DxvmA8nrFuBC6TECX2i6v0BJwM6GOeKs3quok1c85_EdQfIJV9mAdi0uYdXYETtEsL1"
};

const deviceTokens = {
	1: "er2AyNus0y8:APA91bG9FCW2ykTsGpjQFZoWjtasEKzbqZ7gD1AjX6VMA9aTa61AGzYFieXR_d-LNe2-Asyki1K9gAubqKoxtXm4nE2eGeYApSAhLVntKGxQfeDEhAVr1RKG1nYCnJH-nWXpqcxKKwI5",
	2: "eFD2tcHnM9k:APA91bH1f2uRvy34bBw7LZx7yCBNGKhG-JUWESzkKtKbGN-BCobNDLT1LnKFMUe9t6oOsnXbFfJkpKbX3W1FQslz8U2mSW2CnFGiFIkbBeeDdB1p3IVQgiM2MX_r45ucyiAgke3wPe9h",
	3: "cMmrnDnami4:APA91bHosSPqbE52M3WnBcsJXpir0_dCRXdI4Vd7PtPHuUqH7zZIxZXHEHr9JyoV5rkDxKjxw5_rXPHcEgY3IsObiM-TZSvQ_gCnJt1EKSfDXBT7adUqaVhbRlVv0ZeQDpibWITqYR7H",
	4: "fBkVa4OELu0:APA91bHyww-qPILrzwMthybyG4vzX2XRB362rLUsLDa1LdAFkkaTYvQvrjv1k0OXDaRNVVmYTAqaVGQe9o34ZC8kNiemMmjKjZh9YYNnS7QZzCCCXkaTnPAQB49GpCBmP_87_4pTODpy"
};

function sendPushToDevice(tenantId, payload) {

  const options = {
    method: 'POST',
    url: 'https://fcm.googleapis.com/fcm/send',
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      authorization: `key=${fcmServerKeys[tenantId]}`
    },
    body: {
      data: payload,
      priority: 'high',
      content_available: true,
      registration_ids: [deviceTokens[tenantId]]
    },
    json: true
  };

  return new Promise(function(resolve, reject){
    request(options, function (error, response, body) {

			function createResponse(success) {
				let sum = success ? "Push was sent successfully" : "Failed to send Push";
				return {
					summary: sum,
					tenantId: tenantId,
					payload: payload,
					fcmResponse: body
				};
			}

      if (!error && body.failure === 0) {
        resolve(createResponse(true));
      } else {
        reject(createResponse(false));
      }
    });
  });
}

exports.pushDispatcher = {
  sendPush: sendPushToDevice
};
