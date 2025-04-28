
const puppeteer = require('puppeteer');
// const users = require('./users');

class UserRegistrar {
  constructor(users) {
    this.users = users;
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({ headless: false }); // Abre o navegador visível
    this.page = await this.browser.newPage();
  }

  async login(url, username, password) {
    console.log('Realizando login...');
    await this.page.goto(url);

    await this.page.type('#Input_UserName', username); // ajuste o seletor
    await this.page.type('#Input_Password', password); // ajuste o seletor

    await this.page.click('#account > div.text-center > button'); // ajuste o seletor
    await this.page.waitForNavigation();

    console.log('Login realizado com sucesso!');
  }

  async navigateToRegistrationPage(url) {
    console.log('Navegando para página de cadastro...');
    await this.page.goto(url);
  }

  async registerUser(user) {
    console.log(`Cadastrando usuário: ${user.name}`);

    await this.page.click('#botao-cadastrar'); // botão de abrir modal
    await this.page.waitForSelector('#modal-cadastro');

    await this.page.type('#input-nome', user.name);
    await this.page.type('#input-email', user.email);
    await this.page.type('#input-senha', user.password);

    await this.page.click('#botao-salvar');

    await this.page.waitForTimeout(3000); // Espera o cadastro ser processado

    console.log(`Usuário ${user.name} cadastrado com sucesso!`);
  }

  async registerAllUsers() {
    for (const user of this.users) {
      await this.registerUser(user);
    }
  }

  async close() {
    await this.browser.close();
  }
}

// Exemplo de uso:
(async () => {
  const registrar = new UserRegistrar();

  await registrar.init();

  await registrar.login('https://mipi.equatorialenergia.com.br/', '', '');
  await registrar.navigateToRegistrationPage('https://mipi.equatorialenergia.com.br/Usuarios');
  await registrar.registerAllUsers(users);

  await registrar.close();

//   console.log('Todos os usuários foram cadastrados!');
})();
