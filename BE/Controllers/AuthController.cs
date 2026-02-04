using Microsoft.AspNetCore.Mvc;
using BE.DTOs;
using BE.Services.Interfaces;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Register a new family account (UC-01)
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "Email and password are required"
                });
            }

            if (dto.Password.Length < 6)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "Password must be at least 6 characters"
                });
            }

            var result = await _authService.RegisterAsync(dto);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            // Log detailed error
            Console.WriteLine($"Register error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            
            return StatusCode(500, new AuthResponseDto
            {
                Success = false,
                Message = $"Internal error: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Login with email and password (UC-02)
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new AuthResponseDto
            {
                Success = false,
                Message = "Email and password are required"
            });
        }

        var result = await _authService.LoginAsync(dto);

        if (!result.Success)
        {
            return Unauthorized(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Check if email is already registered
    /// </summary>
    [HttpGet("check-email")]
    public async Task<ActionResult<object>> CheckEmail([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { exists = false, message = "Email is required" });
        }

        var exists = await _authService.EmailExistsAsync(email);
        return Ok(new { exists });
    }
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        await _authService.ForgotPasswordAsync(dto.Email);
        return Ok(new { success = true, message = "If the email exists, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var result = await _authService.ResetPasswordAsync(dto);
        if (!result)
        {
            return BadRequest(new { success = false, message = "Invalid token or email." });
        }
        return Ok(new { success = true, message = "Password reset successfully." });
    }
}
