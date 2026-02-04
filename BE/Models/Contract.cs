using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

public class Contract
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

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    public ContractStatus Status { get; set; } = ContractStatus.Pending;

    [MaxLength(1000)]
    public string? WeeklySchedule { get; set; } // JSON: days and times

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
