using BE.Data;
using BE.DTOs.Admin;
using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.Services;

public interface IAdminService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    Task<List<RecentActivityDto>> GetRecentActivitiesAsync(int count = 10);
    Task<List<PendingRequestDto>> GetPendingRequestsAsync();
    Task<List<UserDto>> GetAllUsersAsync(string? role = null);
    Task<UserDto?> GetUserAsync(int userId);
    Task<bool> ToggleUserStatusAsync(int userId, bool isActive);
    Task<bool> DeleteUserAsync(int userId);
    Task<UserDto> CreateUserAsync(CreateUserAdminDto dto);
    Task<List<AdminPatientDto>> GetAllPatientsAsync();
    Task<List<AdminCaregiverDto>> GetAllCaregiversAsync();
    Task<List<AdminScheduleDto>> GetAllSchedulesAsync(DateTime? from = null, DateTime? to = null);
    
    // Caregiver CRUD
    Task<AdminCaregiverDto> CreateCaregiverAsync(CreateCaregiverDto dto);
    Task<AdminCaregiverDto?> UpdateCaregiverAsync(int caregiverId, UpdateCaregiverAdminDto dto);
    Task<bool> DeleteCaregiverAsync(int caregiverId);
}

public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _context;

    public AdminService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var today = DateTime.Today;
        var thisMonth = new DateTime(today.Year, today.Month, 1);

        var totalPatients = await _context.Patients.CountAsync();
        var totalCaregivers = await _context.Caregivers.CountAsync();
        var totalFamilies = await _context.Families.CountAsync();
        var activeContracts = await _context.Contracts
            .Where(c => c.Status == ContractStatus.Active)
            .CountAsync();

        var todaySchedules = await _context.Schedules
            .Where(s => s.Date == today)
            .CountAsync();

        var completedToday = await _context.Schedules
            .Where(s => s.Date == today && s.Status == ScheduleStatus.Completed)
            .CountAsync();

        var monthlyRevenue = await _context.Payments
            .Where(p => p.PaidAt >= thisMonth && p.Status == PaymentStatus.Success)
            .SumAsync(p => p.Amount);

        var pendingPayments = await _context.Payments
            .Where(p => p.Status == PaymentStatus.Pending)
            .CountAsync();

        return new DashboardStatsDto
        {
            TotalPatients = totalPatients,
            TotalCaregivers = totalCaregivers,
            TotalFamilies = totalFamilies,
            ActiveContracts = activeContracts,
            TodaySchedules = todaySchedules,
            CompletedToday = completedToday,
            MonthlyRevenue = monthlyRevenue,
            PendingPayments = pendingPayments
        };
    }

    public async Task<List<RecentActivityDto>> GetRecentActivitiesAsync(int count = 10)
    {
        var activities = new List<RecentActivityDto>();

        // Get recent schedules
        var recentSchedules = await _context.Schedules
            .Include(s => s.Patient)
            .Include(s => s.Caregiver)
            .OrderByDescending(s => s.CreatedAt)
            .Take(count)
            .ToListAsync();

        foreach (var schedule in recentSchedules)
        {
            activities.Add(new RecentActivityDto
            {
                Type = "Schedule",
                Description = $"Schedule for {schedule.Patient.FullName} with {schedule.Caregiver.FullName}",
                Timestamp = schedule.CreatedAt,
                Status = schedule.Status.ToString()
            });
        }

        // Get recent payments
        var recentPayments = await _context.Payments
            .Include(p => p.Family)
            .OrderByDescending(p => p.CreatedAt)
            .Take(count / 2)
            .ToListAsync();

        foreach (var payment in recentPayments)
        {
            activities.Add(new RecentActivityDto
            {
                Type = "Payment",
                Description = $"Payment of {payment.Amount:N0} VND from {payment.Family.FullName}",
                Timestamp = payment.CreatedAt,
                Status = payment.Status.ToString()
            });
        }

        return activities.OrderByDescending(a => a.Timestamp).Take(count).ToList();
    }

    public async Task<List<PendingRequestDto>> GetPendingRequestsAsync()
    {
        // Get pending contracts to approve
        var pendingContracts = await _context.Contracts
            .Include(c => c.Family)
            .Include(c => c.Patient)
            .Include(c => c.Service)
            .Where(c => c.Status == ContractStatus.Pending)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return pendingContracts.Select(c => new PendingRequestDto
        {
            Id = c.Id,
            Type = "Contract",
            FamilyName = c.Family.FullName,
            PatientName = c.Patient.FullName,
            ServiceName = c.Service.Name,
            RequestedDate = c.CreatedAt,
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            Amount = c.TotalAmount
        }).ToList();
    }

    public async Task<List<UserDto>> GetAllUsersAsync(string? role = null)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrEmpty(role))
        {
            var userRole = Enum.Parse<UserRole>(role, ignoreCase: true);
            query = query.Where(u => u.Role == userRole);
        }

        var users = await query.OrderByDescending(u => u.CreatedAt).ToListAsync();

        return users.Select(u => new UserDto
        {
            Id = u.Id,
            Email = u.Email,
            Phone = u.Phone,
            Role = u.Role.ToString(),
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        }).ToList();
    }

    public async Task<UserDto?> GetUserAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> ToggleUserStatusAsync(int userId, bool isActive)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<UserDto> CreateUserAsync(CreateUserAdminDto dto)
    {
        // Check if email already exists
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existingUser != null)
            throw new InvalidOperationException("Email already exists");

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = dto.Phone,
            Role = Enum.Parse<UserRole>(dto.Role, ignoreCase: true),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<List<AdminPatientDto>> GetAllPatientsAsync()
    {
        var patients = await _context.Patients
            .Include(p => p.Family)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        // Get last visit for each patient from schedules
        var patientIds = patients.Select(p => p.Id).ToList();
        var lastVisits = await _context.Schedules
            .Where(s => patientIds.Contains(s.PatientId) && s.Status == ScheduleStatus.Completed)
            .GroupBy(s => s.PatientId)
            .Select(g => new { PatientId = g.Key, LastVisit = g.Max(s => s.Date) })
            .ToDictionaryAsync(x => x.PatientId, x => x.LastVisit);

        // Get assigned caregiver from active contracts
        var caregivers = await _context.Contracts
            .Where(c => patientIds.Contains(c.PatientId) && c.Status == ContractStatus.Active && c.AssignedCaregiverId != null)
            .Include(c => c.AssignedCaregiver)
            .GroupBy(c => c.PatientId)
            .Select(g => new { PatientId = g.Key, CaregiverName = g.First().AssignedCaregiver!.FullName })
            .ToDictionaryAsync(x => x.PatientId, x => x.CaregiverName);

        return patients.Select(p => new AdminPatientDto
        {
            Id = p.Id,
            FullName = p.FullName,
            Age = CalculateAge(p.DateOfBirth),
            Gender = p.Gender ?? "Unknown",
            FamilyName = p.Family.FullName,
            Address = !string.IsNullOrWhiteSpace(p.Address) 
                ? p.Address 
                : (!string.IsNullOrWhiteSpace(p.Family?.Address) 
                    ? p.Family.Address 
                    : "No address provided"),
            CaregiverName = caregivers.GetValueOrDefault(p.Id, "Unassigned"),
            MedicalHistory = p.MedicalHistory ?? "",
            CurrentCondition = p.CurrentCondition ?? "",
            Status = "Active",
            LastVisit = lastVisits.GetValueOrDefault(p.Id)
        }).ToList();
    }

    public async Task<List<AdminCaregiverDto>> GetAllCaregiversAsync()
    {
        var caregivers = await _context.Caregivers
            .Include(c => c.User)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        // Get ratings
        var caregiverIds = caregivers.Select(c => c.Id).ToList();
        var ratings = await _context.Feedbacks
            .Where(f => caregiverIds.Contains(f.CaregiverId))
            .GroupBy(f => f.CaregiverId)
            .Select(g => new { CaregiverId = g.Key, Rating = g.Average(f => f.Rating), Count = g.Count() })
            .ToDictionaryAsync(x => x.CaregiverId, x => new { x.Rating, x.Count });

        // Get active schedules count (today)
        var today = DateTime.Today;
        var activeSchedules = await _context.Schedules
            .Where(s => caregiverIds.Contains(s.CaregiverId) && s.Date == today && s.Status != ScheduleStatus.Cancelled)
            .GroupBy(s => s.CaregiverId)
            .Select(g => new { CaregiverId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.CaregiverId, x => x.Count);

        return caregivers.Select(c => new AdminCaregiverDto
        {
            Id = c.Id,
            FullName = c.FullName,
            Email = c.User.Email,
            Phone = c.User.Phone,
            Specialization = c.Specialization ?? "",
            ExperienceYears = c.ExperienceYears,
            HourlyRate = c.HourlyRate,
            IsAvailable = c.IsAvailable,
            ImageUrl = c.ImageUrl ?? "",
            Rating = ratings.GetValueOrDefault(c.Id)?.Rating ?? 0,
            ReviewCount = ratings.GetValueOrDefault(c.Id)?.Count ?? 0,
            TodaySchedules = activeSchedules.GetValueOrDefault(c.Id, 0),
            Status = c.IsAvailable ? (activeSchedules.GetValueOrDefault(c.Id, 0) > 0 ? "On-Duty" : "Online") : "Offline"
        }).ToList();
    }

    public async Task<List<AdminScheduleDto>> GetAllSchedulesAsync(DateTime? from = null, DateTime? to = null)
    {
        var query = _context.Schedules
            .Include(s => s.Patient).ThenInclude(p => p.Family)
            .Include(s => s.Caregiver)
            .Include(s => s.Contract!).ThenInclude(c => c.Service)
            .Include(s => s.CareRequest!).ThenInclude(r => r.Service)
            .AsQueryable();

        if (from.HasValue)
            query = query.Where(s => s.Date >= from.Value);
        if (to.HasValue)
            query = query.Where(s => s.Date <= to.Value);

        var schedules = await query.OrderBy(s => s.Date).ThenBy(s => s.StartTime).ToListAsync();

        return schedules.Select(s => {
            string finalAddress = "No address provided";
            
            if (!string.IsNullOrWhiteSpace(s.Patient?.Address))
                finalAddress = s.Patient.Address;
            else if (!string.IsNullOrWhiteSpace(s.CareRequest?.Address))
                finalAddress = s.CareRequest.Address;
            else if (!string.IsNullOrWhiteSpace(s.Contract?.Address))
                finalAddress = s.Contract.Address;
            else if (!string.IsNullOrWhiteSpace(s.Patient?.Family?.Address))
                finalAddress = s.Patient.Family.Address;

            var displayStatus = s.Status;
            if (displayStatus == ScheduleStatus.Scheduled || displayStatus == ScheduleStatus.InProgress)
            {
                var now = DateTime.Now;
                var shiftStart = s.Date.Date.Add(s.StartTime);
                var shiftEnd = s.Date.Date.Add(s.EndTime);

                if (displayStatus == ScheduleStatus.InProgress && shiftStart > now.AddMinutes(30))
                    displayStatus = ScheduleStatus.Scheduled;
                else if (shiftEnd < now.AddMinutes(-30))
                    displayStatus = ScheduleStatus.Failed;
            }

            return new AdminScheduleDto
            {
                Id = s.Id,
                PatientId = s.PatientId,
                PatientName = s.Patient?.FullName ?? "Unknown",
                PatientAddress = finalAddress,
                CaregiverId = s.CaregiverId,
                CaregiverName = s.Caregiver?.FullName ?? "Unassigned",
                CaregiverImage = s.Caregiver?.ImageUrl,
                ServiceName = s.CareRequest?.Service?.Name ?? s.Contract?.Service?.Name ?? "N/A",
                Date = s.Date,
                StartTime = s.StartTime.ToString(@"hh\:mm"),
                EndTime = s.EndTime.ToString(@"hh\:mm"),
                Status = displayStatus.ToString(),
                Notes = s.Notes
            };
        }).ToList();
    }

    private static int CalculateAge(DateTime dateOfBirth)
    {
        var today = DateTime.Today;
        var age = today.Year - dateOfBirth.Year;
        if (dateOfBirth.Date > today.AddYears(-age)) age--;
        return age;
    }

    public async Task<AdminCaregiverDto> CreateCaregiverAsync(CreateCaregiverDto dto)
    {
        // Check if email already exists
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existingUser != null)
            throw new InvalidOperationException("Email already exists");

        // Create User
        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = dto.Phone,
            Role = UserRole.Caregiver,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Create Caregiver
        var caregiver = new Caregiver
        {
            UserId = user.Id,
            FullName = dto.FullName,
            Specialization = dto.Specialization,
            ExperienceYears = dto.ExperienceYears,
            HourlyRate = dto.HourlyRate,
            ImageUrl = dto.ImageUrl,
            Bio = dto.Bio,
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow
        };
        _context.Caregivers.Add(caregiver);
        await _context.SaveChangesAsync();

        return new AdminCaregiverDto
        {
            Id = caregiver.Id,
            FullName = caregiver.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Specialization = caregiver.Specialization ?? "",
            ExperienceYears = caregiver.ExperienceYears,
            HourlyRate = caregiver.HourlyRate,
            IsAvailable = caregiver.IsAvailable,
            ImageUrl = caregiver.ImageUrl ?? "",
            Rating = 0,
            ReviewCount = 0,
            TodaySchedules = 0,
            Status = "Online"
        };
    }

    public async Task<AdminCaregiverDto?> UpdateCaregiverAsync(int caregiverId, UpdateCaregiverAdminDto dto)
    {
        var caregiver = await _context.Caregivers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == caregiverId);
        
        if (caregiver == null) return null;

        // Update fields if provided
        if (dto.FullName != null) caregiver.FullName = dto.FullName;
        if (dto.Phone != null) caregiver.User.Phone = dto.Phone;
        if (dto.Specialization != null) caregiver.Specialization = dto.Specialization;
        if (dto.ExperienceYears.HasValue) caregiver.ExperienceYears = dto.ExperienceYears.Value;
        if (dto.HourlyRate.HasValue) caregiver.HourlyRate = dto.HourlyRate.Value;
        if (dto.ImageUrl != null) caregiver.ImageUrl = dto.ImageUrl;
        if (dto.Bio != null) caregiver.Bio = dto.Bio;
        if (dto.IsAvailable.HasValue) caregiver.IsAvailable = dto.IsAvailable.Value;

        caregiver.User.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new AdminCaregiverDto
        {
            Id = caregiver.Id,
            FullName = caregiver.FullName,
            Email = caregiver.User.Email,
            Phone = caregiver.User.Phone,
            Specialization = caregiver.Specialization ?? "",
            ExperienceYears = caregiver.ExperienceYears,
            HourlyRate = caregiver.HourlyRate,
            IsAvailable = caregiver.IsAvailable,
            ImageUrl = caregiver.ImageUrl ?? "",
            Status = caregiver.IsAvailable ? "Online" : "Offline"
        };
    }

    public async Task<bool> DeleteCaregiverAsync(int caregiverId)
    {
        var caregiver = await _context.Caregivers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == caregiverId);
        
        if (caregiver == null) return false;

        // Soft delete: deactivate user instead of hard delete
        caregiver.User.IsActive = false;
        caregiver.IsAvailable = false;
        caregiver.User.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        
        return true;
    }
}

// Admin DTOs
public class AdminPatientDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public int Age { get; set; }
    public string Gender { get; set; } = "";
    public string FamilyName { get; set; } = "";
    public string Address { get; set; } = "";
    public string CaregiverName { get; set; } = "";
    public string MedicalHistory { get; set; } = "";
    public string CurrentCondition { get; set; } = "";
    public string Status { get; set; } = "";
    public DateTime? LastVisit { get; set; }
}

public class AdminCaregiverDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Specialization { get; set; } = "";
    public int ExperienceYears { get; set; }
    public decimal HourlyRate { get; set; }
    public bool IsAvailable { get; set; }
    public string? ImageUrl { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public int TodaySchedules { get; set; }
    public string Status { get; set; } = "";
}

public class AdminScheduleDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = "";
    public string PatientAddress { get; set; } = "";
    public int CaregiverId { get; set; }
    public string CaregiverName { get; set; } = "";
    public string? CaregiverImage { get; set; }
    public string ServiceName { get; set; } = "";
    public DateTime Date { get; set; }
    public string StartTime { get; set; } = "";
    public string EndTime { get; set; } = "";
    public string Status { get; set; } = "";
    public string? Notes { get; set; }
}

// Caregiver CRUD DTOs
public class CreateCaregiverDto
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Phone { get; set; } = "";
    public string FullName { get; set; } = "";
    public string? Specialization { get; set; }
    public int ExperienceYears { get; set; }
    public decimal HourlyRate { get; set; }
    public string? ImageUrl { get; set; }
    public string? Bio { get; set; }
}

public class UpdateCaregiverAdminDto
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Specialization { get; set; }
    public int? ExperienceYears { get; set; }
    public decimal? HourlyRate { get; set; }
    public string? ImageUrl { get; set; }
    public string? Bio { get; set; }
    public bool? IsAvailable { get; set; }
}

public class CreateUserAdminDto
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string? Phone { get; set; }
    public string Role { get; set; } = "Family";
}

