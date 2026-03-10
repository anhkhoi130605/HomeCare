using Microsoft.EntityFrameworkCore;
using BE.Models;

namespace BE.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Family> Families => Set<Family>();
    public DbSet<Caregiver> Caregivers => Set<Caregiver>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<Schedule> Schedules => Set<Schedule>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<CareRequest> CareRequests => Set<CareRequest>();
    public DbSet<CareLog> CareLogs => Set<CareLog>();
    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();
    public DbSet<HealthReport> HealthReports => Set<HealthReport>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ... existing user config ...
        
        // Notifications
        modelBuilder.Entity<Notification>(entity =>
        {
             entity.HasOne(n => n.User)
                 .WithMany()
                 .HasForeignKey(n => n.UserId)
                 .OnDelete(DeleteBehavior.Cascade);
        });
        
        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Role).HasConversion<string>();
        });

        // Family - User relationship (1:1)
        modelBuilder.Entity<Family>()
            .HasOne(f => f.User)
            .WithOne(u => u.Family)
            .HasForeignKey<Family>(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Caregiver - User relationship (1:1)
        modelBuilder.Entity<Caregiver>()
            .HasOne(c => c.User)
            .WithOne(u => u.Caregiver)
            .HasForeignKey<Caregiver>(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Patient - Family relationship
        modelBuilder.Entity<Patient>()
            .HasOne(p => p.Family)
            .WithMany(f => f.Patients)
            .HasForeignKey(p => p.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        // Schedule relationships
        modelBuilder.Entity<Schedule>(entity =>
        {
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(s => s.Patient)
                .WithMany(p => p.Schedules)
                .HasForeignKey(s => s.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(s => s.Caregiver)
                .WithMany(c => c.Schedules)
                .HasForeignKey(s => s.CaregiverId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(s => s.Contract)
                .WithMany(c => c.Schedules)
                .HasForeignKey(s => s.ContractId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Contract relationships
        modelBuilder.Entity<Contract>(entity =>
        {
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(c => c.Family)
                .WithMany()
                .HasForeignKey(c => c.FamilyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.Patient)
                .WithMany()
                .HasForeignKey(c => c.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.AssignedCaregiver)
                .WithMany()
                .HasForeignKey(c => c.AssignedCaregiverId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Payment relationships
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.Method).HasConversion<string>();

            entity.HasOne(p => p.Family)
                .WithMany()
                .HasForeignKey(p => p.FamilyId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Service configuration
        modelBuilder.Entity<Service>(entity =>
        {
            entity.Property(e => e.Type).HasConversion<string>();
        });

        // CareRequest relationships
        modelBuilder.Entity<CareRequest>(entity =>
        {
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(c => c.Family)
                .WithMany()
                .HasForeignKey(c => c.FamilyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.Patient)
                .WithMany()
                .HasForeignKey(c => c.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.Service)
                .WithMany()
                .HasForeignKey(c => c.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.AssignedCaregiver)
                .WithMany()
                .HasForeignKey(c => c.AssignedCaregiverId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // CareLog relationships
        modelBuilder.Entity<CareLog>(entity =>
        {
            entity.HasOne(c => c.Schedule)
                .WithMany()
                .HasForeignKey(c => c.ScheduleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.Caregiver)
                .WithMany()
                .HasForeignKey(c => c.CaregiverId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.Patient)
                .WithMany()
                .HasForeignKey(c => c.PatientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Incident relationships
        modelBuilder.Entity<Incident>(entity =>
        {
            entity.Property(e => e.Severity).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(i => i.Schedule)
                .WithMany()
                .HasForeignKey(i => i.ScheduleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(i => i.Caregiver)
                .WithMany()
                .HasForeignKey(i => i.CaregiverId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(i => i.Patient)
                .WithMany()
                .HasForeignKey(i => i.PatientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Feedback relationships
        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasOne(f => f.Family)
                .WithMany()
                .HasForeignKey(f => f.FamilyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(f => f.Caregiver)
                .WithMany()
                .HasForeignKey(f => f.CaregiverId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(f => f.Contract)
                .WithMany()
                .HasForeignKey(f => f.ContractId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(f => f.Schedule)
                .WithMany()
                .HasForeignKey(f => f.ScheduleId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // HealthReport relationships
        modelBuilder.Entity<HealthReport>(entity =>
        {
            entity.HasOne(h => h.Patient)
                .WithMany()
                .HasForeignKey(h => h.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(h => h.Caregiver)
                .WithMany()
                .HasForeignKey(h => h.CaregiverId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Seed initial services
        modelBuilder.Entity<Service>().HasData(
            new Service
            {
                Id = 1,
                Name = "Basic Home Care",
                Category = "Daily Care",
                Description = "Essential daily care including medication reminders, meal assistance, and basic health monitoring.",
                PricePerHour = 150000,
                ContractPricePerMonth = 12000000,
                Type = ServiceType.Basic,
                IsActive = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Service
            {
                Id = 2,
                Name = "Premium Home Care",
                Category = "Daily Care",
                Description = "Comprehensive care with specialized nursing, physical therapy assistance, and 24/7 monitoring.",
                PricePerHour = 250000,
                ContractPricePerMonth = 20000000,
                Type = ServiceType.Premium,
                IsActive = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Service
            {
                Id = 3,
                Name = "Specialized Care",
                Category = "Specialized Medical",
                Description = "Expert care for post-surgery recovery, chronic conditions, or specialized medical needs.",
                PricePerHour = 350000,
                ContractPricePerMonth = 28000000,
                Type = ServiceType.Specialized,
                IsActive = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
