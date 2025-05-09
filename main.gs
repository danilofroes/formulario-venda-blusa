// IDs da planilha e da pasta no Drive
const PLANILHA_ID = '1-kbwGwZZ2mliNgqg5WEst5n1PKoDbk3npjzoR8_8DQs';
const PASTA_ID = '1Bhm1CQNMyDdPydW78hD8slXb2zz3c931';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // permite embutir o formulário
}

function processForm(dados) {
  try {
    const { nome, telefone, camisas, comprovante } = dados;

    // 1. Armazenar comprovante no Drive
    const pasta = DriveApp.getFolderById(PASTA_ID);
    const blob = Utilities.newBlob(Utilities.base64Decode(comprovante.base64), MimeType.PNG, comprovante.fileName);
    const arquivo = pasta.createFile(blob);
    const urlComprovante = arquivo.getUrl();

    // 2. Armazenar os dados na planilha
    const planilha = SpreadsheetApp.openById(PLANILHA_ID);
    const aba = planilha.getActiveSheet();

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
    Logger.log(erro);
    return 'Erro ao enviar o pedido. Tente novamente.';
  }
}
