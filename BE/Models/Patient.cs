using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

public class Patient
{
    public int Id { get; set; }

    public int FamilyId { get; set; }

    [ForeignKey("FamilyId")]
    public Family Family { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    public DateTime DateOfBirth { get; set; }

    [MaxLength(20)]
    public string? Gender { get; set; }

    [MaxLength(2000)]
    public string? MedicalHistory { get; set; }

    [MaxLength(500)]
    public string? Allergies { get; set; }

    [MaxLength(500)]
    public string? CurrentCondition { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
}
