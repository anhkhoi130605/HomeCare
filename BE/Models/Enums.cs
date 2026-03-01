namespace BE.Models;

public enum UserRole
{
    Admin,
    Caregiver,
    Family
}

public enum RequestStatus
{
    Pending,
    Approved,
    Rejected,
    Cancelled
}

public enum RequestType
{
    Flexible,
    Contract,
    OneTime
}

public enum ServiceType
{
    Basic,
    Premium,
    Specialized
}

public enum ContractStatus
{
    Pending,           // Just created, awaiting admin review
    Approved,          // Admin approved, awaiting payment
    Paid,              // User paid, awaiting start date or activation
    Active,            // Care is currently ongoing
    Completed,         // Care finished
    Cancelled,         // Care cancelled
    Rejected           // Admin rejected
}

public enum ScheduleStatus
{
    Scheduled,
    InProgress,
    Completed,
    Cancelled
}

public enum IncidentSeverity
{
    Low,
    Medium,
    High,
    Critical
}

public enum IncidentStatus
{
    Open,
    InProgress,
    Resolved
}

public enum PaymentStatus
{
    Pending,
    Completed,
    Failed,
    Refunded
}

public enum PaymentMethod
{
    VNPay,
    Cash,
    BankTransfer
}
