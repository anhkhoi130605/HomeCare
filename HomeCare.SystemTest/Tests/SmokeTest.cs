using NUnit.Framework;
using HomeCare.SystemTest.Base;

namespace HomeCare.SystemTest.Tests
{
    public class SmokeTest : BaseTest
    {
        [Test]
        public void Open_Google()
        {
            driver.Navigate().GoToUrl("https://google.com");
            Assert.That(driver.Title.Contains("Google"), Is.True);
        }
    }
}