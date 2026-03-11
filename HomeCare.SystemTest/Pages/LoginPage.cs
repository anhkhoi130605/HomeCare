using OpenQA.Selenium;

namespace HomeCare.SystemTest.Pages
{
    public class LoginPage
    {
        private IWebDriver driver;

        public LoginPage(IWebDriver driver)
        {
            this.driver = driver;
        }

        private By emailInput = By.Id("email");
        private By passwordInput = By.Id("password");
        private By loginButton = By.XPath("//button[@type='submit']");

        public void Open()
        {
            driver.Navigate().GoToUrl("http://localhost:8081/login");
        }

        public void Login(string email, string password)
        {
            driver.FindElement(emailInput).Clear();
            driver.FindElement(emailInput).SendKeys(email);

            driver.FindElement(passwordInput).Clear();
            driver.FindElement(passwordInput).SendKeys(password);

            driver.FindElement(loginButton).Click();
        }
    }
}