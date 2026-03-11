using System.ComponentModel.DataAnnotations;

namespace BE.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [MaxLength(255)]
    public string? ResetToken { get; set; }

    public DateTime? ResetTokenExpiry { get; set; }
    public DateTime? ResetTokenUsedAt { get; set; }
    // Navigation properties
    public Family? Family { get; set; }
    public Caregiver? Caregiver { get; set; }
}
