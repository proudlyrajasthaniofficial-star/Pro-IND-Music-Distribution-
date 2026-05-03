import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Triggers an email using Firebase Extension "Trigger Email"
 * Creates a document in the "mail" collection.
 */
export const sendEmailNotification = async (to: string, subject: string, html: string) => {
  try {
    await addDoc(collection(db, "mail"), {
      to,
      message: {
        subject,
        html,
      },
      createdAt: new Date().toISOString(),
    });
    console.log(`Email queued for ${to}: ${subject}`);
  } catch (error) {
    console.error("Failed to queue email:", error);
  }
};
