using BE.DTOs.Caregiver;
using BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CaregiverController : ControllerBase
{
    private readonly ICaregiverService _caregiverService;

    public CaregiverController(ICaregiverService caregiverService)
    {
        _caregiverService = caregiverService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    private int GetCaregiverId() => int.Parse(User.FindFirst("CaregiverId")?.Value ?? "0");

    /// <summary>
    /// Get all caregivers (public - for families to view)
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<CaregiverDto>>> GetAllCaregivers([FromQuery] bool? available = null)
    {
        try
        {
            var caregivers = await _caregiverService.GetAllCaregiversAsync(available);
            return Ok(caregivers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get specific caregiver (public - for families to view)
    /// </summary>
    [HttpGet("{caregiverId}")]
    [AllowAnonymous]
    public async Task<ActionResult<CaregiverDto>> GetCaregiver(int caregiverId)
    {
        try
        {
            var caregiver = await _caregiverService.GetCaregiverAsync(caregiverId);
            if (caregiver == null)
                return NotFound(new { message = "Caregiver not found" });
            return Ok(caregiver);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get caregiver's own profile
    /// </summary>
    [HttpGet("profile")]
    [Authorize(Roles = "Caregiver")]
    public async Task<ActionResult<CaregiverProfileDto>> GetProfile()
    {
        try
        {
            var profile = await _caregiverService.GetProfileAsync(GetUserId());
            if (profile == null)
                return NotFound(new { message = "Caregiver profile not found" });
            return Ok(profile);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update caregiver's profile
    /// </summary>
    [HttpPut("profile")]
    [Authorize(Roles = "Caregiver")]
    public async Task<ActionResult<CaregiverProfileDto>> UpdateProfile([FromBody] UpdateCaregiverDto dto)
    {
        try
        {
            var profile = await _caregiverService.UpdateProfileAsync(GetUserId(), dto);
            return Ok(profile);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get caregiver's schedules
    /// </summary>
    [HttpGet("schedules")]
    [Authorize(Roles = "Caregiver")]
    public async Task<ActionResult<List<ScheduleDto>>> GetSchedules([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        try
        {
            var caregiverId = GetCaregiverId();
            if (caregiverId == 0)
                return BadRequest(new { message = "Caregiver not found" });

            var schedules = await _caregiverService.GetSchedulesAsync(caregiverId, from, to);
            return Ok(schedules);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Check-in for a schedule
    /// </summary>
    [HttpPost("schedules/{scheduleId}/check-in")]
    [Authorize(Roles = "Caregiver")]
    public async Task<ActionResult<ScheduleDto>> CheckIn(int scheduleId)
    {
        try
        {
            var caregiverId = GetCaregiverId();
            var schedule = await _caregiverService.CheckInAsync(caregiverId, scheduleId);
            if (schedule == null)
                return NotFound(new { message = "Schedule not found" });
            return Ok(schedule);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Check-out from a schedule
    /// </summary>
    [HttpPost("schedules/{scheduleId}/check-out")]
    [Authorize(Roles = "Caregiver")]
    public async Task<ActionResult<ScheduleDto>> CheckOut(int scheduleId)
    {
        try
        {
            var caregiverId = GetCaregiverId();
            var schedule = await _caregiverService.CheckOutAsync(caregiverId, scheduleId);
            if (schedule == null)
                return NotFound(new { message = "Schedule not found" });
            return Ok(schedule);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
    /// <summary>
    /// Get patient details (for caregivers)
    /// </summary>
    [HttpGet("patients/{patientId}")]
    [Authorize(Roles = "Caregiver")]
    public async Task<ActionResult<CaregiverPatientDto>> GetPatient(int patientId)
    {
        try
        {
            var patient = await _caregiverService.GetPatientAsync(patientId);
            if (patient == null)
                return NotFound(new { message = "Patient not found" });
            return Ok(patient);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
