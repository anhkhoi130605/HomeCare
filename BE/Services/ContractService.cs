using BE.Data;
using BE.DTOs.Contract;
using BE.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BE.Services;

public interface IContractService
{
    Task<IEnumerable<ContractDto>> GetMyContractsAsync(int userId);
    Task<IEnumerable<ContractDto>> GetAllContractsAsync(); // For admin
    Task<ContractDto?> GetContractByIdAsync(int id);
    Task<ContractDto> CreateContractAsync(int userId, CreateContractDto dto);
    Task<bool> UpdateContractStatusAsync(int id, ContractStatus status);
}

public class ContractService : IContractService
{
    private readonly ApplicationDbContext _context;

    public ContractService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ContractDto>> GetMyContractsAsync(int userId)
    {
        // Find family profile for this user
        var family = await _context.Families.FirstOrDefaultAsync(f => f.UserId == userId);
        if (family == null) return new List<ContractDto>();

        var contracts = await _context.Contracts
            .Include(c => c.Patient)
            .Include(c => c.Service)
            .Include(c => c.AssignedCaregiver)
            .Where(c => c.FamilyId == family.Id)
            .ToListAsync();

        return contracts.Select(MapToDto);
    }

    public async Task<IEnumerable<ContractDto>> GetAllContractsAsync()
    {
        var contracts = await _context.Contracts
            .Include(c => c.Family).ThenInclude(f => f.User)
            .Include(c => c.Patient)
            .Include(c => c.Service)
            .Include(c => c.AssignedCaregiver)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return contracts.Select(MapToDto);
    }

    public async Task<ContractDto?> GetContractByIdAsync(int id)
    {
        var contract = await _context.Contracts
            .Include(c => c.Family).ThenInclude(f => f.User)
            .Include(c => c.Patient)
            .Include(c => c.Service)
            .Include(c => c.AssignedCaregiver)
            .FirstOrDefaultAsync(c => c.Id == id);

        return contract == null ? null : MapToDto(contract);
    }

    public async Task<ContractDto> CreateContractAsync(int userId, CreateContractDto dto)
    {
        var family = await _context.Families.FirstOrDefaultAsync(f => f.UserId == userId);
        if (family == null) throw new Exception("Family profile not found");

        var service = await _context.Services.FindAsync(dto.ServiceId);
        if (service == null) throw new Exception("Service package not found");

        // Calculate Amount
        decimal totalAmount = 0;
        
        // Deserialize schedule to calculate hours
        if (!string.IsNullOrEmpty(dto.WeeklySchedule))
        {
            try 
            {
                var schedule = JsonSerializer.Deserialize<WeeklyScheduleDto>(dto.WeeklySchedule);
                if (schedule != null && schedule.Days.Any())
                {
                    if (TimeSpan.TryParse(schedule.StartTime, out var start) && TimeSpan.TryParse(schedule.EndTime, out var end))
                    {
                        var hoursPerDay = (decimal)(end - start).TotalHours;
                        if (hoursPerDay < 0) hoursPerDay += 24; // Handle overnight? Assuming day shift for now
                        
                        var daysPerWeek = schedule.Days.Count;
                        var totalDays = (dto.EndDate - dto.StartDate).TotalDays;
                        var weeks = (decimal)Math.Ceiling(totalDays / 7.0);
                        
                        var totalHours = hoursPerDay * daysPerWeek * weeks;
                        totalAmount = totalHours * service.PricePerHour; // Price is hourly
                    }
                }
            }
            catch 
            {
                // Fallback or ignore if basic calculation fails
                totalAmount = service.PricePerHour * 10; // Dummy fallback
            }
        }
        
        // Ensure at least some amount
        if (totalAmount <= 0) totalAmount = service.PricePerHour; // minimal

        var contract = new Contract
        {
            FamilyId = family.Id,
            PatientId = dto.PatientId,
            ServiceId = dto.ServiceId,
            AssignedCaregiverId = dto.AssignedCaregiverId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            TotalAmount = totalAmount,
            Status = ContractStatus.Pending,
            WeeklySchedule = dto.WeeklySchedule,
            Address = dto.Address
        };

        _context.Contracts.Add(contract);
        await _context.SaveChangesAsync();

        // Reload to get includes if needed, or just map manually
        // For simplicity returning basic mapping + names we know
        contract.Service = service;
        // patient/caregiver lazy loaded or null if DTO return needed immediately with names.
        // Let's rely on basic mapping.
        
        return MapToDto(contract);
    }

    public async Task<bool> UpdateContractStatusAsync(int id, ContractStatus status)
    {
        var contract = await _context.Contracts.FindAsync(id);
        if (contract == null) return false;

        contract.Status = status;
        await _context.SaveChangesAsync();
        return true;
    }

    private static ContractDto MapToDto(Contract c)
    {
        return new ContractDto
        {
            Id = c.Id,
            FamilyId = c.FamilyId,
            FamilyName = c.Family?.FullName ?? "",
            PatientId = c.PatientId,
            PatientName = c.Patient?.FullName ?? "",
            ServiceId = c.ServiceId,
            ServiceName = c.Service?.Name ?? "",
            AssignedCaregiverId = c.AssignedCaregiverId,
            CaregiverName = c.AssignedCaregiver?.FullName,
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            TotalAmount = c.TotalAmount,
            Status = c.Status.ToString(),
            WeeklySchedule = c.WeeklySchedule,
            Address = c.Address,
            CreatedAt = c.CreatedAt
        };
    }
}
