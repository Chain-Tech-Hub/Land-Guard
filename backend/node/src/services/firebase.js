const admin = require('firebase-admin');
const path = require('path');

let appInstance;

function initFirebase() {
  if (appInstance) return appInstance;

  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!serviceAccountPath) {
    console.warn('GOOGLE_APPLICATION_CREDENTIALS not set. Firebase Admin will attempt application default credentials.');
  }

  const options = {};
  if (serviceAccountPath) {
    options.credential = admin.credential.cert(require(path.resolve(serviceAccountPath)));
  } else {
    options.credential = admin.credential.applicationDefault();
  }
  if (projectId) options.projectId = projectId;

  appInstance = admin.initializeApp(options);
  return appInstance;
}

function db() {
  if (!appInstance) initFirebase();
  return admin.firestore();
}

module.exports = { initFirebase, db };
