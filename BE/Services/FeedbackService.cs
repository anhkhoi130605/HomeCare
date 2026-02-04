using BE.Data;
using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.Services;

public interface IFeedbackService
{
    Task<List<FeedbackDto>> GetFeedbackByCaregiverAsync(int caregiverId);
    Task<List<FeedbackDto>> GetFeedbackByFamilyAsync(int familyId);
    Task<FeedbackDto?> GetFeedbackByIdAsync(int id);
    Task<FeedbackDto> CreateFeedbackAsync(int userId, CreateFeedbackDto dto);
    Task<CaregiverRatingDto> GetCaregiverRatingAsync(int caregiverId);
}

public class FeedbackDto
{
    public int Id { get; set; }
    public int FamilyId { get; set; }
    public string FamilyName { get; set; } = "";
    public int CaregiverId { get; set; }
    public string CaregiverName { get; set; } = "";
    public int? ContractId { get; set; }
    public int? ScheduleId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public bool IsAnonymous { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateFeedbackDto
{
    public int CaregiverId { get; set; }
    public int? ContractId { get; set; }
    public int? ScheduleId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public bool IsAnonymous { get; set; } = false;
}

public class CaregiverRatingDto
{
    public int CaregiverId { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public Dictionary<int, int> RatingDistribution { get; set; } = new();
}

public class FeedbackService : IFeedbackService
{
    private readonly ApplicationDbContext _context;

    public FeedbackService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FeedbackDto>> GetFeedbackByCaregiverAsync(int caregiverId)
    {
        var feedbacks = await _context.Feedbacks
            .Include(f => f.Family)
            .Include(f => f.Caregiver)
            .Where(f => f.CaregiverId == caregiverId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return feedbacks.Select(MapToDto).ToList();
    }

    public async Task<List<FeedbackDto>> GetFeedbackByFamilyAsync(int familyId)
    {
        var feedbacks = await _context.Feedbacks
            .Include(f => f.Family)
            .Include(f => f.Caregiver)
            .Where(f => f.FamilyId == familyId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return feedbacks.Select(MapToDto).ToList();
    }

    public async Task<FeedbackDto?> GetFeedbackByIdAsync(int id)
    {
        var feedback = await _context.Feedbacks
            .Include(f => f.Family)
            .Include(f => f.Caregiver)
            .FirstOrDefaultAsync(f => f.Id == id);

        return feedback == null ? null : MapToDto(feedback);
    }

    public async Task<FeedbackDto> CreateFeedbackAsync(int userId, CreateFeedbackDto dto)
    {
        var family = await _context.Families.FirstOrDefaultAsync(f => f.UserId == userId);
        if (family == null)
            throw new InvalidOperationException("Family profile not found");

        // Validate rating
        if (dto.Rating < 1 || dto.Rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5");

        // Verify caregiver exists
        var caregiverExists = await _context.Caregivers.AnyAsync(c => c.Id == dto.CaregiverId);
        if (!caregiverExists)
            throw new KeyNotFoundException("Caregiver not found");

        var feedback = new Feedback
        {
            FamilyId = family.Id,
            CaregiverId = dto.CaregiverId,
            ContractId = dto.ContractId,
            ScheduleId = dto.ScheduleId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            IsAnonymous = dto.IsAnonymous
        };

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync();

        return (await GetFeedbackByIdAsync(feedback.Id))!;
    }

    public async Task<CaregiverRatingDto> GetCaregiverRatingAsync(int caregiverId)
    {
        var feedbacks = await _context.Feedbacks
            .Where(f => f.CaregiverId == caregiverId)
            .ToListAsync();

        var result = new CaregiverRatingDto
        {
            CaregiverId = caregiverId,
            TotalReviews = feedbacks.Count
        };

        if (feedbacks.Any())
        {
            result.AverageRating = Math.Round(feedbacks.Average(f => f.Rating), 1);
            result.RatingDistribution = feedbacks
                .GroupBy(f => f.Rating)
                .ToDictionary(g => g.Key, g => g.Count());
        }

        // Fill missing ratings with 0
        for (int i = 1; i <= 5; i++)
        {
            if (!result.RatingDistribution.ContainsKey(i))
                result.RatingDistribution[i] = 0;
        }

        return result;
    }

    private static FeedbackDto MapToDto(Feedback f)
    {
        return new FeedbackDto
        {
            Id = f.Id,
            FamilyId = f.FamilyId,
            FamilyName = f.IsAnonymous ? "Anonymous" : (f.Family?.FullName ?? ""),
            CaregiverId = f.CaregiverId,
            CaregiverName = f.Caregiver?.FullName ?? "",
            ContractId = f.ContractId,
            ScheduleId = f.ScheduleId,
            Rating = f.Rating,
            Comment = f.Comment,
            IsAnonymous = f.IsAnonymous,
            CreatedAt = f.CreatedAt
        };
    }
}
