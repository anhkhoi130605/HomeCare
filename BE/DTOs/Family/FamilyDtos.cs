namespace BE.DTOs.Family;

// Family Profile DTOs
public class FamilyProfileDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string FullName { get; set; } = null!;
    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }
    public int PatientsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateFamilyDto
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }
}

// Patient DTOs
public class PatientDto
{
    public int Id { get; set; }
    public int FamilyId { get; set; }
    public string FullName { get; set; } = null!;
    public DateTime DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? MedicalHistory { get; set; }
    public string? Allergies { get; set; }
    public string? CurrentCondition { get; set; }
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePatientDto
{
    public string FullName { get; set; } = null!;
    public DateTime DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? MedicalHistory { get; set; }
    public string? Allergies { get; set; }
    public string? CurrentCondition { get; set; }
    public string? Address { get; set; }
}

public class UpdatePatientDto
{
    public string? FullName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? MedicalHistory { get; set; }
    public string? Allergies { get; set; }
    public string? CurrentCondition { get; set; }
    public string? Address { get; set; }
}
