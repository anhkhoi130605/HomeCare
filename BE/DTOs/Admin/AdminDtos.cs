namespace BE.DTOs.Admin;

public class DashboardStatsDto
{
    public int TotalPatients { get; set; }
    public int TotalCaregivers { get; set; }
    public int TotalFamilies { get; set; }
    public int ActiveContracts { get; set; }
    public int TodaySchedules { get; set; }
    public int CompletedToday { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public int PendingPayments { get; set; }
}

public class RecentActivityDto
{
    public string Type { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime Timestamp { get; set; }
    public string Status { get; set; } = null!;
}

public class PendingRequestDto
{
    public int Id { get; set; }
    public string Type { get; set; } = null!;
    public string FamilyName { get; set; } = null!;
    public string PatientName { get; set; } = null!;
    public string ServiceName { get; set; } = null!;
    public DateTime RequestedDate { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Amount { get; set; }
}

public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string Role { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ApproveContractDto
{
    public int CaregiverId { get; set; }
    public string? Notes { get; set; }
}
