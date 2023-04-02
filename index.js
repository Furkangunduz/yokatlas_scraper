#!/usr/bin/env node
import readline from "readline";
import ora from "ora";
import chalk from "chalk";
import clear from "clear";
import Puppet from "./classes/Puppet.js";
import ExcelJS from "exceljs";

function askQuestion({ query, rl, required = false, defaultValue = 0, previousAnswers = null }) {
  clear();
  return new Promise((resolve) =>
    rl.question(chalk.yellow(query), async (ans) => {
      if (ans == undefined || ans == null || ans == "") {
        if (required) {
          loop: while (true) {
            let ans = await askQuestion({ query: chalk.red(query + "[zorunlu]"), rl, required });
            if (ans) {
              resolve(ans);
              break loop;
            }
          }
        } else {
          resolve(defaultValue);
        }
      } else {
        resolve(ans);
      }
    })
  );
}

async function main() {
  try {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const sıralama_alt = await askQuestion({
      query: "Arama yapmak istediğiniz en düşük sıralamayı girin: (örnek: 1) ",
      rl,
    });
    const sıralama_ust = await askQuestion({
      query: "Arama yapmak istediğiniz en yüksek sıralamayı girin: (örnek: 10000) ",
      rl,
      required: true,
    });
    const sehir = await askQuestion({
      query: "Arama yapmak istediğiniz şehri girin: (örnek: İstanbul)(not: Tüm şehirler için boş bırakın) ",
      rl,
      defaultValue: null,
    });

    const spinnerText = `${
      sehir ? sehir + " Şehri için " : "Tüm Şehirler için "
    } ${sıralama_alt} - ${sıralama_ust} sıraları arasındaki bölümler aranıyor... \n`;
    const spinner = ora(spinnerText).start();

    const puppet = new Puppet();
    const URL = "https://yokatlas.yok.gov.tr/tercih-sihirbazi-t4-tablo.php?p=say";

    await puppet.createBrowser({ headless: true });
    await puppet.createPage();
    await puppet.gotoSearchPage(URL);

    const result = await puppet.startSearch({ sıralama_alt, sıralama_ust, sehir });
    const columns = [
      { header: "Sıralama", key: "sıralama" },
      { header: "Şehir", key: "sehir" },
      { header: "Bölüm İsmi", key: "bolumIsmi" },
      { header: "Okul İsmı", key: "okulIsmı" },
      { header: "Bölüm Bilgileri", key: "bölümBilgileri" },
      { header: "Kontenjan", key: "kontenjan" },
      { header: "Puan", key: "puan" },
    ];
    const date = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");

    await writeToExcel({
      data: result,
      columns,
      fileName: `${sehir ? sehir + " " : ""}${sıralama_alt}-${sıralama_ust}_${date}`,
    });

    await puppet.closePage();
    await puppet.closeBrowser();
    spinner.stop();
    rl.close();
  } catch (err) {
    console.error(err);
  }
}

async function writeToExcel({ data, columns, fileName }) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data");
  worksheet.columns = columns;
  worksheet.addRows(data);
  await workbook.xlsx.writeFile(`${fileName}.xlsx`);
}

main();
