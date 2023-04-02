import selectors from "../utils/index.js";

import puppeteer from "puppeteer";

class Puppet {
  constructor() {
    this.puppet = puppeteer;
    this.browser = undefined;
    this.page = undefined;
  }

  async createBrowser({ headless }) {
    try {
      if (this.browser !== undefined) {
        await this.browser.close();
        this.browser = undefined;
      }

      this.browser = await this.puppet.launch({
        headless: headless,
        defaultViewport: null,
        args: ["--incognito", "--no-sandbox", "--disable-setuid-sandbox"],
      });
    } catch (error) {
      console.log("Error trying to create Browser => ", error);
    }
  }

  async createPage() {
    try {
      this.page = await this.browser.newPage();
      await this.page.setRequestInterception(true);

      this.page.on("request", (req) => {
        if (req.resourceType() === "image" || req.resourceType() === "stylesheet") req.abort();
        else req.continue();
      });
    } catch (error) {
      console.log("Error trying to create Page => ", error);
    }
  }

  async gotoSearchPage(page) {
    try {
      await this.page.goto(page, { waitUntil: "domcontentloaded" });
    } catch (error) {
      console.log("Error trying to goto page => ", error);
      await this.closePage();
      await this.closeBrowser();
    }
  }

  async startSearch({ sıralama_alt, sıralama_ust, sehir, muhendislik = true, ozel = false }) {
    try {
      const result = [];

      if (muhendislik) {
        await this.page.waitForSelector(selectors.bolumIsmiInput);
        await this.page.type(selectors.bolumIsmiInput, "mühendis");
        await this.page.waitForTimeout(1000);
      }

      if (sehir) {
        await this.page.waitForSelector(selectors.sehirIsmiInput);
        await this.page.type(selectors.sehirIsmiInput, sehir);
        await this.page.waitForTimeout(1000);
      }

      while (true) {
        await this.page.waitForSelector("#mydata > tbody > tr");
        const rowCount = await this.page.$$eval("#mydata > tbody > tr", (rows) => rows.length);

        for (let i = 1; i <= rowCount; i++) {
          await this.page.waitForSelector(selectors.sıralama(i));
          const sıralama = await this.page.$(selectors.sıralama(i));
          const sıralamaText = await this.page.evaluate((el) => el?.textContent, sıralama);
          const sıralamaNumber = Number(sıralamaText.replace(".", ""));

          sıralama_alt = Number(sıralama_alt);
          sıralama_ust = Number(sıralama_ust);

          if (!isNaN(sıralamaNumber)) {
            if (sıralamaNumber >= sıralama_alt) {
              if (sıralamaNumber - sıralama_ust > 75000) {
                return result;
              }

              if (sıralamaNumber >= sıralama_ust) {
                continue;
              }

              const okulTuru = await this.page.$(selectors.universiteTuru(i));
              const okulTuruValue = await this.page.evaluate((el) => el?.textContent, okulTuru);

              const bolumIsmi = await this.page.$(selectors.bolumIsmi(i));
              const bolumIsmiValue = await this.page.evaluate((el) => el?.textContent, bolumIsmi);

              const okulIsmı = await this.page.$(selectors.okulIsmı(i));
              const okulIsmıValue = await this.page.evaluate((el) => el?.textContent, okulIsmı);

              const bölümBilgileri = await this.page.$(selectors.bolumBilgileri(i));
              const bölümBilgileriValue = await this.page.evaluate((el) => el?.textContent, bölümBilgileri);

              const kontenjan = await this.page.$(selectors.kontenjan(i));
              const kontenjanValue = await this.page.evaluate((el) => el?.textContent, kontenjan);

              const puan = await this.page.$(selectors.puan(i));
              const puanValue = await this.page.evaluate((el) => el?.textContent, puan);

              const sehir = await this.page.$(selectors.sehir(i));
              const sehirValue = await this.page.evaluate((el) => el?.textContent, sehir);

              if (!ozel && okulTuruValue.toLowerCase() === "vakıf") {
                continue;
              }

              result.push({
                sehir: sehirValue,
                bolumIsmi: bolumIsmiValue,
                sıralama: sıralamaNumber,
                okulIsmı: okulIsmıValue,
                bölümBilgileri: bölümBilgileriValue,
                kontenjan: kontenjanValue,
                puan: puanValue,
              });
            }
          }
        }

        await this.page.click(selectors.sonrakiButonu);
        await this.page.waitForTimeout(500);
      }
    } catch (error) {
      console.log("Error trying to start search => ", error);
    }
  }

  async waitForTimeout({ timeout = 1000 }) {
    try {
      await new Promise((r) => setTimeout(r, timeout));
    } catch (error) {
      console.log("Error trying to wait for timeout => ", error);
    }
  }

  async closeBrowser() {
    try {
      if (this.browser !== undefined) {
        await this.browser.close();
        this.browser = undefined;
      } else {
        console.log("Browser is already closed");
      }
    } catch (error) {
      console.log("Error trying to close browser => ", error);
    }
  }

  async closePage() {
    try {
      if (this.page !== undefined) {
        await this.page.close();
        this.page = undefined;
      } else {
        console.log("Page is already closed");
      }
    } catch (error) {
      console.log("Error trying to close page => ", error);
    }
  }
}

export default Puppet;
