using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

public class Incident
{
    public int Id { get; set; }

    public int ScheduleId { get; set; }

    [ForeignKey("ScheduleId")]
    public Schedule Schedule { get; set; } = null!;

    public int CaregiverId { get; set; }

    [ForeignKey("CaregiverId")]
    public Caregiver Caregiver { get; set; } = null!;

    public int PatientId { get; set; }

    [ForeignKey("PatientId")]
    public Patient Patient { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public IncidentSeverity Severity { get; set; }

    public IncidentStatus Status { get; set; } = IncidentStatus.Open;

    [MaxLength(1000)]
    public string? ActionTaken { get; set; }

    [MaxLength(1000)]
    public string? Resolution { get; set; }

    public DateTime OccurredAt { get; set; }

    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ResolvedAt { get; set; }
}
