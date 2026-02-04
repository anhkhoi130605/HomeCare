using BE.DTOs.Family;
using BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FamilyController : ControllerBase
{
    private readonly IFamilyService _familyService;

    public FamilyController(IFamilyService familyService)
    {
        _familyService = familyService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    private int GetFamilyId() => int.Parse(User.FindFirst("FamilyId")?.Value ?? "0");

    /// <summary>
    /// Get current family profile
    /// </summary>
    [HttpGet("profile")]
    public async Task<ActionResult<FamilyProfileDto>> GetProfile()
    {
        try
        {
            var profile = await _familyService.GetProfileAsync(GetUserId());
            if (profile == null)
                return NotFound(new { message = "Family profile not found" });
            return Ok(profile);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update family profile
    /// </summary>
    [HttpPut("profile")]
    public async Task<ActionResult<FamilyProfileDto>> UpdateProfile([FromBody] UpdateFamilyDto dto)
    {
        try
        {
            var profile = await _familyService.UpdateProfileAsync(GetUserId(), dto);
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
    /// Get all patients for the family
    /// </summary>
    [HttpGet("patients")]
    public async Task<ActionResult<List<PatientDto>>> GetPatients()
    {
        try
        {
            var familyId = GetFamilyId();
            if (familyId == 0)
                return BadRequest(new { message = "Family not found" });

            var patients = await _familyService.GetPatientsAsync(familyId);
            return Ok(patients);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get specific patient
    /// </summary>
    [HttpGet("patients/{patientId}")]
    public async Task<ActionResult<PatientDto>> GetPatient(int patientId)
    {
        try
        {
            var familyId = GetFamilyId();
            var patient = await _familyService.GetPatientAsync(familyId, patientId);
            if (patient == null)
                return NotFound(new { message = "Patient not found" });
            return Ok(patient);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Add new patient
    /// </summary>
    [HttpPost("patients")]
    public async Task<ActionResult<PatientDto>> AddPatient([FromBody] CreatePatientDto dto)
    {
        try
        {
            var familyId = GetFamilyId();
            if (familyId == 0)
                return BadRequest(new { message = "Family not found" });

            var patient = await _familyService.AddPatientAsync(familyId, dto);
            return CreatedAtAction(nameof(GetPatient), new { patientId = patient.Id }, patient);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update patient
    /// </summary>
    [HttpPut("patients/{patientId}")]
    public async Task<ActionResult<PatientDto>> UpdatePatient(int patientId, [FromBody] UpdatePatientDto dto)
    {
        try
        {
            var familyId = GetFamilyId();
            var patient = await _familyService.UpdatePatientAsync(familyId, patientId, dto);
            return Ok(patient);
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
    /// Delete patient
    /// </summary>
    [HttpDelete("patients/{patientId}")]
    public async Task<ActionResult> DeletePatient(int patientId)
    {
        try
        {
            var familyId = GetFamilyId();
            var result = await _familyService.DeletePatientAsync(familyId, patientId);
            if (!result)
                return NotFound(new { message = "Patient not found" });
            return Ok(new { message = "Patient deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
