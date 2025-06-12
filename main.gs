// IDs da planilha e da pasta no Drive
const PLANILHA_ID = '1-kbwGwZZ2mliNgqg5WEst5n1PKoDbk3npjzoR8_8DQs';
const PASTA_ID = '1Bhm1CQNMyDdPydW78hD8slXb2zz3c931';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); 
}

function processForm(dados) {
  try {
    // Para depuração, vamos logar os dados recebidos
    Logger.log(JSON.stringify(dados)); 

    if (!dados || !dados.comprovante) {
      throw new Error('Parâmetro "dados" ou "dados.comprovante" não foi passado para processForm');
    }
    const { nome, telefone, camisas, comprovante } = dados;

    // 1. Armazenar comprovante no Drive
    const pasta = DriveApp.getFolderById(PASTA_ID);
    
    const mimeType = comprovante.mimeType || 'application/octet-stream'; 
    const blob = Utilities.newBlob(Utilities.base64Decode(comprovante.base64), mimeType, comprovante.fileName);
    
    const arquivo = pasta.createFile(blob);
    const urlComprovante = arquivo.getUrl();

    // 2. Armazenar os dados na planilha
    const planilha = SpreadsheetApp.openById(PLANILHA_ID);
    const aba = planilha.getSheetByName('Pedidos');

    if (!aba) {
      throw new Error("A aba 'Pedidos' não foi encontrada na planilha. Verifique o nome.");
    }

    camisas.forEach(c => {
      aba.appendRow([
        new Date(), // Timestamp
        nome,
        telefone,
        c.modelo,
        c.tamanho,
        urlComprovante
      ]);
    });

    return 'Pedido enviado com sucesso!';
  } catch (erro) {
    // Logar o erro completo ajuda a diagnosticar problemas futuros
    Logger.log('Erro em processForm: ' + erro.toString()); 
    // Retorna a mensagem de erro para o cliente
    throw new Error('Ocorreu um erro no servidor ao processar seu pedido. Detalhes: ' + erro.message);
  }
}