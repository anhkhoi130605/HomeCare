using BE.Data;
using BE.Models;
using BE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Services;

public class CareRequestService : ICareRequestService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public CareRequestService(ApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<List<CareRequestDto>> GetAllAsync()
    {
        var requests = await _context.CareRequests
            .AsNoTracking()
            .Include(r => r.Family)
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
            .AsNoTracking()
            .Where(r => r.FamilyId == familyId)
            .Include(r => r.Family)
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
            .AsNoTracking()
            .Include(r => r.Family)
            .Include(r => r.Patient)
            .Include(r => r.Service)
            .Include(r => r.AssignedCaregiver)
            .FirstOrDefaultAsync(r => r.Id == id);

        return request != null ? MapToDto(request) : null;
    }

    public async Task<CareRequestDto> CreateAsync(int familyId, CreateCareRequestDto dto)
    {
        // Load service to ensure price calculation works later
        var service = await _context.Services.FindAsync(dto.ServiceId);

        var startTimeStr = dto.StartTime.Length == 5 ? dto.StartTime + ":00" : dto.StartTime;
        var startTime = TimeSpan.Parse(startTimeStr);
        var endTime = startTime.Add(TimeSpan.FromHours(dto.Duration));

        var request = new CareRequest
        {
            FamilyId = familyId,
            PatientId = dto.PatientId,
            ServiceId = dto.ServiceId,
            Type = dto.Type,
            Status = RequestStatus.Pending,
            RequestedDate = dto.RequestedDate,
            StartTime = startTime,
            EndTime = endTime,
            Duration = dto.Duration,
            Notes = dto.Notes,
            Address = dto.Address,
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

        // Send notification if request is approved and waiting for payment
        if (status == RequestStatus.AwaitingPayment && request.Family?.UserId != null)
        {
            await _notificationService.CreateNotificationAsync(
                request.Family.UserId,
                "Request Approved",
                $"Your care request for {request.Patient?.FullName} has been approved. Please proceed to payment to finalize the booking.",
                "Payment",
                request.Id
            );
        }

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

        // Check for schedule conflicts before assigning
        var existingSchedule = await _context.Schedules.FirstOrDefaultAsync(s => s.CareRequestId == id);
        var hasConflict = await _context.Schedules
            .Where(s => s.CaregiverId == caregiverId)
            .Where(s => s.Date == request.RequestedDate.Date)
            .Where(s => s.Status != ScheduleStatus.Cancelled)
            .Where(s => existingSchedule != null ? s.Id != existingSchedule.Id : true)
            .Where(s => s.StartTime < request.EndTime && s.EndTime > request.StartTime)
            .AnyAsync();

        if (hasConflict)
            throw new InvalidOperationException("Lịch bị trùng! Caregiver này đã có lịch làm việc trùng giờ trong ngày được yêu cầu.");

        request.AssignedCaregiverId = caregiverId;
        request.AssignedCaregiver = caregiver;
        request.Status = RequestStatus.Assigned;
        request.UpdatedAt = DateTime.UtcNow;

        if (existingSchedule != null)
        {
            existingSchedule.CaregiverId = caregiverId;
            existingSchedule.Status = ScheduleStatus.Scheduled;
        }
        else
        {
            var schedule = new Schedule
            {
                PatientId = request.PatientId,
                CaregiverId = caregiverId,
                CareRequestId = request.Id,
                Date = request.RequestedDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Status = ScheduleStatus.Scheduled,
                Notes = $"One-time request for: {request.Service.Name}",
                CreatedAt = DateTime.UtcNow
            };
            _context.Schedules.Add(schedule);
        }

        await _context.SaveChangesAsync();
        return MapToDto(request);
    }

    public async Task<CareRequestDto?> RefundAsync(int id, string? adminNotes = null)
    {
        var request = await _context.CareRequests
            .Include(r => r.Family).ThenInclude(f => f.User)
            .Include(r => r.Patient)
            .Include(r => r.Service)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null) return null;

        // Cancel the Care Request
        request.Status = RequestStatus.Cancelled;
        request.UpdatedAt = DateTime.UtcNow;
        if (adminNotes != null) request.AdminNotes = adminNotes;

        // Find associated successful payment and refund it
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.CareRequestId == id && p.Status == PaymentStatus.Success);
            
        if (payment != null)
        {
            payment.Status = PaymentStatus.Refunded;
            
            // Send notification about refund
            if (request.Family?.UserId != null)
            {
                await _notificationService.CreateNotificationAsync(
                    request.Family.UserId,
                    "Payment Refunded",
                    $"Your payment for care request '{request.Service?.Name}' has been refunded. Reason: {adminNotes ?? "Admin cancelled"}",
                    "Payment",
                    request.Id
                );
            }
        }

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
            Address = r.Address,
            AdminNotes = r.AdminNotes,
            CreatedAt = r.CreatedAt,
            Duration = r.Duration,
            TotalAmount = r.Service != null ? (r.Service.PricePerHour * r.Duration) : 0
        };
    }
}
