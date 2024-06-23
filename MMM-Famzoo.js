Module.register("MMM-Famzoo", {
  defaults: {
    title: 'Famzoo Balances',
    loginPage: 'https://app.famzoo.com/ords/f?p=197:101:0:::::',
    showLastUpdated: true,
    columnOrder: ['balance', 'account'],
    updatePeriod: 1000 * 60 * 1,
    family: undefined,
    username: undefined,
    password: undefined,
  },
  start: function () {
    this.resetBalances();
  },
  resetBalances: function () {
    this.famzooData = {
      accountNames: [],
      balances: []
    };
  },
  isConfigured: function () {
    return this.config.family && this.config.username && this.config.password;
  },
  updateData: function() {
    this.resetBalances();
    const webview = document.getElementById('fz-webview');
    webview.executeJavaScript(`function login(){
        document.getElementById('fzi_signin_famname').value = '${this.config.family}';
        document.getElementById('fzi_signin_memname').value = '${this.config.username}';
        document.getElementById('fzi_signin_password').value = '${this.config.password}';
        document.getElementById('fzi_signin_bsignin').click();
      } login();`);
    setTimeout(() => {
      webview.executeJavaScript(`function mobileUi(){
        [].slice.call(document.getElementById('fzcntlbar').children).filter(el => el.text === 'MOBILE UI')[0].click();
      } mobileUi();`)
    }, 4000);
    setTimeout(() => {
      webview.executeJavaScript(`function getAccounts() {
        return new Promise((resolve, reject) => { resolve([].slice.call(document.getElementsByClassName('name')).map(el => el.innerText)) });
      } getAccounts();`).then(arr => {
        this.famzooData.accountNames = arr.map(el => el.replace(/\s*(\[\*+\d+\]|\[IOU\])$/, ""));
      }).catch(e => {
        Log.error(e);
        this.famzooData.accountNames = [];
      })
    }, 5000);
    setTimeout(() => {
      webview.executeJavaScript(`function getAccounts() {
        return new Promise((resolve, reject) => { resolve([].slice.call(document.getElementsByClassName('credit')).filter(el => el.tagName==='SPAN').map(el => el.innerText) ) });
      } getAccounts();`).then(arr => {
        this.famzooData.balances = arr;
      }).catch(e => {
        Log.error(e);
        this.famzooData.balances = [];
      });
    }, 5000);
    setTimeout(() => { this.updateDom() }, 5250);
  },
  getDom: function () {
    if(!(config.electronOptions && config.electronOptions.webPreferences && config.electronOptions.webPreferences.webviewTag)){
      const error = document.createElement('div');
      error.innerText = "See documentation, add 'electronOptions'";
      error.className = 'fz-error';
      return error;
    }
    if (!this.isConfigured()) {
      const error = document.createElement('div');
      error.innerText = 'Set family, username, and password in config.js';
      error.className = 'fz-error';
      return error;
    }
    const element = document.createElement('div');
    const webview = document.createElement('webview');
    webview.id = 'fz-webview';
    webview.className = 'fz-webview';
    webview.setAttribute('src', this.config.loginPage);
    setTimeout(() => { this.updateData(this.config) }, this.runOnce ? this.config.updatePeriod : 3000);
    this.runOnce = true;
    element.appendChild(webview);

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
        this.config.columnOrder.forEach((col, j) => {
          switch (col) {
            case 'account':
              account.className = `fz-show-${j}`;
              row.appendChild(account);
              break;
            case 'balance':
              balance.className = `fz-show-${j}`;
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
})
