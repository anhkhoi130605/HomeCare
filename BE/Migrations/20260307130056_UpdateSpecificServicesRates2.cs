using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BE.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSpecificServicesRates2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE Services SET PricePerHour = 180000 WHERE Name = 'Basic Home Care';");
            migrationBuilder.Sql("UPDATE Services SET PricePerHour = 320000 WHERE Name = 'Premium Home Care';");
            migrationBuilder.Sql("UPDATE Services SET PricePerHour = 550000 WHERE Name = 'Post-Surgery Recovery';");
            migrationBuilder.Sql("UPDATE Services SET PricePerHour = 650000 WHERE Name = 'Dementia Care';");
            migrationBuilder.Sql("UPDATE Services SET PricePerHour = 220000 WHERE Name = 'Social Enrichment';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Optional: Revert to /1000 if needed, or back to specific old values
            migrationBuilder.Sql("UPDATE Services SET PricePerHour = 18000 WHERE Name = 'Basic Home Care';");
            migrationBuilder.Sql("UPDATE Services SET PricePerHour = 32000 WHERE Name = 'Premium Home Care';");
            migrationBuilder.Sql("UPDATE Services SET PricePerHour = 55000 WHERE Name = 'Post-Surgery Recovery';");
            migrationBuilder.Sql("UPDATE Services SET PricePerHour = 65000 WHERE Name = 'Dementia Care';");
            migrationBuilder.Sql("UPDATE Services SET PricePerHour = 22000 WHERE Name = 'Social Enrichment';");
        }
    }
}
