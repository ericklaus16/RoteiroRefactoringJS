const { readFileSync } = require('fs');

class ServicoCalculoFatura {
  calcularCredito(pecas, apre){
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (getPeca(pecas, apre).tipo === "comedia") 
      creditos += Math.floor(apre.audiencia / 5);
    return creditos;   
  }
  

  calcularTotalCreditos(pecas, fatura){
    let creditos = 0;
    for (let apre of fatura.apresentacoes) {
      creditos += this.calcularCredito(pecas, apre);
    }
    return creditos;
  }
  
  calcularTotalApresentacao (pecas, apre) {
    let total;

    switch (getPeca(pecas, apre).tipo) {
      case "tragedia":
        total = 40000;
        if (apre.audiencia > 30) {
          total += 1000 * (apre.audiencia - 30);
        }
        break;
      case "comedia":
        total = 30000;
        if (apre.audiencia > 20) {
           total += 10000 + 500 * (apre.audiencia - 20);
        }
        total += 300 * apre.audiencia;
        break;
      default:
          throw new Error(`Peça desconhecia: ${getPeca(pecas, apre).tipo}`);
      }
      return total;
  }
  
  calcularTotalFatura(pecas, apresentacoes){
    let totalFatura = 0;
    for (let apre of apresentacoes) {
      totalFatura += this.calcularTotalApresentacao(pecas, apre);
    }
    return totalFatura;
  }
}

function formatarMoeda(valor){
  return new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: "BRL",
      minimumFractionDigits: 2 }).format(valor/100);
}

function getPeca(pecas, apresentacao) {
  return pecas[apresentacao.id];
}

function gerarFaturaStr (fatura, pecas, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  const formato = formatarMoeda;

  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
  }

  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura)} \n`;
  return faturaStr;
}

function gerarFaturaHTML(fatura, pecas) {
  string = "<html>\n"
  string += `<p> Fatura ${fatura.cliente} </p>\n`
  string += "<ul>\n"

  for (let apre of fatura.apresentacoes) {
    string += `<li> ${getPeca(pecas, apre).nome}: ${calcularTotalApresentacao(pecas, apre)} (${apre.audiencia} assentos) </li>\n`
  }

  string += "</ul>\n"
  string += `<p> Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))} </p>\n`
  string += `<p> Créditos acumulados: ${calcularTotalCreditos(pecas, fatura)} </p>\n`

  return string
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const calc = new ServicoCalculoFatura();
const faturaStr = gerarFaturaStr(faturas, pecas, calc);
// const faturaHTML = gerarFaturaHTML(faturas, pecas);
console.log(faturaStr);
// console.log(faturaHTML);
