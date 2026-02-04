using BE.DTOs.Service;
using BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceController : ControllerBase
{
    private readonly IServicePackageService _servicePackageService;

    public ServiceController(IServicePackageService servicePackageService)
    {
        _servicePackageService = servicePackageService;
    }

    /// <summary>
    /// Get all service packages (public - for families to view)
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<ServicePackageDto>>> GetAll([FromQuery] bool? activeOnly = true)
    {
        try
        {
            var services = await _servicePackageService.GetAllAsync(activeOnly);
            return Ok(services);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get specific service package
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ServicePackageDto>> GetById(int id)
    {
        try
        {
            var service = await _servicePackageService.GetByIdAsync(id);
            if (service == null)
                return NotFound(new { message = "Service package not found" });
            return Ok(service);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Create new service package (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ServicePackageDto>> Create([FromBody] CreateServicePackageDto dto)
    {
        try
        {
            var service = await _servicePackageService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = service.Id }, service);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update service package (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ServicePackageDto>> Update(int id, [FromBody] UpdateServicePackageDto dto)
    {
        try
        {
            var service = await _servicePackageService.UpdateAsync(id, dto);
            return Ok(service);
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
    /// Delete (deactivate) service package (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            var result = await _servicePackageService.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = "Service package not found" });
            return Ok(new { message = "Service package deactivated" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
