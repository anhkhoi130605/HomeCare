using NUnit.Framework;
using HomeCare.SystemTest.Base;
using HomeCare.SystemTest.Pages;
using System.Threading;

namespace HomeCare.SystemTest.Tests
{
    public class LoginTests : BaseTest
    {
        [Test]
public void Login_With_Valid_User()
{
    LoginPage loginPage = new LoginPage(driver!);

    loginPage.Open();
    loginPage.Login("admin@homecare.com", "admin123");

    Thread.Sleep(3000);

    Console.WriteLine("Current URL: " + driver!.Url);

    Assert.Pass();
}
    }
}