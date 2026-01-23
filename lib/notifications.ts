// Simple notification system for trip reminders and invites
// Uses Web Notifications API when available

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  new Notification(title, {
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    ...options,
  });
}

export function scheduleReminder(
  itemId: string,
  title: string,
  dateTime: string,
  offsetMinutes: number
) {
  const reminderTime = new Date(dateTime).getTime() - offsetMinutes * 60 * 1000;
  const now = Date.now();

  if (reminderTime <= now) {
    // Already past, show immediately
    requestNotificationPermission().then((granted) => {
      if (granted) {
        showNotification(`Reminder: ${title}`, {
          body: `This activity is coming up soon!`,
          tag: `reminder-${itemId}`,
        });
      }
    });
    return;
  }

  const timeout = reminderTime - now;
  setTimeout(() => {
    requestNotificationPermission().then((granted) => {
      if (granted) {
        showNotification(`Reminder: ${title}`, {
          body: `This activity is coming up in ${offsetMinutes} minutes!`,
          tag: `reminder-${itemId}`,
        });
      }
    });
  }, timeout);
}

export function cancelReminder(itemId: string) {
  // Note: We can't cancel setTimeout, but we can track them
  // For MVP, we'll just let them fire. In production, use a proper scheduler.
}
