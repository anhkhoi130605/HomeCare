using BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedbackController : ControllerBase
{
    private readonly IFeedbackService _feedbackService;

    public FeedbackController(IFeedbackService feedbackService)
    {
        _feedbackService = feedbackService;
    }

    /// <summary>
    /// Get feedback for a caregiver
    /// </summary>
    [HttpGet("caregiver/{caregiverId}")]
    public async Task<ActionResult<IEnumerable<FeedbackDto>>> GetByCaregiver(int caregiverId)
    {
        var feedbacks = await _feedbackService.GetFeedbackByCaregiverAsync(caregiverId);
        return Ok(feedbacks);
    }

    /// <summary>
    /// Get caregiver rating summary
    /// </summary>
    [HttpGet("caregiver/{caregiverId}/rating")]
    public async Task<ActionResult<CaregiverRatingDto>> GetCaregiverRating(int caregiverId)
    {
        var rating = await _feedbackService.GetCaregiverRatingAsync(caregiverId);
        return Ok(rating);
    }

    /// <summary>
    /// Get my family's feedbacks
    /// </summary>
    [HttpGet("my")]
    [Authorize(Roles = "Family")]
    public async Task<ActionResult<IEnumerable<FeedbackDto>>> GetMyFeedbacks()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();

        var userId = int.Parse(userIdClaim);
        // Need to get familyId from userId - using service would be cleaner but this works
        var feedbacks = await _feedbackService.GetFeedbackByFamilyAsync(userId);
        return Ok(feedbacks);
    }

    /// <summary>
    /// Create feedback (family only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Family")]
    public async Task<ActionResult<FeedbackDto>> Create([FromBody] CreateFeedbackDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim);
            var feedback = await _feedbackService.CreateFeedbackAsync(userId, dto);
            return CreatedAtAction(nameof(GetByCaregiver), new { caregiverId = feedback.CaregiverId }, feedback);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
