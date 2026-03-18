const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

function resolveProjectId() {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "hebimall"
  );
}

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
  const projectId = resolveProjectId();

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || projectId,
    });
  }

  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  });
}

initializeAdminApp();

module.exports = {
  admin,
  db: admin.firestore(),
  projectId: resolveProjectId(),
};
