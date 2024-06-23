## Overview
This project is a [Magic Mirror²](https://github.com/MagicMirrorOrg/MagicMirror) module which enables your Magic Mirror to display Famzoo account balances (a paid financial education service).  Because Famzoo does not provide a public API, this module uses [Selenium](https://github.com/SeleniumHQ/selenium/tree/trunk/javascript/node/selenium-webdriver#readme) to scrape the data from the Famzoo website by logging in with your family name, username & password.  It does this in the background (headless) using Chromium by default.

![Famzoo Balances](image.png)

## Installation

```
cd MagicMirror/modules
git clone https://github.com/trumpetx/MMM-Famzoo.git
cd MMM-Famzoo
npm install
```
Add the following block to the modules section in `config/config.js`
```
modules: [
  {
    module: "MMM-Famzoo",
    position: "top_left",
    config: {
      family: 'Smith',
      username: 'Sue',
      password: 'bL0wF!$h1',
    }
  },
]
```

## Additioanl Configuration

In addition to the required family/username/password configuration, there are some optional configuraions you can use
```json
{
  // Required
  family: 'Smith',
  username: 'Sue',
  password: 'bL0wF!$h1',

  // Only 'chromium' (default) and 'chrome' have been tested; firefox or edge may work, but they probably need additional configuration
  webdriver: 'chromium',

  // There is no i18n yet (or likely, ever)
  title: 'Famzoo Balances',

  // This should likely never be changed unless famzoo.com updates something later
  loginPage: 'https://app.famzoo.com/ords/f?p=197:101:0:::::',

  // Set to false to avoid displaying the last updated timestamp
  showLastUpdated: true,

  // ['account', 'balance'] to see the account balance on the right side of the table instead
  columnOrder: ['balance', 'account'],

  // Every hour by default
  updatePeriod: 1000 * 60 * 60,
}
```


## Disclaimer
This project is not associated with [Famzoo](https://famzoo.com) in any way.  We're just fans of the service and highly recommend it to anyone with kids who get allowance.
