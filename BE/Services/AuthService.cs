using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BE.Data;
using BE.DTOs;
using BE.Models;
using BE.Services.Interfaces;

namespace BE.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;

    public AuthService(ApplicationDbContext context, IConfiguration configuration, IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Check if email already exists
        if (await EmailExistsAsync(dto.Email))
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Email already registered"
            };
        }

        // Create user
        var user = new User
        {
            Email = dto.Email.ToLower().Trim(),
            Phone = dto.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = UserRole.Family,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Create family profile
        var family = new Family
        {
            UserId = user.Id,
            FullName = dto.FullName,
            CreatedAt = DateTime.UtcNow
        };

        _context.Families.Add(family);
        await _context.SaveChangesAsync();

        // Generate token
        var token = GenerateJwtToken(user, family.Id, null);

        return new AuthResponseDto
        {
            Success = true,
            Message = "Registration successful",
            Token = token,
            User = new UserInfoDto
            {
                Id = user.Id,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role.ToString(),
                FullName = family.FullName,
                FamilyId = family.Id
            }
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Family)
            .Include(u => u.Caregiver)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower().Trim());

        if (user == null)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Invalid email or password"
            };
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Invalid email or password"
            };
        }

        if (!user.IsActive)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Account is deactivated"
            };
        }

        // Get full name based on role
        string fullName = user.Role switch
        {
            UserRole.Family => user.Family?.FullName ?? "User",
            UserRole.Caregiver => user.Caregiver?.FullName ?? "Caregiver",
            UserRole.Admin => "Admin",
            _ => "User"
        };

        var familyId = user.Family?.Id;
        var caregiverId = user.Caregiver?.Id;

        var token = GenerateJwtToken(user, familyId, caregiverId);

        return new AuthResponseDto
        {
            Success = true,
            Message = "Login successful",
            Token = token,
            User = new UserInfoDto
            {
                Id = user.Id,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role.ToString(),
                FullName = fullName,
                FamilyId = familyId,
                CaregiverId = caregiverId
            }
        };
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower().Trim());
    }

    public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _context.Users
            .Include(u => u.Family)
            .Include(u => u.Caregiver)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    private string GenerateJwtToken(User user, int? familyId, int? caregiverId)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("userId", user.Id.ToString())
        };

        if (familyId.HasValue)
            claims.Add(new Claim("familyId", familyId.Value.ToString()));

        if (caregiverId.HasValue)
            claims.Add(new Claim("caregiverId", caregiverId.Value.ToString()));

        var expireMinutes = int.Parse(jwtSettings["ExpireMinutes"] ?? "60");

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expireMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    public async Task<bool> ForgotPasswordAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower().Trim());
        if (user == null) return false; // Or true to prevent enumeration

        var token = Guid.NewGuid().ToString("N");
        user.ResetToken = token;
        user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);

        await _context.SaveChangesAsync();

        // In production, this link should point to the FE
        // Example: http://localhost:5173/reset-password?token={token}&email={email}
        var feUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
        var resetLink = $"{feUrl}/auth/reset-password?token={token}&email={WebUtility.UrlEncode(email)}";

        var subject = "Reset Your Password";
        var body = $"<p>Click <a href='{resetLink}'>here</a> to reset your password.</p><p>Or copy this token: {token}</p>";

        await _emailService.SendEmailAsync(email, subject, body);

        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower().Trim());
        if (user == null) return false;

        if (user.ResetToken != dto.Token || user.ResetTokenExpiry < DateTime.UtcNow)
        {
            return false;
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.ResetToken = null;
        user.ResetTokenExpiry = null;

        await _context.SaveChangesAsync();
        return true;
    }
}
