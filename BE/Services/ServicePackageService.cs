using BE.Data;
using BE.DTOs.Service;
using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.Services;

public interface IServicePackageService
{
    Task<List<ServicePackageDto>> GetAllAsync(bool? activeOnly = true);
    Task<ServicePackageDto?> GetByIdAsync(int id);
    Task<ServicePackageDto> CreateAsync(CreateServicePackageDto dto);
    Task<ServicePackageDto> UpdateAsync(int id, UpdateServicePackageDto dto);
    Task<bool> DeleteAsync(int id);
}

public class ServicePackageService : IServicePackageService
{
    private readonly ApplicationDbContext _context;

    public ServicePackageService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ServicePackageDto>> GetAllAsync(bool? activeOnly = true)
    {
        var query = _context.Services.AsQueryable();

        if (activeOnly == true)
        {
            query = query.Where(s => s.IsActive);
        }

        var services = await query.OrderBy(s => s.PricePerHour).ToListAsync();

        return services.Select(s => MapToDto(s)).ToList();
    }

    public async Task<ServicePackageDto?> GetByIdAsync(int id)
    {
        var service = await _context.Services.FindAsync(id);
        return service == null ? null : MapToDto(service);
    }

    public async Task<ServicePackageDto> CreateAsync(CreateServicePackageDto dto)
    {
        var service = new Service
        {
            Name = dto.Name,
            Description = dto.Description,
            PricePerHour = dto.PricePerHour,
            ContractPricePerMonth = dto.ContractPricePerMonth,
            Type = Enum.Parse<ServiceType>(dto.Type),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Services.Add(service);
        await _context.SaveChangesAsync();

        return MapToDto(service);
    }

    public async Task<ServicePackageDto> UpdateAsync(int id, UpdateServicePackageDto dto)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null)
            throw new KeyNotFoundException("Service package not found");

        service.Name = dto.Name ?? service.Name;
        service.Description = dto.Description ?? service.Description;
        service.PricePerHour = dto.PricePerHour ?? service.PricePerHour;
        service.ContractPricePerMonth = dto.ContractPricePerMonth ?? service.ContractPricePerMonth;
        service.IsActive = dto.IsActive ?? service.IsActive;

        if (!string.IsNullOrEmpty(dto.Type))
        {
            service.Type = Enum.Parse<ServiceType>(dto.Type);
        }

        await _context.SaveChangesAsync();

        return MapToDto(service);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null) return false;

        // Soft delete
        service.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    private static ServicePackageDto MapToDto(Service s)
    {
        return new ServicePackageDto
        {
            Id = s.Id,
            Name = s.Name,
            Description = s.Description,
            PricePerHour = s.PricePerHour,
            ContractPricePerMonth = s.ContractPricePerMonth,
            Type = s.Type.ToString(),
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt
        };
    }
}
