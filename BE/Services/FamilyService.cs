using BE.Data;
using BE.DTOs.Family;
using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.Services;

public interface IFamilyService
{
    Task<FamilyProfileDto?> GetProfileAsync(int userId);
    Task<FamilyProfileDto> UpdateProfileAsync(int userId, UpdateFamilyDto dto);
    Task<List<PatientDto>> GetPatientsAsync(int familyId);
    Task<PatientDto?> GetPatientAsync(int familyId, int patientId);
    Task<PatientDto> AddPatientAsync(int familyId, CreatePatientDto dto);
    Task<PatientDto> UpdatePatientAsync(int familyId, int patientId, UpdatePatientDto dto);
    Task<bool> DeletePatientAsync(int familyId, int patientId);
}

public class FamilyService : IFamilyService
{
    private readonly ApplicationDbContext _context;

    public FamilyService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<FamilyProfileDto?> GetProfileAsync(int userId)
    {
        var family = await _context.Families
            .Include(f => f.User)
            .Include(f => f.Patients)
            .FirstOrDefaultAsync(f => f.UserId == userId);

        if (family == null) return null;

        return new FamilyProfileDto
        {
            Id = family.Id,
            UserId = family.UserId,
            Email = family.User.Email,
            Phone = family.User.Phone,
            FullName = family.FullName,
            Address = family.Address,
            EmergencyContact = family.EmergencyContact,
            PatientsCount = family.Patients?.Count ?? 0,
            CreatedAt = family.CreatedAt
        };
    }

    public async Task<FamilyProfileDto> UpdateProfileAsync(int userId, UpdateFamilyDto dto)
    {
        var family = await _context.Families
            .Include(f => f.User)
            .FirstOrDefaultAsync(f => f.UserId == userId);

        if (family == null)
            throw new KeyNotFoundException("Family profile not found");

        family.FullName = dto.FullName ?? family.FullName;
        family.Address = dto.Address ?? family.Address;
        family.EmergencyContact = dto.EmergencyContact ?? family.EmergencyContact;

        if (!string.IsNullOrEmpty(dto.Phone))
        {
            family.User.Phone = dto.Phone;
        }

        await _context.SaveChangesAsync();

        return (await GetProfileAsync(userId))!;
    }

    public async Task<List<PatientDto>> GetPatientsAsync(int familyId)
    {
        var patients = await _context.Patients
            .Where(p => p.FamilyId == familyId)
            .ToListAsync();

        return patients.Select(p => MapToPatientDto(p)).ToList();
    }

    public async Task<PatientDto?> GetPatientAsync(int familyId, int patientId)
    {
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == patientId && p.FamilyId == familyId);

        return patient == null ? null : MapToPatientDto(patient);
    }

    public async Task<PatientDto> AddPatientAsync(int familyId, CreatePatientDto dto)
    {
        var patient = new Patient
        {
            FamilyId = familyId,
            FullName = dto.FullName,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            MedicalHistory = dto.MedicalHistory,
            Allergies = dto.Allergies,
            CurrentCondition = dto.CurrentCondition,
            Address = dto.Address,
            CreatedAt = DateTime.UtcNow
        };

        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();

        return MapToPatientDto(patient);
    }

    public async Task<PatientDto> UpdatePatientAsync(int familyId, int patientId, UpdatePatientDto dto)
    {
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == patientId && p.FamilyId == familyId);

        if (patient == null)
            throw new KeyNotFoundException("Patient not found");

        patient.FullName = dto.FullName ?? patient.FullName;
        patient.DateOfBirth = dto.DateOfBirth ?? patient.DateOfBirth;
        patient.Gender = dto.Gender ?? patient.Gender;
        patient.MedicalHistory = dto.MedicalHistory ?? patient.MedicalHistory;
        patient.Allergies = dto.Allergies ?? patient.Allergies;
        patient.CurrentCondition = dto.CurrentCondition ?? patient.CurrentCondition;
        patient.Address = dto.Address ?? patient.Address;

        await _context.SaveChangesAsync();

        return MapToPatientDto(patient);
    }

    public async Task<bool> DeletePatientAsync(int familyId, int patientId)
    {
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == patientId && p.FamilyId == familyId);

        if (patient == null) return false;

        _context.Patients.Remove(patient);
        await _context.SaveChangesAsync();
        return true;
    }

    private static PatientDto MapToPatientDto(Patient patient)
    {
        return new PatientDto
        {
            Id = patient.Id,
            FamilyId = patient.FamilyId,
            FullName = patient.FullName,
            DateOfBirth = patient.DateOfBirth,
            Gender = patient.Gender,
            MedicalHistory = patient.MedicalHistory,
            Allergies = patient.Allergies,
            CurrentCondition = patient.CurrentCondition,
            Address = patient.Address,
            CreatedAt = patient.CreatedAt
        };
    }
}
