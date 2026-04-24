/**
 * IND Distribution - Notification API Helper
 * Utility to trigger backend email events from the frontend.
 */

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
