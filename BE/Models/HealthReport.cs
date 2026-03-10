using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

public class HealthReport
{
    public int Id { get; set; }

    public int PatientId { get; set; }

    [ForeignKey("PatientId")]
    public Patient Patient { get; set; } = null!;

    public int? CaregiverId { get; set; }

    [ForeignKey("CaregiverId")]
    public Caregiver? Caregiver { get; set; }

    [Required]
    [MaxLength(100)]
    public string ReportType { get; set; } = string.Empty; // Weekly Vital Summary, Hypertension Log, Monthly Progress

    [Required]
    [MaxLength(100)]
    public string Period { get; set; } = string.Empty; // e.g., "Oct 16 - Oct 23, 2023"

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Stable"; // Stable, Warning, Incident

    [Range(0, 100)]
    public int HealthScore { get; set; } = 100;

    // Vital signs data (JSON string for flexibility)
    public string? VitalsData { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateTime ReportDate { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
