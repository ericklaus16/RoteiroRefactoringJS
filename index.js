const { readFileSync } = require('fs');

class ServicoCalculoFatura {
  constructor(repo) {
    this.repo = repo;
  }

  calcularCredito(apre){
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (this.repo.getPeca(apre).tipo === "comedia") 
      creditos += Math.floor(apre.audiencia / 5);
    return creditos;   
  }
  

  calcularTotalCreditos(fatura){
    let creditos = 0;
    for (let apre of fatura.apresentacoes) {
      creditos += this.calcularCredito(apre);
    }
    return creditos;
  }
  
  calcularTotalApresentacao (apre) {
    let total;

    switch (this.repo.getPeca(apre).tipo) {
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
          throw new Error(`Peça desconhecia: ${this.repo.getPeca(apre).tipo}`);
      }
      return total;
  }
  
  calcularTotalFatura(apresentacoes){
    let totalFatura = 0;
    for (let apre of apresentacoes) {
      totalFatura += this.calcularTotalApresentacao(apre);
    }
    return totalFatura;
  }
}

class Repositorio {
  constructor() {
    this.pecas = JSON.parse(readFileSync('./pecas.json'));
  }

  getPeca(apre) {
    return this.pecas[apre.id];
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

function gerarFaturaStr (fatura, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  const formato = formatarMoeda;

  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
  }

  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura)} \n`;
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
const calc = new ServicoCalculoFatura(new Repositorio());
const faturaStr = gerarFaturaStr(faturas, calc);
console.log(faturaStr);

// const faturaHTML = gerarFaturaHTML(faturas, pecas);
// console.log(faturaHTML);