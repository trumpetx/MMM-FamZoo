Module.register("MMM-Famzoo", {
  defaults: {
    webdriver: 'chromium',
    title: 'Famzoo Balances',
    loginPage: 'https://app.famzoo.com/ords/f?p=197:101:0:::::',
    showLastUpdated: true,
    columnOrder: ['balance', 'account'],
    updatePeriod: 1000 * 60 * 60,
    family: undefined,
    username: undefined,
    password: undefined,
  },
  start: function () {
    this.famzooData = {
      accountNames: [],
      balances: []
    };
    if (this.isConfigured()) {
      this.sendSocketNotification("INIT", this.config);
    }
  },
  isConfigured: function () {
    return this.config.family && this.config.username && this.config.password;
  },
  getDom: function () {
    const element = document.createElement("div");
    element.className = "fz-container";
    if (!this.isConfigured()) {
      element.className += ' fz-error';
      element.innerText = 'Set family, username, and password in config.js';
      return element;
    }
    if (this.famzooData.error) {
      element.className += ' fz-error';
      element.innerText = this.famzooData.error;
      return element;
    }
    const title = document.createElement('h2');
    title.innerText = 'Loading...';
    title.className = 'fz-title';
    element.appendChild(title);
    if (this.famzooData.accountNames.length !== this.famzooData.balances.length) {
      Log.error('Unexpected data:', this.famzooData.accountNames, this.famzooData.balances);
      title.innerText = 'Error loading data: account names do not match balances';
    } else if (this.famzooData.accountNames.length > 0) {
      title.innerText = this.config.title;
      const table = document.createElement('table');
      table.className = 'fz-data';
      element.appendChild(table);
      for (let i = 0; i < this.famzooData.accountNames.length; i++) {
        const row = document.createElement('tr');
        row.className = 'fz-row';
        const account = document.createElement('td');
        account.innerText = this.famzooData.accountNames[i];
        const balance = document.createElement('td');
        balance.innerText = this.famzooData.balances[i];
        this.config.columnOrder.forEach((col, i) => {
          switch (col) {
            case 'account':
              account.className = `fz-show-${i}`;
              row.appendChild(account);
              break;
            case 'balance':
              balance.className = `fz-show-${i}`;
              row.appendChild(balance);
              break;
          }
        });
        element.appendChild(row);
      };
      if (this.config.showLastUpdated) {
        const lastUpdated = document.createElement("div");
        lastUpdated.innerText = `Last Updated: ${new Date().toLocaleString(config.locale)}`;
        lastUpdated.className = 'fz-last-updated';
        element.appendChild(lastUpdated);
      }
    }

    return element;
  },
  getStyles: function () {
    return ["MMM-Famzoo.css"];
  },
  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "BALANCES_REFRESHED":
      case "BALANCE_REFRESH_FAILED":
        this.famzooData = payload;
        this.updateDom();
        setTimeout(() => this.sendSocketNotification("REFRESH"), this.config.updatePeriod);
        break;
      default:
        Log.error(`Unknown notification: ${notification}`, payload);
    }
  }
})
