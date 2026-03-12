using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BE.Migrations
{
    /// <inheritdoc />
    public partial class AddCheckInOut_Fix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CheckInTime",
                table: "CareLogs",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CheckOutTime",
                table: "CareLogs",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CheckInTime",
                table: "CareLogs");

            migrationBuilder.DropColumn(
                name: "CheckOutTime",
                table: "CareLogs");
        }
    }
}
