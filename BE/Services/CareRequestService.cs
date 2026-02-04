using BE.Data;
using BE.Models;
using BE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Services;

public class CareRequestService : ICareRequestService
{
    private readonly ApplicationDbContext _context;

    public CareRequestService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CareRequestDto>> GetAllAsync()
    {
        var requests = await _context.CareRequests
            .Include(r => r.Family).ThenInclude(f => f.User)
            .Include(r => r.Patient)
            .Include(r => r.Service)
            .Include(r => r.AssignedCaregiver)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(r => MapToDto(r)).ToList();
    }

    public async Task<List<CareRequestDto>> GetByFamilyAsync(int familyId)
    {
        var requests = await _context.CareRequests
            .Where(r => r.FamilyId == familyId)
            .Include(r => r.Family).ThenInclude(f => f.User)
            .Include(r => r.Patient)
            .Include(r => r.Service)
            .Include(r => r.AssignedCaregiver)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return requests.Select(r => MapToDto(r)).ToList();
    }

    public async Task<CareRequestDto?> GetByIdAsync(int id)
    {
        var request = await _context.CareRequests
            .Include(r => r.Family).ThenInclude(f => f.User)
            .Include(r => r.Patient)
            .Include(r => r.Service)
            .Include(r => r.AssignedCaregiver)
            .FirstOrDefaultAsync(r => r.Id == id);

        return request != null ? MapToDto(request) : null;
    }

    public async Task<CareRequestDto> CreateAsync(int familyId, CreateCareRequestDto dto)
    {
        var request = new CareRequest
        {
            FamilyId = familyId,
            PatientId = dto.PatientId,
            ServiceId = dto.ServiceId,
            Type = dto.Type,
            Status = RequestStatus.Pending,
            RequestedDate = dto.RequestedDate,
            StartTime = TimeSpan.Parse(dto.StartTime),
            EndTime = TimeSpan.Parse(dto.EndTime),
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _context.CareRequests.Add(request);
        await _context.SaveChangesAsync();

        // Reload with navigation properties
        await _context.Entry(request).Reference(r => r.Family).LoadAsync();
        await _context.Entry(request.Family).Reference(f => f.User).LoadAsync();
        await _context.Entry(request).Reference(r => r.Patient).LoadAsync();
        await _context.Entry(request).Reference(r => r.Service).LoadAsync();

        return MapToDto(request);
    }

    public async Task<CareRequestDto?> UpdateStatusAsync(int id, RequestStatus status, string? adminNotes = null)
    {
        var request = await _context.CareRequests
            .Include(r => r.Family).ThenInclude(f => f.User)
            .Include(r => r.Patient)
            .Include(r => r.Service)
            .Include(r => r.AssignedCaregiver)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null) return null;

        request.Status = status;
        request.UpdatedAt = DateTime.UtcNow;
        if (adminNotes != null) request.AdminNotes = adminNotes;

        await _context.SaveChangesAsync();
        return MapToDto(request);
    }

    public async Task<CareRequestDto?> AssignCaregiverAsync(int id, int caregiverId)
    {
        var request = await _context.CareRequests
            .Include(r => r.Family).ThenInclude(f => f.User)
            .Include(r => r.Patient)
            .Include(r => r.Service)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null) return null;

        var caregiver = await _context.Caregivers.FindAsync(caregiverId);
        if (caregiver == null) return null;

        request.AssignedCaregiverId = caregiverId;
        request.AssignedCaregiver = caregiver;
        request.Status = RequestStatus.Approved;
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(request);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var request = await _context.CareRequests.FindAsync(id);
        if (request == null) return false;

        _context.CareRequests.Remove(request);
        await _context.SaveChangesAsync();
        return true;
    }

    private static CareRequestDto MapToDto(CareRequest r)
    {
        return new CareRequestDto
        {
            Id = r.Id,
            FamilyId = r.FamilyId,
            FamilyName = r.Family?.FullName ?? "",
            PatientId = r.PatientId,
            PatientName = r.Patient?.FullName ?? "",
            ServiceId = r.ServiceId,
            ServiceName = r.Service?.Name ?? "",
            AssignedCaregiverId = r.AssignedCaregiverId,
            AssignedCaregiverName = r.AssignedCaregiver?.FullName,
            Type = r.Type.ToString(),
            Status = r.Status.ToString(),
            RequestedDate = r.RequestedDate,
            StartTime = r.StartTime.ToString(@"hh\:mm"),
            EndTime = r.EndTime.ToString(@"hh\:mm"),
            Notes = r.Notes,
            AdminNotes = r.AdminNotes,
            CreatedAt = r.CreatedAt
        };
    }
}
