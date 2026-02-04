using BE.Data;
using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.Services;

public static class SeedData
{
    public static async Task InitializeAsync(ApplicationDbContext context)
    {
        // Seed Admin if not exists
        if (!await context.Users.AnyAsync(u => u.Role == UserRole.Admin))
        {
            var adminUser = new User
            {
                Email = "admin@homecare.com",
                Phone = "+84999999999",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
            Console.WriteLine("✓ Admin account created: admin@homecare.com / admin123");
        }

        // Seed Caregivers if not exists
        if (!await context.Caregivers.AnyAsync())
        {
            // Caregiver 1
            var caregiver1User = new User
            {
                Email = "nurse.sarah@homecare.com",
                Phone = "+84901234567",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("nurse123"),
                Role = UserRole.Caregiver,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(caregiver1User);
            await context.SaveChangesAsync();

            var caregiver1 = new Caregiver
            {
                UserId = caregiver1User.Id,
                FullName = "Sarah Jenkins",
                Specialization = "Certified Nursing Assistant",
                ExperienceYears = 5,
                Bio = "Experienced caregiver specializing in elderly care and post-surgery recovery.",
                ImageUrl = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
                IsAvailable = true,
                HourlyRate = 200000,
                CreatedAt = DateTime.UtcNow
            };
            context.Caregivers.Add(caregiver1);

            // Caregiver 2
            var caregiver2User = new User
            {
                Email = "nurse.john@homecare.com",
                Phone = "+84901234568",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("nurse123"),
                Role = UserRole.Caregiver,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(caregiver2User);
            await context.SaveChangesAsync();

            var caregiver2 = new Caregiver
            {
                UserId = caregiver2User.Id,
                FullName = "John Smith",
                Specialization = "Physical Therapy Assistant",
                ExperienceYears = 8,
                Bio = "Specialized in rehabilitation and physical therapy support for patients.",
                ImageUrl = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
                IsAvailable = true,
                HourlyRate = 250000,
                CreatedAt = DateTime.UtcNow
            };
            context.Caregivers.Add(caregiver2);

            await context.SaveChangesAsync();
            Console.WriteLine("✓ Sample caregivers created");
        }

        // Seed Services if not exists
        if (!await context.Services.AnyAsync())
        {
            var services = new List<Service>
            {
                new Service
                {
                    Name = "Basic Home Care",
                    Description = "Essential daily care including medication reminders, meal assistance, and basic health monitoring.",
                    PricePerHour = 20,
                    Type = ServiceType.Basic,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Service
                {
                    Name = "Premium Home Care",
                    Description = "Comprehensive care with specialized nursing, physical therapy assistance, and 24/7 monitoring.",
                    PricePerHour = 35,
                    Type = ServiceType.Premium,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Service
                {
                    Name = "Specialized Care",
                    Description = "Expert care for post-surgery recovery, chronic conditions, or specialized medical needs.",
                    PricePerHour = 50,
                    Type = ServiceType.Specialized,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Services.AddRange(services);
            await context.SaveChangesAsync();
            Console.WriteLine("✓ Sample services created");
        }

        // Seed Family with Patients if not exists
        if (!await context.Families.AnyAsync())
        {
            // Family User
            var familyUser = new User
            {
                Email = "family@homecare.com",
                Phone = "+84912345678",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("family123"),
                Role = UserRole.Family,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(familyUser);
            await context.SaveChangesAsync();

            var family = new Family
            {
                UserId = familyUser.Id,
                FullName = "Nguyen Van An",
                Address = "123 Nguyen Hue, District 1, Ho Chi Minh City",
                EmergencyContact = "+84987654321",
                CreatedAt = DateTime.UtcNow
            };
            context.Families.Add(family);
            await context.SaveChangesAsync();

            // Patients
            var patient1 = new Patient
            {
                FamilyId = family.Id,
                FullName = "Nguyen Thi Ba",
                DateOfBirth = new DateTime(1945, 5, 15),
                Gender = "Female",
                MedicalHistory = "Diabetes Type 2, Hypertension",
                Allergies = "Penicillin",
                CurrentCondition = "Requires blood pressure monitoring twice daily",
                CreatedAt = DateTime.UtcNow
            };

            var patient2 = new Patient
            {
                FamilyId = family.Id,
                FullName = "Nguyen Van Cuong",
                DateOfBirth = new DateTime(1950, 8, 20),
                Gender = "Male",
                MedicalHistory = "Post-stroke recovery, limited mobility",
                Allergies = "",
                CurrentCondition = "Needs physical therapy exercises daily",
                CreatedAt = DateTime.UtcNow
            };

            context.Patients.AddRange(patient1, patient2);
            await context.SaveChangesAsync();
            Console.WriteLine("✓ Sample family and patients created: family@homecare.com / family123");
        }

        // Seed Contracts, Schedules, CareLogs, Incidents if not exists
        if (!await context.Contracts.AnyAsync())
        {
            var family = await context.Families.Include(f => f.Patients).FirstAsync();
            var caregiver = await context.Caregivers.FirstAsync();
            var service = await context.Services.FirstAsync();
            var patient = family.Patients.First();

            // Create Contract (matching existing Contract model - uses AssignedCaregiverId)
            var contract = new Contract
            {
                FamilyId = family.Id,
                PatientId = patient.Id,
                AssignedCaregiverId = caregiver.Id,
                ServiceId = service.Id,
                StartDate = DateTime.UtcNow.Date,
                EndDate = DateTime.UtcNow.Date.AddMonths(3),
                WeeklySchedule = "{\"Days\":[\"MON\",\"WED\",\"FRI\"],\"StartTime\":\"09:00\",\"EndTime\":\"13:00\"}",
                TotalAmount = 12000000, // 12 million VND
                Status = ContractStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            context.Contracts.Add(contract);
            await context.SaveChangesAsync();

            // Create Schedules for next 2 weeks
            var today = DateTime.UtcNow.Date;
            var schedules = new List<Schedule>();
            
            for (int i = -7; i < 14; i++) // Include past 7 days
            {
                var date = today.AddDays(i);
                if (date.DayOfWeek == DayOfWeek.Monday || 
                    date.DayOfWeek == DayOfWeek.Wednesday || 
                    date.DayOfWeek == DayOfWeek.Friday)
                {
                    var schedule = new Schedule
                    {
                        ContractId = contract.Id,
                        PatientId = patient.Id,
                        CaregiverId = caregiver.Id,
                        Date = date,
                        StartTime = new TimeSpan(9, 0, 0),
                        EndTime = new TimeSpan(13, 0, 0),
                        Status = date < today ? ScheduleStatus.Completed : ScheduleStatus.Scheduled,
                        Notes = $"Regular care session for {patient.FullName}",
                        CreatedAt = DateTime.UtcNow
                    };
                    schedules.Add(schedule);
                }
            }
            context.Schedules.AddRange(schedules);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ Contract and {schedules.Count} schedules created");

            // Create CareLogs for past schedules
            var pastSchedules = schedules.Where(s => s.Date < today).ToList();
            foreach (var schedule in pastSchedules)
            {
                var careLog = new CareLog
                {
                    ScheduleId = schedule.Id,
                    CaregiverId = caregiver.Id,
                    PatientId = patient.Id,
                    Activities = "Assisted with morning routine, medication administration, light exercise, meal preparation",
                    MedicationsGiven = "Metformin 500mg, Losartan 50mg",
                    MealsProvided = "Breakfast: Oatmeal with fruits, Lunch: Rice with vegetables and fish",
                    VitalSigns = "BP: 130/85, HR: 72, Temp: 36.8°C",
                    PatientMood = "Good - Patient was cheerful and cooperative",
                    Notes = "Patient responded well to exercises. No issues reported.",
                    LoggedAt = schedule.Date.AddHours(13)
                };
                context.CareLogs.Add(careLog);
            }
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {pastSchedules.Count} care logs created");

            // Create Incidents
            if (pastSchedules.Any())
            {
                var incident = new Incident
                {
                    ScheduleId = pastSchedules.First().Id,
                    CaregiverId = caregiver.Id,
                    PatientId = patient.Id,
                    Title = "Minor Fall Incident",
                    Description = "Patient experienced a minor slip while walking to the bathroom. No injuries sustained.",
                    Severity = IncidentSeverity.Low,
                    Status = IncidentStatus.Resolved,
                    ActionTaken = "Helped patient up, checked for injuries, monitored for 30 minutes",
                    Resolution = "No injuries found. Recommended non-slip mats for bathroom.",
                    OccurredAt = pastSchedules.First().Date.AddHours(10),
                    ReportedAt = pastSchedules.First().Date.AddHours(10).AddMinutes(15),
                    ResolvedAt = pastSchedules.First().Date.AddHours(11)
                };
                context.Incidents.Add(incident);
                await context.SaveChangesAsync();
                Console.WriteLine("✓ Sample incident created");
            }

            // Create Feedback
            var feedback = new Feedback
            {
                FamilyId = family.Id,
                CaregiverId = caregiver.Id,
                ContractId = contract.Id,
                Rating = 5,
                Comment = "Sarah is an excellent caregiver. She is professional, caring, and always on time.",
                IsAnonymous = false,
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            };
            context.Feedbacks.Add(feedback);
            await context.SaveChangesAsync();
            Console.WriteLine("✓ Sample feedback created");

            // Create CareRequest
            var careRequest = new CareRequest
            {
                FamilyId = family.Id,
                PatientId = patient.Id,
                ServiceId = service.Id,
                Type = RequestType.OneTime,
                Status = RequestStatus.Pending,
                RequestedDate = DateTime.UtcNow.Date.AddDays(7),
                StartTime = new TimeSpan(14, 0, 0),
                EndTime = new TimeSpan(18, 0, 0),
                Notes = "Need extra care session for doctor's appointment accompaniment",
                CreatedAt = DateTime.UtcNow
            };
            context.CareRequests.Add(careRequest);
            await context.SaveChangesAsync();
            Console.WriteLine("✓ Sample care request created");

            // Create HealthReports
            var healthReports = new List<HealthReport>
            {
                new HealthReport
                {
                    PatientId = patient.Id,
                    CaregiverId = caregiver.Id,
                    ReportType = "Weekly Vital Summary",
                    Period = $"{today.AddDays(-7):MMM dd} - {today:MMM dd, yyyy}",
                    Status = "Stable",
                    HealthScore = 92,
                    VitalsData = "[{\"day\":\"Mon\",\"bp\":115,\"hr\":70},{\"day\":\"Tue\",\"bp\":118,\"hr\":72},{\"day\":\"Wed\",\"bp\":120,\"hr\":71},{\"day\":\"Thu\",\"bp\":117,\"hr\":74},{\"day\":\"Fri\",\"bp\":118,\"hr\":72}]",
                    Notes = "Blood pressure remained stable throughout the week. All readings within normal range.",
                    ReportDate = today.AddDays(-1),
                    CreatedAt = DateTime.UtcNow
                },
                new HealthReport
                {
                    PatientId = patient.Id,
                    CaregiverId = caregiver.Id,
                    ReportType = "Monthly Progress",
                    Period = $"{today.AddMonths(-1):MMM dd} - {today:MMM dd, yyyy}",
                    Status = "Improved",
                    HealthScore = 88,
                    VitalsData = "[{\"week\":1,\"avgBp\":122,\"avgHr\":75},{\"week\":2,\"avgBp\":120,\"avgHr\":73},{\"week\":3,\"avgBp\":118,\"avgHr\":72},{\"week\":4,\"avgBp\":117,\"avgHr\":71}]",
                    Notes = "Patient shows consistent improvement in blood pressure control. Medication is effective.",
                    ReportDate = today.AddDays(-3),
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new HealthReport
                {
                    PatientId = patient.Id,
                    CaregiverId = caregiver.Id,
                    ReportType = "Hypertension Log",
                    Period = $"{today.AddDays(-14):MMM dd} - {today.AddDays(-7):MMM dd, yyyy}",
                    Status = "Warning",
                    HealthScore = 78,
                    VitalsData = "[{\"day\":\"Mon\",\"bp\":135,\"hr\":80},{\"day\":\"Tue\",\"bp\":138,\"hr\":82},{\"day\":\"Wed\",\"bp\":142,\"hr\":85}]",
                    Notes = "Blood pressure was elevated during this period. Doctor was consulted and medication adjusted.",
                    ReportDate = today.AddDays(-7),
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                }
            };
            context.HealthReports.AddRange(healthReports);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {healthReports.Count} health reports created");
        }
    }
}
