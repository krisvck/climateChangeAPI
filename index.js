//Point of entry of the app
//Server

//use cheerio -> package to pick out HTML elements on a webpage. npm i cheerio
//next use express.js -> back end framework for node. Listen to our ports -> npm i express

/*
package axios -> promised based HTTP ofr the browser and node.js.
Makes it easy to send HTTP request to REST endpoints and perform CRUD operations. 
Use it to GET, POST, PUT data -> npm i axios
*/

//then npm i -g nodemon

//defines the port we want to open our server on
const PORT = process.env.PORT || 8000; //for heroku deployment

//initialize express
const express = require("express");

//axios
const axios = require("axios");

//cheerio
const cheerio = require("cheerio");

//call express
const app = express();

//Where articles are being stores
const articles = [];

//array of newspapers
const newspapers = [
  {
    name: "thetimes",
    address: "https://www.thetimes.co.uk/environment/climate-change",
    base: "",
  },
  {
    name: "guardian",
    address: "https://www.theguardian.com/environment/climate-crisis",
    base: "",
  },
  {
    name: "telegraph",
    address: "https://www.telegraph.co.uk/climate-change",
    base: "https://www.telegraph.co.uk",
  },
];

//for each item in the array we want to get the array
newspapers.forEach((newspaper) => {
  axios.get(newspaper.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('a:contains("climate")', html).each(function () {
      const title = $(this).text();
      const url = $(this).attr("href");
      articles.push({
        title,
        url: newspaper.base + url,
        source: newspaper.name,
      });
    });
  });
});

//start scraping our first webpage
//parse a path: homepage path and syntax for routing
app.get("/", (req, res) => {
  res.json("Welcome to my Climate Change News API");
});

//if we visit news then
app.get("/news", (req, res) => {
  res.json(articles);
});
/*
  //visit this url below
  axios
    .get("https://www.theguardian.com/environment/climate-crisis")
    .then((response) => {
      const html = response.data;
      //comes back to us on the console as an HTML
      //console.log(html);
      //This is going to allow us to pick elements
      const $ = cheerio.load(html);

      $('a:contains("climate")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr("href");
        //pushing this object into an article array
        articles.push({ title, url });
      });
      //display the array on the browser
      res.json(articles);
    })
    .catch((err) => console.log(err));
});
*/

//get whatever newspaper id i pass in front of news
//specific name of newspaper /news/guardian
app.get("/news/:newspaperId", (req, res) => {
  //   console.log(req.params.newspaperId);
  const newspaperId = req.params.newspaperId;

  const newspaperAddress = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].address;

  const newspaperBase = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].base;

  axios
    .get(newspaperAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificArticles = [];

      $('a:contains("climate")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr("href");
        specificArticles.push({
          title,
          url: newspaperBase + url,
          source: newspaperId,
        });
      });
      res.json(specificArticles);
    })
    .catch((err) => console.error(err));
});

//get the port running -> backticks
app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
