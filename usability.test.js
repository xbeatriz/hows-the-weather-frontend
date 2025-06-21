import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

(async function loginSignupLogoutTest() {
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options())
    .build();

  try {
    await driver.get('http://localhost:5173');

    // 1. Abrir página de registo
    await driver.wait(until.elementLocated(By.linkText('Sign Up')), 5000);
    const createAccountLink = await driver.findElement(By.linkText('Sign Up'));
    await createAccountLink.click();

    // 2. Preencher formulário de registo
    await driver.wait(until.elementLocated(By.id('name')), 5000);
    await driver.findElement(By.id('name')).sendKeys('John Doe');
    await driver.findElement(By.id('email')).sendKeys('johndoe@example.com');
    const locationSelect = await driver.findElement(By.id('location'));
    await locationSelect.click();
    const optionLisbon = await driver.findElement(By.css('#location option[value="Lisboa"]'));
    await optionLisbon.click();
    await driver.findElement(By.id('password')).sendKeys('senha1234');
    await driver.findElement(By.id('confirmPassword')).sendKeys('senha1234');

    // 3. Clicar no botão SIGN UP
    const signUpButton = await driver.findElement(By.xpath("//button[contains(text(),'SIGN UP')]"));
    await signUpButton.click();

    // 4. Esperar e aceitar alerta de sucesso
    await driver.wait(until.alertIsPresent(), 5000);
    const alert = await driver.switchTo().alert();
    console.log('Alerta:', await alert.getText());
    await alert.accept();

    // 5. Navegar para página de login
    await driver.wait(until.elementLocated(By.linkText('Login')), 5000);
    const loginLink = await driver.findElement(By.linkText('Login'));
    await loginLink.click();

    // 6. Preencher formulário de login
    await driver.wait(until.elementLocated(By.id('email')), 5000);
    await driver.findElement(By.id('email')).sendKeys('johndoe@example.com');
    await driver.findElement(By.id('password')).sendKeys('senha1234');

    // 7. Clicar no botão LOGIN
    const loginButton = await driver.findElement(By.xpath("//button[contains(text(),'LOGIN')]"));
    await loginButton.click();

    // 8. Esperar redirecionamento pós-login (exemplo para rota /home)
    await driver.wait(until.urlContains('/home'), 5000);
    console.log('Login realizado com sucesso!');

    // 9. Fazer logout
    // Supondo que exista um botão ou link com texto "Logout"
    await driver.wait(until.elementLocated(By.linkText('Logout')), 5000);
    const logoutButton = await driver.findElement(By.linkText('Logout'));
    await logoutButton.click();

    // 10. Confirmar que voltou para página inicial ou login
    await driver.wait(until.urlIs('http://localhost:5173/login'), 5000);
    console.log('Logout realizado com sucesso!');

  } catch (error) {
    console.error('Erro no teste:', error);
  } finally {
    await driver.quit();
  }
})();
