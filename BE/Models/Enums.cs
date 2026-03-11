namespace BE.Models;

public enum UserRole
{
    Admin,
    Caregiver,
    Family,
    OperationAdmin
}

public enum RequestStatus
{
    Pending,
    AwaitingPayment,
    Approved,
    Paid,
    Assigned,
    Completed,
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
    Cancelled,
    Failed
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
    Success,
    Failed,
    Refunded
}

public enum PaymentMethod
{
    VNPay,
    Cash,
    BankTransfer
}
