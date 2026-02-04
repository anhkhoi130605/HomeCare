using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

public class CareRequest
{
    public int Id { get; set; }

    public int FamilyId { get; set; }

    [ForeignKey("FamilyId")]
    public Family Family { get; set; } = null!;

    public int PatientId { get; set; }

    [ForeignKey("PatientId")]
    public Patient Patient { get; set; } = null!;

    public int ServiceId { get; set; }

    [ForeignKey("ServiceId")]
    public Service Service { get; set; } = null!;

    public int? AssignedCaregiverId { get; set; }

    [ForeignKey("AssignedCaregiverId")]
    public Caregiver? AssignedCaregiver { get; set; }

    public RequestType Type { get; set; }

    public RequestStatus Status { get; set; } = RequestStatus.Pending;

    public DateTime RequestedDate { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    [MaxLength(500)]
    public string? AdminNotes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
