
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
        var emailSettings = _configuration.GetSection("EmailSettings");
        var fromEmail = emailSettings["SenderEmail"] ?? "noreply@homecare.com";
        var password = emailSettings["Password"];
        var host = emailSettings["Host"] ?? "smtp.gmail.com";
        var portStr = emailSettings["Port"] ?? "587";
        
        if (string.IsNullOrEmpty(password))
        {
            // For development without SMTP config, we just log/return
            Console.WriteLine($"[Email Mock] To: {to}, Subject: {subject}, Body: {body}");
            return;
        }

        var port = int.Parse(portStr);

        var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(fromEmail, password),
            EnableSsl = true
        };

        var mailMessage = new MailMessage(fromEmail, to, subject, body)
        {
            IsBodyHtml = true
        };

        await client.SendMailAsync(mailMessage);
    }
}
