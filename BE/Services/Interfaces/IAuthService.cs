using BE.DTOs;
using BE.Models;

namespace BE.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> LoginWithGoogleAsync(GoogleLoginDto dto);
    Task<bool> EmailExistsAsync(string email);
    Task<User?> GetUserByIdAsync(int userId);
    Task<bool> ForgotPasswordAsync(string email);
    Task<bool> ResetPasswordAsync(ResetPasswordDto dto);
}
