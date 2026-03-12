using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BE.Data;
using BE.Services;
using BE.Services.Interfaces;
using System.Text.Encodings.Web;
using BE.Models.Email;

var builder = WebApplication.CreateBuilder(args);

// Load JWT configurations from separate file
builder.Configuration
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.Jwt.json", optional: false, reloadOnChange: true);

builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("Smtp"));
builder.Services.AddScoped<IEmailService, EmailService>();
// ===== SERVICES =====
builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database - MySQL (TiDB Cloud)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var serverVersion = new MySqlServerVersion(new Version(8, 0, 11)); // TiDB is compatible with MySQL 8.0
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, serverVersion,
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null)));

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is missing in appsettings.Jwt.json");
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Dependency Injection - Services
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IFamilyService, FamilyService>();
builder.Services.AddScoped<ICaregiverService, CaregiverService>();
builder.Services.AddScoped<IServicePackageService, ServicePackageService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IContractService, ContractService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IScheduleService, ScheduleService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<ICareLogService, CareLogService>();
builder.Services.AddScoped<IIncidentService, IncidentService>();
builder.Services.AddScoped<ICareRequestService, CareRequestService>();
builder.Services.AddScoped<IHealthReportService, HealthReportService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// CORS cho FE
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// ===== APP =====
var app = builder.Build();

// Auto-migrate database on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        // Ensure database is created (don't delete - TiDB Cloud can timeout)
        logger.LogInformation("Ensuring database is created...");
        dbContext.Database.EnsureCreated();
        logger.LogInformation("Database ready.");
        
        // Seed initial data (Admin, Caregivers) if not exists
        await SeedData.InitializeAsync(dbContext);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while setting up the database.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
