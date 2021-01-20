const fetch = require("node-fetch");
const moment = require("moment");

let companyCode = "ZBRA";
let targetDate = "20150315";
let maxDay = 10;

(async () => {
  let datas = [
    { name: "after", data: [] },
    { name: "before", data: [] },
  ];
  for (j = 0; j < 2; j++) {
    for (let i = 0; i < maxDay; i++) {
      let date;
      if (j == 0) {
        date = normalizeDate(targetDate, i);
      } else if (j == 1) {
        date = normalizeDate(targetDate, -i);
      }
      let link = `https://www.idx.co.id/umbraco/Surface/TradingSummary/GetStockSummary?date=${date}`;

      const recordTotal = await fetch(link)
        .then((res) => res.json())
        .then((responseJSON) => {
          return responseJSON.recordsTotal;
        });

      if (recordTotal > 0) {
        const recordData = await fetch(`${link}&start=1&length=${recordTotal}`)
          .then((res) => res.json())
          .then((responseJSON) => {
            return responseJSON.data;
          });
        // console.log(recordData.length);
        const finalData = await recordData.forEach((data) => {
          if (Object.values(data).indexOf(companyCode) > -1) {
            datas[j]["data"].push({
              Date: data.Date,
              StockCode: data.StockCode,
              StockName: data.StockName,
              Bid: data.Bid,
              Offer: data.Offer,
            });
          }
        });
      }
    }
    if (j == 1) {
      console.log(datas[0]);
      console.log(datas[1]);
    }
  }
})();

// let afterDate = normalizeDate(targetDate, differDay - 1);
// let beforeDate = normalizeDate(targetDate, -differDay);

// let linkAfter = `https://www.idx.co.id/umbraco/Surface/TradingSummary/GetStockSummary?date=${afterDate}`;
// let linkBefore = `https://www.idx.co.id/umbraco/Surface/TradingSummary/GetStockSummary?date=${beforeDate}`;

// let links = [linkAfter, linkBefore];

// links.forEach(async (link, index) => {
//   console.log(index);
//   const recordTotal = await fetch(link)
//     .then((res) => res.json())
//     .then((responseJSON) => {
//       return responseJSON.recordsTotal;
//     });

//   const recordData = await fetch(`${link}&start=1&length=${recordTotal}`)
//     .then((res) => res.json())
//     .then((responseJSON) => {
//       return responseJSON.data;
//     });

//   const finalData = await recordData.forEach((data) => {
//     if (Object.values(data).indexOf(companyCode) > -1) {
//       const dataResult = {
//         Date: data.Date,
//         StockCode: data.StockCode,
//         StockName: data.StockName,
//         Bid: data.Bid,
//         Offer: data.Offer,
//       };
//       console.log(dataResult);
//     }
//   });
// });

function normalizeDate(date, days) {
  var new_date = moment(date, "YYYY.MM.DD").add(days, "days");
  var day = new_date.format("DD");
  var month = new_date.format("MM");
  var year = new_date.format("YYYY");
  return year + "" + month + "" + day;
}
