using BE.DTOs.Caregiver;
using BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScheduleController : ControllerBase
{
    private readonly IScheduleService _scheduleService;

    public ScheduleController(IScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    /// <summary>
    /// Get all schedules (admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,OperationAdmin")]
    public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetAll(
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var schedules = await _scheduleService.GetAllSchedulesAsync(from, to);
        return Ok(schedules);
    }

    /// <summary>
    /// Get schedules by caregiver
    /// </summary>
    [HttpGet("caregiver/{caregiverId}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetByCaregiver(
        int caregiverId,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var schedules = await _scheduleService.GetSchedulesByCaregiverAsync(caregiverId, from, to);
        return Ok(schedules);
    }

    [HttpGet("caregiver/{caregiverId}/today")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetTodayByCaregiver(int caregiverId)
    {
        var today = DateTime.Today;
        var schedules = await _scheduleService.GetSchedulesByCaregiverAsync(caregiverId, today, today);
        return Ok(schedules);
    }

    /// <summary>
    /// Get schedules by patient
    /// </summary>
    [HttpGet("patient/{patientId}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetByPatient(
        int patientId,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var schedules = await _scheduleService.GetSchedulesByPatientAsync(patientId, from, to);
        return Ok(schedules);
    }

    [HttpGet("patient/{patientId}/today")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetTodayByPatient(int patientId)
    {
        var today = DateTime.Today;
        var schedules = await _scheduleService.GetSchedulesByPatientAsync(patientId, today, today);
        return Ok(schedules);
    }

    /// <summary>
    /// Get schedule by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<ScheduleDto>> GetById(int id)
    {
        var schedule = await _scheduleService.GetScheduleByIdAsync(id);
        if (schedule == null)
            return NotFound();
        return Ok(schedule);
    }

    /// <summary>
    /// Create a new schedule (admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,OperationAdmin")]
    public async Task<ActionResult<ScheduleDto>> Create([FromBody] CreateScheduleDto dto)
    {
        try
        {
            var schedule = await _scheduleService.CreateScheduleAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = schedule.Id }, schedule);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update schedule
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ScheduleDto>> Update(int id, [FromBody] UpdateScheduleDto dto)
    {
        try
        {
            var schedule = await _scheduleService.UpdateScheduleAsync(id, dto);
            if (schedule == null)
                return NotFound();
            return Ok(schedule);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete schedule
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _scheduleService.DeleteScheduleAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }

    /// <summary>
    /// Check if a schedule conflicts with existing ones
    /// </summary>
    [HttpPost("check-conflict")]
    [Authorize]
    public async Task<ActionResult<object>> CheckConflict([FromBody] CheckConflictDto dto)
    {
        var hasConflict = await _scheduleService.HasConflictAsync(
            dto.CaregiverId, dto.Date, dto.StartTime, dto.EndTime, dto.ExcludeScheduleId);
        return Ok(new { hasConflict });
    }

    [HttpGet("check-request-conflict/{requestId}/{caregiverId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CheckRequestConflict(int requestId, int caregiverId)
    {
        var hasConflict = await _scheduleService.HasRequestConflictAsync(caregiverId, requestId);
        return Ok(new { hasConflict });
    }

    /// <summary>
    /// Generate schedules from contract (admin only)
    /// </summary>
    [HttpPost("generate/{contractId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ScheduleGenerationResult>> GenerateFromContract(int contractId)
    {
        try
        {
            var result = await _scheduleService.GenerateSchedulesFromContractAsync(contractId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/checkin")]
    [Authorize(Roles = "Caregiver")]
    public async Task<IActionResult> CheckIn(int id)
    {
        var schedule = await _scheduleService.CheckInAsync(id);
        if (schedule == null) return NotFound();
        return Ok(schedule);
    }

    [HttpPost("{id}/checkout")]
    [Authorize(Roles = "Caregiver")]
    public async Task<IActionResult> CheckOut(int id, [FromBody] CheckOutDto dto)
    {
        var schedule = await _scheduleService.CheckOutAsync(id, dto.Notes);
        if (schedule == null) return NotFound();
        return Ok(schedule);
    }

    [HttpPost("assign-from-request")]
    [Authorize(Roles = "OperationAdmin,Admin")]
    public async Task<IActionResult> AssignFromRequest([FromBody] AssignScheduleDto dto)
    {
        try
        {
            var schedule = await _scheduleService.AssignFromRequestAsync(dto);
            return Ok(schedule);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class CheckOutDto
{
    public string Notes { get; set; } = string.Empty;
}

public class CheckConflictDto
{
    public int CaregiverId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int? ExcludeScheduleId { get; set; }
}
