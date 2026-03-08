using BE.Data;
using BE.DTOs.Payment;
using BE.Models;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Security.Cryptography;
using System.Text;

using BE.Services.Interfaces;

namespace BE.Services;

public interface IPaymentService
{
    Task<PaymentDto?> GetPaymentAsync(int paymentId);
    Task<List<PaymentDto>> GetPaymentsByFamilyAsync(int familyId);
    Task<List<PaymentDto>> GetAllPaymentsAsync(PaymentStatus? status = null);
    Task<CreatePaymentResult> CreatePaymentAsync(int familyId, CreatePaymentDto dto);
    Task<string> GenerateVnPayUrlAsync(int paymentId, string ipAddress);
    Task<PaymentDto?> ProcessVnPayReturnAsync(VnPayReturnDto vnPayReturn);
}

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly INotificationService _notificationService;

    public PaymentService(ApplicationDbContext context, IConfiguration configuration, INotificationService notificationService)
    {
        _context = context;
        _configuration = configuration;
        _notificationService = notificationService;
    }

    public async Task<PaymentDto?> GetPaymentAsync(int paymentId)
    {
        var payment = await _context.Payments
            .Include(p => p.Family)
            .Include(p => p.Contract)
            .FirstOrDefaultAsync(p => p.Id == paymentId);

        return payment == null ? null : MapToDto(payment);
    }

    public async Task<List<PaymentDto>> GetPaymentsByFamilyAsync(int familyId)
    {
        var payments = await _context.Payments
            .Include(p => p.Family)
            .Include(p => p.Contract)
            .Where(p => p.FamilyId == familyId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return payments.Select(p => MapToDto(p)).ToList();
    }

    public async Task<List<PaymentDto>> GetAllPaymentsAsync(PaymentStatus? status = null)
    {
        var query = _context.Payments
            .Include(p => p.Family)
            .Include(p => p.Contract)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        var payments = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
        return payments.Select(p => MapToDto(p)).ToList();
    }

    public async Task<CreatePaymentResult> CreatePaymentAsync(int familyId, CreatePaymentDto dto)
    {
        decimal amount;
        string description = dto.Description ?? "";

        // Auto-calculate amount for CareRequest
        if (dto.CareRequestId.HasValue)
        {
            var careRequest = await _context.CareRequests
                .Include(cr => cr.Service)
                .FirstOrDefaultAsync(cr => cr.Id == dto.CareRequestId.Value && cr.FamilyId == familyId);

            if (careRequest == null)
                throw new KeyNotFoundException("Care request not found");

            if (careRequest.Service == null)
                throw new InvalidOperationException("Service not found for this care request");

            amount = careRequest.Service.PricePerHour * careRequest.Duration;
            description = string.IsNullOrEmpty(description)
                ? $"Payment for Care Request #{careRequest.Id} - {careRequest.Service.Name} ({careRequest.Duration}h)"
                : description;

            // Update CareRequest status to AwaitingPayment
            careRequest.Status = RequestStatus.AwaitingPayment;
            careRequest.UpdatedAt = DateTime.UtcNow;
        }
        else if (dto.Amount.HasValue)
        {
            amount = dto.Amount.Value;
        }
        else
        {
            throw new InvalidOperationException("Either CareRequestId or Amount must be provided");
        }

        var payment = new Payment
        {
            FamilyId = familyId,
            ContractId = dto.ContractId,
            CareRequestId = dto.CareRequestId,
            Amount = amount,
            Description = description,
            Method = PaymentMethod.VNPay,
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return new CreatePaymentResult
        {
            PaymentId = payment.Id,
            Amount = payment.Amount,
            Status = payment.Status.ToString()
        };
    }

    public async Task<string> GenerateVnPayUrlAsync(int paymentId, string ipAddress)
    {
        var payment = await _context.Payments.FindAsync(paymentId);
        if (payment == null)
            throw new KeyNotFoundException("Payment not found");

        var vnPaySettings = _configuration.GetSection("VnPay");
        var vnpUrl = vnPaySettings["BaseUrl"]!;
        var vnpTmnCode = vnPaySettings["TmnCode"]!;
        var vnpHashSecret = vnPaySettings["HashSecret"]!;
        var vnpReturnUrl = vnPaySettings["ReturnUrl"]!;

        var vnpTxnRef = $"{payment.Id}_{DateTime.UtcNow.Ticks}";
        var vnpOrderInfo = payment.Description ?? $"Payment for order #{payment.Id}";
        var vnpAmount = ((long)(payment.Amount * 100)).ToString();
        var vnpCreateDate = DateTime.Now.ToString("yyyyMMddHHmmss");
        var vnpExpireDate = DateTime.Now.AddMinutes(15).ToString("yyyyMMddHHmmss");

        // Update payment with transaction reference
        payment.TransactionId = vnpTxnRef;
        await _context.SaveChangesAsync();

        var vnpParams = new SortedDictionary<string, string>
        {
            { "vnp_Version", "2.1.0" },
            { "vnp_Command", "pay" },
            { "vnp_TmnCode", vnpTmnCode },
            { "vnp_Amount", vnpAmount },
            { "vnp_CurrCode", "VND" },
            { "vnp_TxnRef", vnpTxnRef },
            { "vnp_OrderInfo", vnpOrderInfo },
            { "vnp_OrderType", "other" },
            { "vnp_Locale", "vn" },
            { "vnp_ReturnUrl", vnpReturnUrl },
            { "vnp_IpAddr", ipAddress },
            { "vnp_CreateDate", vnpCreateDate },
            { "vnp_ExpireDate", vnpExpireDate }
        };

        var queryString = string.Join("&", vnpParams.Select(kv => 
            $"{WebUtility.UrlEncode(kv.Key)}={WebUtility.UrlEncode(kv.Value)}"));

        var vnpSecureHash = HmacSha512(vnpHashSecret, queryString);

        return $"{vnpUrl}?{queryString}&vnp_SecureHash={vnpSecureHash}";
    }

    public async Task<PaymentDto?> ProcessVnPayReturnAsync(VnPayReturnDto vnPayReturn)
    {
        // Verify signature
        var vnPaySettings = _configuration.GetSection("VnPay");
        var vnpHashSecret = vnPaySettings["HashSecret"]!;

        // Parse transaction reference to get payment ID
        var txnRefParts = vnPayReturn.vnp_TxnRef?.Split('_');
        if (txnRefParts == null || txnRefParts.Length < 1 || !int.TryParse(txnRefParts[0], out var paymentId))
        {
            return null;
        }

        var payment = await _context.Payments
            .Include(p => p.Family)
            .Include(p => p.Contract)
            .Include(p => p.CareRequest)
            .FirstOrDefaultAsync(p => p.Id == paymentId);

        if (payment == null) return null;

        // Update payment status based on VNPay response
        if (vnPayReturn.vnp_ResponseCode == "00" && vnPayReturn.vnp_TransactionStatus == "00")
        {
            payment.Status = PaymentStatus.Success;
            payment.PaidAt = DateTime.UtcNow;
            payment.TransactionId = vnPayReturn.vnp_TransactionNo;

            // If this is a care request payment, update request status to Paid
            if (payment.CareRequestId.HasValue && payment.CareRequest != null)
            {
                payment.CareRequest.Status = RequestStatus.Paid;
                payment.CareRequest.UpdatedAt = DateTime.UtcNow;
            }

            // If this is a contract payment, update contract status
            if (payment.ContractId.HasValue)
            {
                var contract = await _context.Contracts.FindAsync(payment.ContractId);
                if (contract != null && contract.Status == ContractStatus.Pending)
                {
                    contract.Status = ContractStatus.Active;
                }
            }

            // Send notification
            if (payment.Family != null)
            {
                await _notificationService.CreateNotificationAsync(
                    payment.Family.UserId, 
                    "Payment Successful", 
                    $"Payment of {payment.Amount:N0} VND processed successfully.", 
                    "Payment", 
                    payment.Id);
            }
        }
        else
        {
            payment.Status = PaymentStatus.Failed;

            // Revert CareRequest status if payment failed
            if (payment.CareRequestId.HasValue && payment.CareRequest != null)
            {
                payment.CareRequest.Status = RequestStatus.Pending;
                payment.CareRequest.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();

        return MapToDto(payment);
    }

    private static string HmacSha512(string key, string inputData)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var inputBytes = Encoding.UTF8.GetBytes(inputData);

        using var hmac = new HMACSHA512(keyBytes);
        var hashBytes = hmac.ComputeHash(inputBytes);
        return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
    }

    private static PaymentDto MapToDto(Payment p)
    {
        return new PaymentDto
        {
            Id = p.Id,
            FamilyId = p.FamilyId,
            FamilyName = p.Family?.FullName,
            ContractId = p.ContractId,
            CareRequestId = p.CareRequestId,
            Amount = p.Amount,
            Status = p.Status.ToString(),
            Method = p.Method.ToString(),
            TransactionId = p.TransactionId,
            Description = p.Description,
            CreatedAt = p.CreatedAt,
            PaidAt = p.PaidAt
        };
    }
}
