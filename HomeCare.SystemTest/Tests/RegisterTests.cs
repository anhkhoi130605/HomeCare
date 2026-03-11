using NUnit.Framework;
using HomeCare.SystemTest.Base;
using HomeCare.SystemTest.Pages;
using System;

namespace HomeCare.SystemTest.Tests
{
    public class RegisterTests : BaseTest
    {
        [Test]
        public void Register_With_Valid_Data()
        {
            RegisterPage registerPage = new RegisterPage(driver!);

            registerPage.Open();

            string email = "test" + DateTime.Now.Ticks + "@gmail.com";

            registerPage.Register(
                "Test User",
                email,
                "123456"
            );

            // Đợi redirect khỏi trang register
            System.Threading.Thread.Sleep(3000);

            Console.WriteLine("Current URL: " + driver!.Url);

            Assert.That(driver!.Url, Does.Not.Contain("/register"));
        }
    }
}