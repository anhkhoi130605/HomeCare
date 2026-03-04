using BE.DTOs.Contract;
using BE.Models;
using BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BE.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ContractController : ControllerBase
{
    private readonly IContractService _contractService;

    public ContractController(IContractService contractService)
    {
        _contractService = contractService;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateContract([FromBody] CreateContractDto dto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _contractService.CreateContractAsync(userId, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("my-contracts")]
    public async Task<IActionResult> GetMyContracts()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _contractService.GetMyContractsAsync(userId);
        return Ok(result);
    }

    [Authorize(Roles = "Admin,OperationAdmin")]
    [HttpGet]
    public async Task<IActionResult> GetAllContracts()
    {
        var result = await _contractService.GetAllContractsAsync();
        return Ok(result);
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetContractById(int id)
    {
        var result = await _contractService.GetContractByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [Authorize(Roles = "Admin,OperationAdmin")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateContractDto dto)
    {
        if (dto.Status == null) return BadRequest("Status is required");
        
        var result = await _contractService.UpdateContractStatusAsync(id, dto.Status.Value);
        if (!result) return NotFound();
        
        return Ok(new { message = "Status updated" });
    }
}
