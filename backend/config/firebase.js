import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error("Firebase initialization error:", error.message);
}

export const verifyFirebaseToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Token verification error:", error.message);
    throw new Error("Invalid token");
  }
};

export default admin;
