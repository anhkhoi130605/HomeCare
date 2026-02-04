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
    Pending,
    Active,
    Completed,
    Cancelled
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
