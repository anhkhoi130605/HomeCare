using System.Net;
using System.Net.Mail;
using BE.Services.Interfaces;

namespace BE.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        // ĐỔI: dùng section "Smtp" (khớp Program.cs bạn đã Configure<SmtpSettings>)
        var smtp = _configuration.GetSection("Smtp");

        var host = smtp["Host"] ?? "smtp.gmail.com";
        var portStr = smtp["Port"] ?? "587";
        var username = smtp["Username"];          // Gmail login
        var password = smtp["Password"];          // App Password
        var fromEmail = smtp["FromEmail"] ?? username ?? "noreply@homecare.com";
        var fromName = smtp["FromName"] ?? "HomeCare";
        var enableSsl = (smtp["EnableSsl"] ?? "true").ToLower() == "true";

        // Nếu chưa cấu hình SMTP thì log để dev
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            Console.WriteLine($"[Email Mock] To: {to}, Subject: {subject}, Body: {body}");
            return;
        }

        if (!int.TryParse(portStr, out var port)) port = 587;

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = enableSsl,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(username, password),
            DeliveryMethod = SmtpDeliveryMethod.Network
        };

        using var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail, fromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };

        mailMessage.To.Add(to);

        await client.SendMailAsync(mailMessage);
    }
}