using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BE.Migrations
{
    /// <inheritdoc />
    public partial class AddCareRequestIdToSchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CareRequestId",
                table: "Schedules",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_CareRequestId",
                table: "Schedules",
                column: "CareRequestId");

            migrationBuilder.AddForeignKey(
                name: "FK_Schedules_CareRequests_CareRequestId",
                table: "Schedules",
                column: "CareRequestId",
                principalTable: "CareRequests",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Schedules_CareRequests_CareRequestId",
                table: "Schedules");

            migrationBuilder.DropIndex(
                name: "IX_Schedules_CareRequestId",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "CareRequestId",
                table: "Schedules");
        }
    }
}
