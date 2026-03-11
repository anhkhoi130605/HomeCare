using System.Security.Cryptography;
using System.Text;

namespace BE.Helpers;

public static class JwtHelpers
{
    public static string Sha256Hex(string input)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes);
    }

    public static string NewSecureToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32); // 32 bytes = 64 hex chars
        return Convert.ToHexString(bytes);
    }
}