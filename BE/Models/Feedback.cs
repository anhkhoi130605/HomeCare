using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

public class Feedback
{
    public int Id { get; set; }

    public int FamilyId { get; set; }

    [ForeignKey("FamilyId")]
    public Family Family { get; set; } = null!;

    public int CaregiverId { get; set; }

    [ForeignKey("CaregiverId")]
    public Caregiver Caregiver { get; set; } = null!;

    public int? ContractId { get; set; }

    [ForeignKey("ContractId")]
    public Contract? Contract { get; set; }

    public int? ScheduleId { get; set; }

    [ForeignKey("ScheduleId")]
    public Schedule? Schedule { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }

    public bool IsAnonymous { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
