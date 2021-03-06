const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const moment = require("moment");

exports.home_view = (req, res) => {
  res.render("bot.views.ejs", { RITafter: undefined, RITbefore: undefined });
};

exports.historical_data_web = async (req, res) => {
  let targetDate = req.body.date;
  let companyCode = req.body.companyCode;
  let differDay = 10;

  let targetDateUnixTimestamp = moment(targetDate, "YYYY.MM.DD").unix();
  let xDaysAfterUnixTimestamp = moment(
    normalizeDate(targetDate, differDay),
    "YYYY.MM.DD"
  ).unix();
  let xDaysBeforeUnixTimestamp = moment(
    normalizeDate(targetDate, -(differDay + 1)),
    "YYYY.MM.DD"
  ).unix();

  let datasRITOfJSONAfter = [];
  let datasRITOfJSONBefore = [];
  let datasIHGSOfJSONAfter = [];
  let datasIHGSOfJSONBefore = [];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  //   Get data RIT 5 hari SETELAH target dates
  await page.goto(
    `https://finance.yahoo.com/quote/${companyCode}/history?period1=${targetDateUnixTimestamp}&period2=${xDaysAfterUnixTimestamp}&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true`,
    { waitUntil: "networkidle2" }
  );
  const datasRITAfter = await page.$$eval(
    '[data-test="historical-prices"] tbody tr',
    (rows) => {
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    }
  );

  //   Get data RIT 5 hari SEBELUM target dates
  await page.goto(
    `https://finance.yahoo.com/quote/${companyCode}/history?period1=${xDaysBeforeUnixTimestamp}&period2=${targetDateUnixTimestamp}&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true`,
    { waitUntil: "networkidle2" }
  );
  const datasRITBefore = await page.$$eval(
    '[data-test="historical-prices"] tbody tr',
    (rows) => {
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    }
  );

  //   Get data IHGS 5 hari SESUDAH target dates
  await page.goto(
    `https://finance.yahoo.com/quote/^JKSE/history?period1=${targetDateUnixTimestamp}&period2=${xDaysAfterUnixTimestamp}&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true`,
    { waitUntil: "networkidle2" }
  );
  const datasIHGSAfter = await page.$$eval(
    '[data-test="historical-prices"] tbody tr',
    (rows) => {
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    }
  );

  //   Get data IHGS 5 hari SEBELUM target dates
  await page.goto(
    `https://finance.yahoo.com/quote/^JKSE/history?period1=${xDaysBeforeUnixTimestamp}&period2=${targetDateUnixTimestamp}&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true`,
    { waitUntil: "networkidle2" }
  );
  const datasIHGSBefore = await page.$$eval(
    '[data-test="historical-prices"] tbody tr',
    (rows) => {
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    }
  );

  // RIT
  datasRITAfter.forEach((data) => {
    datasRITOfJSONAfter.push({
      date: data[0],
      open: data[1],
      high: data[2],
      low: data[3],
      close: data[4],
      adjClose: data[5],
      volume: data[6],
      symbol: companyCode,
    });
  });

  datasRITBefore.forEach((data) => {
    datasRITOfJSONBefore.push({
      date: data[0],
      open: data[1],
      high: data[2],
      low: data[3],
      close: data[4],
      adjClose: data[5],
      volume: data[6],
      symbol: companyCode,
    });
  });

  // IHGS
  datasIHGSAfter.forEach((data) => {
    datasIHGSOfJSONAfter.push({
      date: data[0],
      open: data[1],
      high: data[2],
      low: data[3],
      close: data[4],
      adjClose: data[5],
      volume: data[6],
      symbol: companyCode,
    });
  });

  datasIHGSBefore.forEach((data) => {
    datasIHGSOfJSONBefore.push({
      date: data[0],
      open: data[1],
      high: data[2],
      low: data[3],
      close: data[4],
      adjClose: data[5],
      volume: data[6],
      symbol: companyCode,
    });
  });

  function normalizeDate(date, days) {
    var new_date = moment(date, "YYYY.MM.DD").add(days, "days");
    var day = new_date.format("DD");
    var month = new_date.format("MM");
    var year = new_date.format("YYYY");
    return year + "." + month + "." + day;
  }

  await browser.close();
  res.render("bot.views.ejs", {
    RITafter: datasRITOfJSONAfter,
    RITbefore: datasRITOfJSONBefore,
    IHGSafter: datasIHGSOfJSONAfter,
    IHGSbefore: datasIHGSOfJSONBefore,
    targetDate,
    companyCode,
    differDay,
  });
};

exports.idx_view = (req, res) => {
  res.render("idx.views.ejs", { datas: undefined });
};

exports.bid_offer_idx = async (req, res) => {
  let companyCode = req.body.companyCode;
  let targetDate = req.body.date;
  let maxDay = 10;
  let datas = [
    { name: "After", data: [] },
    { name: "Before", data: [] },
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
      res.render("idx.views.ejs", {
        datas,
        targetDate,
        companyCode,
        maxDay,
      });
      // console.log(datas);
    }
  }

  function normalizeDate(date, days) {
    var new_date = moment(date, "YYYY.MM.DD").add(days, "days");
    var day = new_date.format("DD");
    var month = new_date.format("MM");
    var year = new_date.format("YYYY");
    return year + "" + month + "" + day;
  }
};
