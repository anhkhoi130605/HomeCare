
using BE.DTOs;

namespace BE.Services.Interfaces;

public interface INotificationService
{
    Task CreateNotificationAsync(int userId, string title, string message, string type, int? relatedId = null);
    Task<List<NotificationDto>> GetMyNotificationsAsync(int userId);
    Task<bool> MarkAsReadAsync(int notificationId, int userId);
    Task MarkAllAsReadAsync(int userId);
}
