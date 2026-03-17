import admin from "firebase-admin";
import serviceAccount from "./dms-rpf-firebase-adminsdk-fbsvc-095b2fd1d8.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export default admin;