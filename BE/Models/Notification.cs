using System.ComponentModel.DataAnnotations;

namespace BE.Models;

public class Notification
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Type { get; set; } = "System"; // System, Payment, Schedule, Request

    public bool IsRead { get; set; } = false;

    public int? RelatedId { get; set; } // ID of contract, payment, etc.

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
