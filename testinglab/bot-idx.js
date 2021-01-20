const fetch = require("node-fetch");
const moment = require("moment");

let companyCode = "AGRS";
let targetDate = "20150315";
let differDay = 5;

let afterDate = normalizeDate(targetDate, differDay - 1);
let beforeDate = normalizeDate(targetDate, -differDay);

let linkAfter = `https://www.idx.co.id/umbraco/Surface/TradingSummary/GetStockSummary?date=${afterDate}`;
let linkBefore = `https://www.idx.co.id/umbraco/Surface/TradingSummary/GetStockSummary?date=${beforeDate}`;

let links = [linkAfter, linkBefore];

links.forEach(async (link, index) => {
  console.log(index);
  const recordTotal = await fetch(link)
    .then((res) => res.json())
    .then((responseJSON) => {
      return responseJSON.recordsTotal;
    });

  const recordData = await fetch(`${link}&start=1&length=${recordTotal}`)
    .then((res) => res.json())
    .then((responseJSON) => {
      return responseJSON.data;
    });

  const finalData = await recordData.forEach((data) => {
    if (Object.values(data).indexOf(companyCode) > -1) {
      const dataResult = {
        Date: data.Date,
        StockCode: data.StockCode,
        StockName: data.StockName,
        Bid: data.Bid,
        Offer: data.Offer,
      };
      console.log(dataResult);
    }
  });
});

function normalizeDate(date, days) {
  var new_date = moment(date, "YYYY.MM.DD").add(days, "days");
  var day = new_date.format("DD");
  var month = new_date.format("MM");
  var year = new_date.format("YYYY");
  return year + "" + month + "" + day;
}
