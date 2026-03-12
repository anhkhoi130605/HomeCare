using BE.DTOs.Admin;
using BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,OperationAdmin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    /// <summary>
    /// Get dashboard statistics
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        try
        {
            var stats = await _adminService.GetDashboardStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get recent activities
    /// </summary>
    [HttpGet("activities")]
    public async Task<ActionResult<List<RecentActivityDto>>> GetRecentActivities([FromQuery] int count = 10)
    {
        try
        {
            var activities = await _adminService.GetRecentActivitiesAsync(count);
            return Ok(activities);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get pending requests/contracts awaiting approval
    /// </summary>
    [HttpGet("pending-requests")]
    public async Task<ActionResult<List<PendingRequestDto>>> GetPendingRequests()
    {
        try
        {
            var requests = await _adminService.GetPendingRequestsAsync();
            return Ok(requests);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get all users
    /// </summary>
    [HttpGet("users")]
    public async Task<ActionResult<List<UserDto>>> GetAllUsers([FromQuery] string? role = null)
    {
        try
        {
            var users = await _adminService.GetAllUsersAsync(role);
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get specific user
    /// </summary>
    [HttpGet("users/{userId}")]
    public async Task<ActionResult<UserDto>> GetUser(int userId)
    {
        try
        {
            var user = await _adminService.GetUserAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });
            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Activate/Deactivate user
    /// </summary>
    [HttpPatch("users/{userId}/status")]
    public async Task<ActionResult> ToggleUserStatus(int userId, [FromBody] bool isActive)
    {
        try
        {
            var result = await _adminService.ToggleUserStatusAsync(userId, isActive);
            if (!result)
                return NotFound(new { message = "User not found" });
            return Ok(new { message = isActive ? "User activated" : "User deactivated" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    [HttpPost("users")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserAdminDto dto)
    {
        try
        {
            var user = await _adminService.CreateUserAsync(dto);
            return CreatedAtAction(nameof(GetUser), new { userId = user.Id }, user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Toggle user status (block/unblock)
    /// </summary>
    [HttpPut("users/{userId}/status")]
    public async Task<ActionResult> ToggleUserStatus(int userId, [FromBody] ToggleStatusDto dto)
    {
        try
        {
            var result = await _adminService.ToggleUserStatusAsync(userId, dto.IsActive);
            if (!result)
                return NotFound(new { message = "User not found" });
            return Ok(new { message = "User status updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete user
    /// </summary>
    [HttpDelete("users/{userId}")]
    public async Task<ActionResult> DeleteUser(int userId)
    {
        try
        {
            var result = await _adminService.DeleteUserAsync(userId);
            if (!result)
                return NotFound(new { message = "User not found" });
            return Ok(new { message = "User deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    public class ToggleStatusDto
    {
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// Get all patients
    /// </summary>
    [HttpGet("patients")]
    public async Task<ActionResult> GetAllPatients()
    {
        try
        {
            var patients = await _adminService.GetAllPatientsAsync();
            return Ok(patients);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Create a new patient
    /// </summary>
    [HttpPost("patients")]
    public async Task<ActionResult<AdminPatientDto>> CreatePatient([FromBody] CreatePatientAdminDto dto)
    {
        try
        {
            var patient = await _adminService.CreatePatientAsync(dto);
            return CreatedAtAction(nameof(GetAllPatients), new { id = patient.Id }, patient);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update a patient
    /// </summary>
    [HttpPut("patients/{patientId}")]
    public async Task<ActionResult<AdminPatientDto>> UpdatePatient(int patientId, [FromBody] UpdatePatientAdminDto dto)
    {
        try
        {
            var patient = await _adminService.UpdatePatientAsync(patientId, dto);
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
    /// Delete a patient
    /// </summary>
    [HttpDelete("patients/{patientId}")]
    public async Task<ActionResult> DeletePatient(int patientId)
    {
        try
        {
            var result = await _adminService.DeletePatientAsync(patientId);
            if (!result)
                return NotFound(new { message = "Patient not found" });
            return Ok(new { message = "Patient deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get all caregivers
    /// </summary>
    [HttpGet("caregivers")]
    public async Task<ActionResult> GetAllCaregivers()
    {
        try
        {
            var caregivers = await _adminService.GetAllCaregiversAsync();
            return Ok(caregivers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get all schedules
    /// </summary>
    [HttpGet("schedules")]
    public async Task<ActionResult> GetAllSchedules([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        try
        {
            var schedules = await _adminService.GetAllSchedulesAsync(from, to);
            return Ok(schedules);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Create a new caregiver
    /// </summary>
    [HttpPost("caregivers")]
    public async Task<ActionResult<AdminCaregiverDto>> CreateCaregiver([FromBody] CreateCaregiverDto dto)
    {
        try
        {
            var caregiver = await _adminService.CreateCaregiverAsync(dto);
            return CreatedAtAction(nameof(GetAllCaregivers), new { id = caregiver.Id }, caregiver);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update a caregiver
    /// </summary>
    [HttpPut("caregivers/{caregiverId}")]
    public async Task<ActionResult<AdminCaregiverDto>> UpdateCaregiver(int caregiverId, [FromBody] UpdateCaregiverAdminDto dto)
    {
        try
        {
            var caregiver = await _adminService.UpdateCaregiverAsync(caregiverId, dto);
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
    /// Delete (deactivate) a caregiver
    /// </summary>
    [HttpDelete("caregivers/{caregiverId}")]
    public async Task<ActionResult> DeleteCaregiver(int caregiverId)
    {
        try
        {
            var result = await _adminService.DeleteCaregiverAsync(caregiverId);
            if (!result)
                return NotFound(new { message = "Caregiver not found" });
            return Ok(new { message = "Caregiver deactivated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
