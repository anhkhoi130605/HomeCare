namespace BE.DTOs.Payment;

public class PaymentDto
{
    public int Id { get; set; }
    public int FamilyId { get; set; }
    public string? FamilyName { get; set; }
    public int? ContractId { get; set; }
    public int? CareRequestId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = null!;
    public string Method { get; set; } = null!;
    public string? TransactionId { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
}

public class CreatePaymentDto
{
    public int? ContractId { get; set; }
    public int? CareRequestId { get; set; }
    public decimal? Amount { get; set; } // Optional: auto-calculated for CareRequest
    public string? Description { get; set; }
}

public class CreatePaymentResult
{
    public int PaymentId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = null!;
}

public class VnPayReturnDto
{
    public string? vnp_TxnRef { get; set; }
    public string? vnp_Amount { get; set; }
    public string? vnp_OrderInfo { get; set; }
    public string? vnp_ResponseCode { get; set; }
    public string? vnp_TransactionNo { get; set; }
    public string? vnp_TransactionStatus { get; set; }
    public string? vnp_SecureHash { get; set; }
    public string? vnp_BankCode { get; set; }
    public string? vnp_PayDate { get; set; }
}

public class PaymentUrlResult
{
    public int PaymentId { get; set; }
    public string PaymentUrl { get; set; } = null!;
}
