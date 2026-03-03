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

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
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
    /// VNPay return callback (public endpoint)
    /// </summary>
    [HttpGet("vnpay-return")]
    [AllowAnonymous]
    public async Task<ActionResult> VnPayReturn([FromQuery] VnPayReturnDto vnPayReturn)
    {
        try
        {
            var payment = await _paymentService.ProcessVnPayReturnAsync(vnPayReturn);

            if (payment == null)
            {
                // Redirect to Frontend
                return Redirect("http://localhost:8080/family/payments?status=error");
            }

            var status = payment.Status.ToString().ToLower();
            return Redirect($"http://localhost:8080/family/payments?status={status}&paymentId={payment.Id}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"VNPay return error: {ex.Message}");
            return Redirect("http://localhost:8080/family/payments?status=error");
        }
    }

    /// <summary>
    /// VNPay IPN callback (server-to-server)
    /// </summary>
    [HttpGet("vnpay-ipn")]
    [AllowAnonymous]
    public async Task<ActionResult> VnPayIpn([FromQuery] VnPayReturnDto vnPayReturn)
    {
        try
        {
            var payment = await _paymentService.ProcessVnPayReturnAsync(vnPayReturn);

            if (payment == null)
            {
                return Ok(new { RspCode = "01", Message = "Order not found" });
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
