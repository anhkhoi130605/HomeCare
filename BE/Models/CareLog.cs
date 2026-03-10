using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

public class CareLog
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
    [MaxLength(1000)]
    public string Activities { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? MedicationsGiven { get; set; }

    [MaxLength(500)]
    public string? MealsProvided { get; set; }

    [MaxLength(500)]
    public string? VitalSigns { get; set; }

    [MaxLength(500)]
    public string? PatientMood { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateTime LoggedAt { get; set; } = DateTime.UtcNow;
}
