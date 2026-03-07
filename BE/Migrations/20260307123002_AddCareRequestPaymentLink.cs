using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BE.Migrations
{
    /// <inheritdoc />
    public partial class AddCareRequestPaymentLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CareRequestId",
                table: "Payments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Duration",
                table: "CareRequests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CareRequestId",
                table: "Payments",
                column: "CareRequestId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_CareRequests_CareRequestId",
                table: "Payments",
                column: "CareRequestId",
                principalTable: "CareRequests",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_CareRequests_CareRequestId",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_CareRequestId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "CareRequestId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "CareRequests");
        }
    }
}
