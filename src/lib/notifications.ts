/**
 * IND Distribution - Notification API Helper
 * Utility to trigger backend email events from the frontend.
 */

import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export const sendMail = async (to: string | string[], subject: string, html: string) => {
  try {
    await addDoc(collection(db, "mail"), {
      to: Array.isArray(to) ? to : [to],
      message: {
        subject,
        html,
      },
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error triggering email:", error);
  }
};

export const triggerNotification = async (endpoint: string, data: any) => {
  try {
    const response = await fetch(`/api${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.warn(`Failed to trigger notification on ${endpoint}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Notification trigger error:", error);
  }
};
