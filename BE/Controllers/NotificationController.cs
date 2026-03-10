
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BE.DTOs;
using BE.Services.Interfaces;
using System.Security.Claims;

namespace BE.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> GetMyNotifications()
    {
        var userId = GetUserId();
        var notifications = await _notificationService.GetMyNotificationsAsync(userId);
        return Ok(notifications);
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetUserId();
        var success = await _notificationService.MarkAsReadAsync(id, userId);
        if (!success) return NotFound();
        return Ok();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetUserId();
        await _notificationService.MarkAllAsReadAsync(userId);
        return Ok();
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirst("userId")!.Value);
    }
}
