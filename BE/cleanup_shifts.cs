using BE.Data;
using BE.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=HomeCareDb;Trusted_Connection=True;MultipleActiveResultSets=true"));

using var host = builder.Build();
using var scope = host.Services.CreateScope();
var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

var now = DateTime.Now;
Console.WriteLine($"Current Local Time: {now}");

// Find shifts that are InProgress but started today or in the future and were checked in "too early"
// Or simply reset the "Me may beo" shift if it's InProgress and shouldn't be
var suspiciousShifts = await context.Schedules
    .Include(s => s.Patient)
    .Where(s => s.Status == ScheduleStatus.InProgress)
    .ToListAsync();

foreach (var s in suspiciousShifts)
{
    var shiftStart = s.Date.Date.Add(s.StartTime);
    if (shiftStart > now.AddMinutes(30)) // If shift starts more than 30 mins from now
    {
        Console.WriteLine($"Resetting shift for {s.Patient.FullName} at {shiftStart} from InProgress to Scheduled");
        s.Status = ScheduleStatus.Scheduled;
        s.CheckInTime = null;
    }
}

await context.SaveChangesAsync();
Console.WriteLine("Cleanup complete.");
