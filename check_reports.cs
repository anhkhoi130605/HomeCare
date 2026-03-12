
using Microsoft.EntityFrameworkCore;
using BE.Data;
using BE.Models;
using System;
using System.Linq;

var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
// Need to find connection string. It's in appsettings.json
var connectionString = "Server=gateway01.ap-southeast-1.prod.aws.tidbcloud.com;Port=4000;Database=homecare;Uid=2vJ2uY5n3w8P4q7.root;Pwd=HomeCare2024;SslMode=VerifyFull;";
var serverVersion = new MySqlServerVersion(new Version(8, 0, 11));
optionsBuilder.UseMySql(connectionString, serverVersion);

using (var db = new ApplicationDbContext(optionsBuilder.Options))
{
    var reports = db.HealthReports.Include(h => h.Patient).ToList();
    Console.WriteLine($"Total HealthReports: {reports.Count}");
    foreach (var r in reports)
    {
        Console.WriteLine($"ID: {r.Id}, Patient: {r.Patient?.FullName}, Type: {r.ReportType}, Date: {r.ReportDate}");
    }

    var logs = db.CareLogs.Include(l => l.Patient).OrderByDescending(l => l.LoggedAt).Take(5).ToList();
    Console.WriteLine("\nRecent CareLogs:");
    foreach (var l in logs)
    {
        Console.WriteLine($"ID: {l.Id}, Patient: {l.Patient?.FullName}, LoggedAt: {l.LoggedAt}");
    }
}
