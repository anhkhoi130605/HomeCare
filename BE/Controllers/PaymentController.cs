using BE.DTOs.Payment;
using BE.Models;
using BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IConfiguration _configuration;

    public PaymentController(IPaymentService paymentService, IConfiguration configuration)
    {
        _paymentService = paymentService;
        _configuration = configuration;
    }

    private int GetFamilyId() => int.Parse(User.FindFirst("FamilyId")?.Value ?? "0");

    /// <summary>
    /// Get all payments (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,OperationAdmin")]
    public async Task<ActionResult<List<PaymentDto>>> GetAllPayments([FromQuery] string? status = null)
    {
        try
        {
            PaymentStatus? paymentStatus = null;
            if (!string.IsNullOrEmpty(status))
            {
                paymentStatus = Enum.Parse<PaymentStatus>(status, ignoreCase: true);
            }

            var payments = await _paymentService.GetAllPaymentsAsync(paymentStatus);
            return Ok(payments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get family's payments
    /// </summary>
    [HttpGet("my")]
    [Authorize(Roles = "Family")]
    public async Task<ActionResult<List<PaymentDto>>> GetMyPayments()
    {
        try
        {
            var familyId = GetFamilyId();
            if (familyId == 0)
                return BadRequest(new { message = "Family not found" });

            var payments = await _paymentService.GetPaymentsByFamilyAsync(familyId);
            return Ok(payments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get specific payment
    /// </summary>
    [HttpGet("{paymentId}")]
    [Authorize]
    public async Task<ActionResult<PaymentDto>> GetPayment(int paymentId)
    {
        try
        {
            var payment = await _paymentService.GetPaymentAsync(paymentId);
            if (payment == null)
                return NotFound(new { message = "Payment not found" });
            return Ok(payment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Create a new payment
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Family")]
    public async Task<ActionResult<CreatePaymentResult>> CreatePayment([FromBody] CreatePaymentDto dto)
    {
        try
        {
            var familyId = GetFamilyId();
            if (familyId == 0)
                return BadRequest(new { message = "Family not found" });

            var result = await _paymentService.CreatePaymentAsync(familyId, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Generate VNPay payment URL
    /// </summary>
    [HttpPost("{paymentId}/vnpay-url")]
    [Authorize(Roles = "Family")]
    public async Task<ActionResult<PaymentUrlResult>> GenerateVnPayUrl(int paymentId)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var paymentUrl = await _paymentService.GenerateVnPayUrlAsync(paymentId, ipAddress);

            return Ok(new PaymentUrlResult
            {
                PaymentId = paymentId,
                PaymentUrl = paymentUrl
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update internal note (description) for a payment (Admin only)
    /// </summary>
    [HttpPut("{paymentId}/note")]
    [Authorize(Roles = "Admin,OperationAdmin")]
    public async Task<ActionResult<PaymentDto>> UpdateNote(int paymentId, [FromBody] UpdatePaymentNoteDto body)
    {
        try
        {
            var updated = await _paymentService.UpdateNoteAsync(paymentId, body.Note);
            if (updated == null) return NotFound(new { message = "Payment not found" });
            return Ok(updated);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// VNPay return callback (public endpoint)
    /// </summary>
    [HttpGet("vnpay-return")]
    [AllowAnonymous]
    public async Task<ActionResult> VnPayReturn()
    {
        try
        {
            var queryParams = Request.Query.ToDictionary(x => x.Key, x => x.Value.ToString());
            var payment = await _paymentService.ProcessVnPayReturnAsync(queryParams);
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:8080";

            if (payment == null)
            {
                return Redirect($"{frontendUrl}/family/payments?status=error");
            }

            var status = payment.Status.ToString().ToLower();
            return Redirect($"{frontendUrl}/family/payments?status={status}&paymentId={payment.Id}&careRequestId={payment.CareRequestId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"VNPay return error: {ex.Message}");
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:8080";
            return Redirect($"{frontendUrl}/family/payments?status=error");
        }
    }

    /// <summary>
    /// VNPay IPN callback (server-to-server)
    /// </summary>
    [HttpGet("vnpay-ipn")]
    [AllowAnonymous]
    public async Task<ActionResult> VnPayIpn()
    {
        try
        {
            var queryParams = Request.Query.ToDictionary(x => x.Key, x => x.Value.ToString());
            var payment = await _paymentService.ProcessVnPayReturnAsync(queryParams);

            if (payment == null)
            {
                return Ok(new { RspCode = "01", Message = "Order not found or invalid signature" });
            }

            return Ok(new { RspCode = "00", Message = "Confirm Success" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"VNPay IPN error: {ex.Message}");
            return Ok(new { RspCode = "99", Message = "Unknown error" });
        }
    }
}
