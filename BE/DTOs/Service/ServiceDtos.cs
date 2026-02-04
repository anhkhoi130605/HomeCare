namespace BE.DTOs.Service;

public class ServicePackageDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal PricePerHour { get; set; }
    public decimal? ContractPricePerMonth { get; set; }
    public string Type { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateServicePackageDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal PricePerHour { get; set; }
    public decimal? ContractPricePerMonth { get; set; }
    public string Type { get; set; } = "Basic"; // Basic, Premium, Specialized
}

public class UpdateServicePackageDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal? PricePerHour { get; set; }
    public decimal? ContractPricePerMonth { get; set; }
    public string? Type { get; set; }
    public bool? IsActive { get; set; }
}
