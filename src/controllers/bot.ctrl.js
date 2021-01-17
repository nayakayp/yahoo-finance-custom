const puppeteer = require("puppeteer");
const moment = require("moment");

exports.home_view = (req, res) => {
  res.render("bot.views.ejs", { after: undefined, before: undefined });
};

exports.historical_data_web = async (req, res) => {
  let targetDate = req.body.date;
  let companyCode = req.body.companyCode;
  let differDay = 5;

  let targetDateUnixTimestamp = moment(targetDate, "YYYY.MM.DD").unix();
  let xDaysAfterUnixTimestamp = moment(
    normalizeDate(targetDate, differDay),
    "YYYY.MM.DD"
  ).unix();
  let xDaysBeforeUnixTimestamp = moment(
    normalizeDate(targetDate, -differDay),
    "YYYY.MM.DD"
  ).unix();

  let datasOfJSONAfter = [];
  let datasOfJSONBefore = [];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  //   Get data 5 hari SETELAH target dates
  await page.goto(
    `https://finance.yahoo.com/quote/${companyCode}/history?period1=${targetDateUnixTimestamp}&period2=${xDaysAfterUnixTimestamp}&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true`,
    { waitUntil: "networkidle2" }
  );
  const datasAfter = await page.$$eval(
    '[data-test="historical-prices"] tbody tr',
    (rows) => {
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    }
  );

  //   Get data 5 hari SEBELUM target dates
  await page.goto(
    `https://finance.yahoo.com/quote/${companyCode}/history?period1=${xDaysBeforeUnixTimestamp}&period2=${targetDateUnixTimestamp}&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true`,
    { waitUntil: "networkidle2" }
  );
  const datasBefore = await page.$$eval(
    '[data-test="historical-prices"] tbody tr',
    (rows) => {
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    }
  );

  datasAfter.forEach((data) => {
    datasOfJSONAfter.push({
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

  datasBefore.forEach((data) => {
    datasOfJSONBefore.push({
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

  // console.log(datasOfJSONAfter);
  // console.log("////////////////////////");
  // console.log(datasOfJSONBefore);

  function normalizeDate(date, days) {
    var new_date = moment(date, "YYYY.MM.DD").add(days, "days");
    var day = new_date.format("DD");
    var month = new_date.format("MM");
    var year = new_date.format("YYYY");
    return year + "." + month + "." + day;
  }

  await browser.close();
  res.render("bot.views.ejs", {
    after: datasOfJSONAfter,
    before: datasOfJSONBefore,
    targetDate,
  });
};

exports.historical_data_excel = (req, res) => {
  res.send("Data web");
};
