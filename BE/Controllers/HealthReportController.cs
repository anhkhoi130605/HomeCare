using BE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthReportController : ControllerBase
{
    private readonly IHealthReportService _healthReportService;

    public HealthReportController(IHealthReportService healthReportService)
    {
        _healthReportService = healthReportService;
    }

    // GET /api/healthreport - Get all reports (admin)
    [HttpGet]
    [Authorize(Roles = "Admin,OperationAdmin")]
    public async Task<ActionResult<List<HealthReportDto>>> GetAll()
    {
        var reports = await _healthReportService.GetAllAsync();
        return Ok(reports);
    }

    // GET /api/healthreport/my - Get reports for family's patients
    [HttpGet("my")]
    [Authorize(Roles = "Family")]
    public async Task<ActionResult<List<HealthReportDto>>> GetMyFamilyReports()
    {
        var familyId = GetFamilyId();
        if (familyId == null) return Unauthorized();

        var reports = await _healthReportService.GetByFamilyAsync(familyId.Value);
        return Ok(reports);
    }

    // GET /api/healthreport/patient/{patientId}
    [HttpGet("patient/{patientId}")]
    [Authorize]
    public async Task<ActionResult<List<HealthReportDto>>> GetByPatient(int patientId)
    {
        var reports = await _healthReportService.GetByPatientAsync(patientId);
        return Ok(reports);
    }

    // GET /api/healthreport/{id}
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<HealthReportDto>> GetById(int id)
    {
        var report = await _healthReportService.GetByIdAsync(id);
        if (report == null) return NotFound();
        return Ok(report);
    }

    // POST /api/healthreport
    [HttpPost]
    [Authorize(Roles = "Admin,OperationAdmin,Caregiver")]
    public async Task<ActionResult<HealthReportDto>> Create([FromBody] CreateHealthReportDto dto)
    {
        try
        {
            // If caregiver, set caregiverId
            var caregiverId = GetCaregiverId();
            if (caregiverId != null && dto.CaregiverId == null)
            {
                dto.CaregiverId = caregiverId;
            }

            var report = await _healthReportService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = report.Id }, report);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // PUT /api/healthreport/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,OperationAdmin,Caregiver")]
    public async Task<ActionResult<HealthReportDto>> Update(int id, [FromBody] UpdateHealthReportDto dto)
    {
        var report = await _healthReportService.UpdateAsync(id, dto);
        if (report == null) return NotFound();
        return Ok(report);
    }

    // DELETE /api/healthreport/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,OperationAdmin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _healthReportService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    private int? GetFamilyId()
    {
        var claim = User.FindFirst("FamilyId");
        if (claim != null && int.TryParse(claim.Value, out var id))
            return id;
        return null;
    }

    private int? GetCaregiverId()
    {
        var caregiverIdClaim = User.Claims.FirstOrDefault(c => c.Type.Equals("CaregiverId", StringComparison.OrdinalIgnoreCase))?.Value;
        if (caregiverIdClaim != null && int.TryParse(caregiverIdClaim, out var id))
            return id;
        return null;
    }
}
