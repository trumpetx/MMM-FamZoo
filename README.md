## Overview
This project is a [Magic Mirror²](https://github.com/MagicMirrorOrg/MagicMirror) module which enables your Magic Mirror to display [FamZoo](https://famzoo.com) account balances (a paid financial education service).  Because [FamZoo](https://famzoo.com) does not provide a public API, this module uses a hidden WebView in the [Magic Mirror²](https://github.com/MagicMirrorOrg/MagicMirror) [Electron](https://github.com/electron/electron) framework to scrape the data from the FamZoo website by logging in with your family name, username & password.  There are no 3rd party dependencies.

![FamZoo Balances](famzoo_balances_example.png)

## Installation
Clone the git repository
```
cd MagicMirror/modules
git clone https://github.com/trumpetx/MMM-FamZoo.git
```
Modify `config/config.js`
```
let config = {

  ...

  modules: [

    ...

    // Add the MMM-FamZoo definition
    {
      module: "MMM-FamZoo",
      position: "top_left",
      config: {
        family: 'Smith',
        username: 'Sue',
        password: 'bL0wF!$h1',
      }
    },
  ],

  ...

  // Add/modify the electronOptions
  electronOptions: {
    webPreferences: {
      webviewTag: true,
    },
  }
}
```

## Additional Configuration
In addition to the required family/username/password configuration, there are some optional configuraions you can use
```
{
  // Required
  family: 'Smith',
  username: 'Sue',
  password: 'bL0wF!$h1',

  // There is no i18n yet (or likely, ever)
  title: 'FamZoo Balances',

  // This should likely never be changed unless famzoo.com updates something later
  loginPage: 'https://famzoo.com/signin',

  // Set to false to avoid displaying the last updated timestamp
  showLastUpdated: true,

  // ['account', 'balance'] to see the account balance on the right side of the table instead
  columnOrder: ['balance', 'account'],

  // Every hour by default
  updatePeriod: 1000 * 60 * 60,

  // Increase this value if you're running on slow hardware (like an RPi 2)
  sleepDelay: 3000,

  // Removing any accounts that you do not want to display balances for
  excludeAccounts: ["Dad"],
}
```

## Disclaimer
This project is not associated with [FamZoo](https://famzoo.com) in any way.  We're just fans of the service and highly recommend it to anyone with kids who get allowance.
