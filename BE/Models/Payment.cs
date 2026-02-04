using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

public class Payment
{
    public int Id { get; set; }

    public int? ContractId { get; set; }

    [ForeignKey("ContractId")]
    public Contract? Contract { get; set; }

    public int FamilyId { get; set; }

    [ForeignKey("FamilyId")]
    public Family Family { get; set; } = null!;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    public PaymentMethod Method { get; set; } = PaymentMethod.VNPay;

    [MaxLength(100)]
    public string? TransactionId { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? PaidAt { get; set; }
}
