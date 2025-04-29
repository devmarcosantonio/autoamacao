
const puppeteer = require('puppeteer');

class UserRegistrar {
  constructor(users) {
    this.users = users;
    console.log('usuarios:', this.users)
    this.browser = null;
    this.page = null;

  }

  async init() {
    this.browser = await puppeteer.launch({ headless: false }); // Abre o navegador visível
    this.page = await this.browser.newPage();

    //Bloqueia recursos desnecessários
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (['image', 'font'].includes(resourceType)) {
            request.abort();
        } else {
            request.continue();
        }
    });
  }

  async login(url, username, password) {
    console.log('Realizando login...');

  
    await this.page.goto(url);

    await this.page.type('#Input_UserName', username); 
    await this.page.type('#Input_Password', password); 

    await this.page.click('#account > div.text-center > button'); 
    await this.page.waitForNavigation({ timeout: 60000 });

    console.log('Login realizado com sucesso!');
  }

  async navigateToRegistrationPage(url) {
    console.log('Navegando para página de cadastro...');
    await this.page.goto(url, { timeout: 60000 });
  }

  async openRegistrationModal() {
    console.log('Abrindo modal de cadastro...');
    await this.page.click('body > main > div.container-fluid.py-4 > div.row.mt-4.min-vh-80 > div > div > div.card-header.pb-0 > div > div.ms-auto.my-auto.mt-lg-0.mt-4 > div > a');

    // Espera o dropdown abrir
    await this.page.waitForSelector('#modalUsuario', { visible: true });

  }

  async registerUser(user) {
   

    if (!user || !user.nome || !user.cpf || !user.email || !user.login || !user.perfil) {
        throw new Error('Dados do usuário estão incompletos ou inválidos.');
     
    }

    console.log(`Cadastrando usuário: ${user.nome}`);
  
    // Preenche os campos básicos
    await this.page.type('#Name', user.nome);
   
    await this.page.type('#Email', user.email); // Corrigi aqui, você estava preenchendo errado
    await this.page.type('#UserName', user.login);
    await this.page.type('#CPF', String(user.cpf));
  
    console.log("[INFO] Abrindo dropdown de perfil...");
    await this.page.click('#modalUsuario > div > div > div.modal-body-content > form > div.modal-body > div:nth-child(3) > div:nth-child(1) > div > div > div.choices__inner > div > div');

    await this.page.waitForSelector('#modalUsuario .choices__list--dropdown .choices__item', { visible: true });
  
    console.log("[INFO] Selecionando perfil...");
  
    // Captura todos os itens do dropdown
    const options = await this.page.$$('#modalUsuario .choices__list--dropdown .choices__item');
  
    for (const option of options) {
      const text = await option.evaluate(el => el.textContent.trim());
  
      if (text === user.perfil) {
        await option.click();
        console.log(`[INFO] Perfil '${user.perfil}' selecionado.`);
        break;
      }
    }
  
    // Clica no botão salvar
    await this.page.click('#modalUsuario > div > div > div.modal-body-content > form > div.modal-footer > a.btn.btn-icon.btn-primary.btn-sm');
  
    await new Promise(resolve => setTimeout(resolve, 3000)); // Pausa de 3 segundos
  }
  
  async registerAllUsers(win) {
    for (const user of this.users) {
      win.webContents.send('status', 'Cadastrando usuário: ' + user.nome);
      await this.registerUser(user);
      win.webContents.send('status', 'Usuário ' + user.nome + ' cadastrado com sucesso!');

      await new Promise(resolve => setTimeout(resolve, 1400)); // Pausa de 3 segundos
  
      await this.openRegistrationModal()

    }
  }

  async close() {
    await this.browser.close();
  }
}

module.exports = UserRegistrar;