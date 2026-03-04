using BE.Models;
using BE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CareRequestController : ControllerBase
{
    private readonly ICareRequestService _careRequestService;

    public CareRequestController(ICareRequestService careRequestService)
    {
        _careRequestService = careRequestService;
    }

    // GET /api/carerequest - Admin only
    [HttpGet]
    [Authorize(Roles = "Admin,OperationAdmin")]
    public async Task<ActionResult<List<CareRequestDto>>> GetAll()
    {
        var requests = await _careRequestService.GetAllAsync();
        return Ok(requests);
    }

    // GET /api/carerequest/my - Family's requests
    [HttpGet("my")]
    [Authorize(Roles = "Family")]
    public async Task<ActionResult<List<CareRequestDto>>> GetMyRequests()
    {
        var familyId = GetFamilyId();
        if (familyId == null) return Unauthorized();

        var requests = await _careRequestService.GetByFamilyAsync(familyId.Value);
        return Ok(requests);
    }

    // GET /api/carerequest/family/{familyId}
    [HttpGet("family/{familyId}")]
    [Authorize(Roles = "Admin,OperationAdmin")]
    public async Task<ActionResult<List<CareRequestDto>>> GetByFamily(int familyId)
    {
        var requests = await _careRequestService.GetByFamilyAsync(familyId);
        return Ok(requests);
    }

    // GET /api/carerequest/{id}
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<CareRequestDto>> GetById(int id)
    {
        var request = await _careRequestService.GetByIdAsync(id);
        if (request == null) return NotFound();
        return Ok(request);
    }

    // POST /api/carerequest
    [HttpPost]
    [Authorize(Roles = "Family")]
    public async Task<ActionResult<CareRequestDto>> Create([FromBody] CreateCareRequestDto dto)
    {
        var familyId = GetFamilyId();
        if (familyId == null) return Unauthorized();

        try
        {
            var request = await _careRequestService.CreateAsync(familyId.Value, dto);
            return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // PUT /api/carerequest/{id}/status
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,OperationAdmin")]
    public async Task<ActionResult<CareRequestDto>> UpdateStatus(int id, [FromBody] UpdateRequestStatusDto dto)
    {
        var request = await _careRequestService.UpdateStatusAsync(id, dto.Status, dto.AdminNotes);
        if (request == null) return NotFound();
        return Ok(request);
    }

    // PUT /api/carerequest/{id}/assign
    [HttpPut("{id}/assign")]
    [Authorize(Roles = "Admin,OperationAdmin")]
    public async Task<ActionResult<CareRequestDto>> AssignCaregiver(int id, [FromBody] AssignCaregiverDto dto)
    {
        var request = await _careRequestService.AssignCaregiverAsync(id, dto.CaregiverId);
        if (request == null) return NotFound();
        return Ok(request);
    }

    // DELETE /api/carerequest/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,OperationAdmin,Family")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _careRequestService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    private int? GetFamilyId()
    {
        var familyIdClaim = User.FindFirst("FamilyId")?.Value;
        if (familyIdClaim != null && int.TryParse(familyIdClaim, out var id))
            return id;
        return null;
    }
}

public class UpdateRequestStatusDto
{
    public RequestStatus Status { get; set; }
    public string? AdminNotes { get; set; }
}

public class AssignCaregiverDto
{
    public int CaregiverId { get; set; }
}
