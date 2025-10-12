export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied');
  }
  
  if (Notification.permission !== 'default') {
    return Promise.resolve(Notification.permission);
  }
  
  return Notification.requestPermission();
}

export function showNotification(title: string, options: NotificationOptions = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  
  new Notification(title, {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    ...options
  });
}

export function scheduleExpiryNotifications(foodItems: Array<{ id: string; name: string; expiryDate: string | Date }>) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  
  foodItems.forEach(item => {
    const expiryDate = typeof item.expiryDate === 'string' ? new Date(item.expiryDate) : item.expiryDate;
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Show notifications for items expiring in 3 days or less
    if (daysUntilExpiry <= 3 && daysUntilExpiry >= 0) {
      const message = daysUntilExpiry === 0 
        ? `${item.name} expires today!`
        : `${item.name} expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}!`;
      
      showNotification('FoodTracker Alert', {
        body: message,
        tag: item.id,
        requireInteraction: true
      });
    }
  });
}
