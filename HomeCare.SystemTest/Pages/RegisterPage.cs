using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;

namespace HomeCare.SystemTest.Pages
{
    public class RegisterPage
    {
        private IWebDriver driver;
        private WebDriverWait wait;

        public RegisterPage(IWebDriver driver)
        {
            this.driver = driver;
            wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
        }

        private By fullNameInput = By.Id("fullName");
        private By emailInput = By.Id("email");
        private By passwordInput = By.Id("password");
        private By agreeCheckbox = By.Id("terms"); // button role=checkbox
        private By registerButton = By.XPath("//button[@type='submit']");

        public void Open()
        {
            driver.Navigate().GoToUrl("http://localhost:8081/register");
        }

        public void Register(string fullName, string email, string password)
        {
            wait.Until(d => d.FindElement(fullNameInput)).SendKeys(fullName);
            driver.FindElement(emailInput).SendKeys(email);
            driver.FindElement(passwordInput).SendKeys(password);

            // Click agree terms
            wait.Until(d => d.FindElement(agreeCheckbox)).Click();

            // Click register
            driver.FindElement(registerButton).Click();
        }
    }
}