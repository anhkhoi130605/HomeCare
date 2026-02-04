using BE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncidentController : ControllerBase
{
    private readonly IIncidentService _incidentService;

    public IncidentController(IIncidentService incidentService)
    {
        _incidentService = incidentService;
    }

    // GET /api/incident - Admin only
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<IncidentDto>>> GetAll()
    {
        var incidents = await _incidentService.GetAllAsync();
        return Ok(incidents);
    }

    // GET /api/incident/caregiver/{caregiverId}
    [HttpGet("caregiver/{caregiverId}")]
    [Authorize]
    public async Task<ActionResult<List<IncidentDto>>> GetByCaregiver(int caregiverId)
    {
        var incidents = await _incidentService.GetByCaregiverAsync(caregiverId);
        return Ok(incidents);
    }

    // GET /api/incident/my - Current caregiver's incidents
    [HttpGet("my")]
    [Authorize(Roles = "Caregiver")]
    public async Task<ActionResult<List<IncidentDto>>> GetMyIncidents()
    {
        var caregiverId = GetCaregiverId();
        if (caregiverId == null) return Unauthorized();

        var incidents = await _incidentService.GetByCaregiverAsync(caregiverId.Value);
        return Ok(incidents);
    }

    // GET /api/incident/patient/{patientId}
    [HttpGet("patient/{patientId}")]
    [Authorize]
    public async Task<ActionResult<List<IncidentDto>>> GetByPatient(int patientId)
    {
        var incidents = await _incidentService.GetByPatientAsync(patientId);
        return Ok(incidents);
    }

    // GET /api/incident/{id}
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<IncidentDto>> GetById(int id)
    {
        var incident = await _incidentService.GetByIdAsync(id);
        if (incident == null) return NotFound();
        return Ok(incident);
    }

    // POST /api/incident
    [HttpPost]
    [Authorize(Roles = "Caregiver")]
    public async Task<ActionResult<IncidentDto>> Create([FromBody] CreateIncidentDto dto)
    {
        var caregiverId = GetCaregiverId();
        if (caregiverId == null) return Unauthorized();

        var incident = await _incidentService.CreateAsync(caregiverId.Value, dto);
        return CreatedAtAction(nameof(GetById), new { id = incident.Id }, incident);
    }

    // PUT /api/incident/{id}/status
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IncidentDto>> UpdateStatus(int id, [FromBody] UpdateIncidentStatusDto dto)
    {
        var incident = await _incidentService.UpdateStatusAsync(id, dto);
        if (incident == null) return NotFound();
        return Ok(incident);
    }

    // DELETE /api/incident/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _incidentService.DeleteAsync(id);
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
