const selectors = {
  sehirIsmiInput: "#yadcf-filter--mydata-6",
  bolumIsmiInput: "#yadcf-filter--mydata-4",
  tbody: "#mydata > tbody",
  sıralama: (sıra = 1) => `#mydata > tbody > tr:nth-child(${sıra}) > td:nth-child(12) > font:nth-child(8)`,
  okulIsmı: (sıra = 1) => `#mydata > tbody > tr:nth-child(${sıra}) > td.dt-left.vcenter > strong`,
  bolumIsmi: (sıra = 1) => `#mydata > tbody > tr:nth-child(${sıra}) > td:nth-child(4) > strong`,
  bolumBilgileri: (sıra = 1) => `#mydata > tbody > tr:nth-child(${sıra}) > td:nth-child(4) > font`,
  kontenjan: (sıra = 1) => `#mydata > tbody > tr:nth-child(${sıra}) > td:nth-child(9) > font:nth-child(8)`,
  puan: (sıra = 1) => `#mydata > tbody > tr:nth-child(${sıra}) > td:nth-child(13) > font:nth-child(8)`,
  sehir: (sıra = 1) => `#mydata > tbody > tr:nth-child(${sıra}) > td:nth-child(5)`,
  universiteTuru: (sıra = 1) => `#mydata > tbody > tr:nth-child(${sıra}) > td:nth-child(6)`,
  sonrakiButonu: "#mydata_next > a",
};

export default selectors;
