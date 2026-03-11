using BE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CareLogController : ControllerBase
{
    private readonly ICareLogService _careLogService;

    public CareLogController(ICareLogService careLogService)
    {
        _careLogService = careLogService;
    }

    // GET /api/carelog - Get all care logs (admin)
    [HttpGet]
    [Authorize(Roles = "Admin,OperationAdmin")]
    public async Task<ActionResult<List<CareLogDto>>> GetAll()
    {
        var logs = await _careLogService.GetAllAsync();
        return Ok(logs);
    }

    // GET /api/carelog/schedule/{scheduleId}
    [HttpGet("schedule/{scheduleId}")]
    [Authorize]
    public async Task<ActionResult<List<CareLogDto>>> GetBySchedule(int scheduleId)
    {
        var logs = await _careLogService.GetByScheduleAsync(scheduleId);
        return Ok(logs);
    }

    // GET /api/carelog/caregiver/{caregiverId}
    [HttpGet("caregiver/{caregiverId}")]
    [Authorize]
    public async Task<ActionResult<List<CareLogDto>>> GetByCaregiver(
        int caregiverId, 
        [FromQuery] DateTime? from = null, 
        [FromQuery] DateTime? to = null)
    {
        var logs = await _careLogService.GetByCaregiverAsync(caregiverId, from, to);
        return Ok(logs);
    }

    // GET /api/carelog/my - Get current caregiver's logs
    [HttpGet("my")]
    [Authorize(Roles = "Caregiver")]
    public async Task<ActionResult<List<CareLogDto>>> GetMyCaregiverLogs(
        [FromQuery] DateTime? from = null, 
        [FromQuery] DateTime? to = null)
    {
        var caregiverId = GetCaregiverId();
        if (caregiverId == null) return Unauthorized();

        var logs = await _careLogService.GetByCaregiverAsync(caregiverId.Value, from, to);
        return Ok(logs);
    }

    // GET /api/carelog/patient/{patientId}
    [HttpGet("patient/{patientId}")]
    [Authorize]
    public async Task<ActionResult<List<CareLogDto>>> GetByPatient(
        int patientId,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var logs = await _careLogService.GetByPatientAsync(patientId, from, to);
        return Ok(logs);
    }

    // GET /api/carelog/{id}
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<CareLogDto>> GetById(int id)
    {
        var log = await _careLogService.GetByIdAsync(id);
        if (log == null) return NotFound();
        return Ok(log);
    }

    // POST /api/carelog
    [HttpPost]
    [Authorize(Roles = "Caregiver")]
    public async Task<ActionResult<CareLogDto>> Create([FromBody] CreateCareLogDto dto)
    {
        try
        {
            var caregiverId = GetCaregiverId();
            if (caregiverId == null) return Unauthorized();

            var log = await _careLogService.CreateAsync(caregiverId.Value, dto);
            return CreatedAtAction(nameof(GetById), new { id = log.Id }, log);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // PUT /api/carelog/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Caregiver")]
    public async Task<ActionResult<CareLogDto>> Update(int id, [FromBody] UpdateCareLogDto dto)
    {
        var log = await _careLogService.UpdateAsync(id, dto);
        if (log == null) return NotFound();
        return Ok(log);
    }

    // DELETE /api/carelog/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _careLogService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    private int? GetCaregiverId()
    {
        var caregiverIdClaim = User.FindFirst("CaregiverId")?.Value;
        if (caregiverIdClaim != null && int.TryParse(caregiverIdClaim, out var id))
            return id;
        return null;
    }
}
