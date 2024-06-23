const NodeHelper = require("node_helper");
const Log = require("logger");
const { Capabilities, Builder, By, until } = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome');

async function getBalances(config, callback) {
  Log.debug(`WebDriver(${config.webdriver}) initializing`);
  let driver;
  try {
    const builder = new Builder().forBrowser(config.webdriver);
    if (/^chrom/.test(config.webdriver)) {
      builder.setChromeOptions(new chrome.Options()
        .addArguments('--headless')
        .windowSize({ width: 640, height: 480 })
      ).withCapabilities(Capabilities.chrome())
    }
    driver = await builder.build();
    Log.debug(`WebDriver(${config.webdriver}) initialized`);
    await driver.get(config.loginPage);
    Log.debug(`Page (${config.loginPage}) loaded`);
    await driver.findElement(By.id("fzi_signin_famname")).sendKeys(config.family);
    await driver.findElement(By.id("fzi_signin_memname")).sendKeys(config.username);
    await driver.findElement(By.id("fzi_signin_password")).sendKeys(config.password);
    await driver.findElement(By.id("fzi_signin_bsignin")).click();
    await driver.wait(until.titleIs("Account Summary - SECURE"), 4000);
    await driver.findElement(By.linkText("MOBILE UI")).click();
    await driver.wait(until.titleIs("ACCOUNTS - SECURE"), 4000);
    await driver.findElement(By.id("fzmbfooter2"));
    let accountNames = await driver.findElements(By.css("a .name"));
    accountNames = await Promise.all(accountNames.map(async we => we.getText()));
    accountNames = accountNames.map(t => t.replace(/\s*(\[\*+\d+\]|\[IOU\])$/, ""));
    let balances = await driver.findElements(By.css("a .credit span"));
    balances = await Promise.all(balances.map(async we => we.getText()));
    Log.info(`${balances.length} Famzoo balances fetched`);
    callback("BALANCES_REFRESHED", { accountNames, balances });
  } catch (error) {
    Log.error(error);
    callback("BALANCE_REFRESH_FAILED", { error });
  } finally {
    Log.debug("Driver Done");
    if (driver)
      await driver.quit();
  }
}

module.exports = NodeHelper.create({
  start() { },
  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "INIT":
        this.config = payload;
      case "REFRESH":
        getBalances(this.config, (r, p) => this.sendSocketNotification(r, p));
        break;
      default:
        Log.error("Unknown notification received", notification);
    }
  },
});
