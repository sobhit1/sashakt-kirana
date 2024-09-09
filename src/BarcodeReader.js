const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const NodeCache = require("node-cache");
const app = express();

const cache = new NodeCache({ stdTTL: 3600 }); // Cache valid for 1 hour

async function scrapeprice(url) {
    try {
        const response = await axios.get(url, { timeout: 2000 });
        if (response.status !== 200) return null;

        const $ = cheerio.load(response.data);

        let mrpPrice = $('tr:contains("MRP") td.line-through').text().trim();
        if (!mrpPrice) {
            mrpPrice = $('tr:contains("Price") td:contains("Price")').text().trim();
            const priceMatch = mrpPrice.match(/₹[\d,.]+/);
            if (priceMatch) {
                mrpPrice = priceMatch[0];
            }
        }

        return {
            Name: $("h1.Description___StyledH-sc-82a36a-2.bofYPK").text().trim(),
            Price: mrpPrice.split("₹")[1]
        };
    } catch (error) {
        console.error("Error during scraping:", error.message);
        return null;
    }
}

async function bbchrscrape(brcode) {
    try {
        const cachedData = cache.get(brcode);
        if (cachedData) {
            return cachedData;
        }

        const url = `https://www.google.com/search?q=${brcode}+bigbasket`;
        const response = await axios.get(url, { timeout: 2000 });
        if (response.status !== 200) throw new Error(`HTTP error! status: ${response.status}`);

        const $ = cheerio.load(response.data);

        // Extract the first valid URL
        let cleanedUrl = '';
        $('div.BNeawe.s3v9rd.AP7Wnd').each((index, element) => {
            if (!cleanedUrl) {
                const text = $(element).text();
                if (text.includes(brcode) && !text.includes("Missing")) {
                    const parentDiv = $(element).closest('div.Gx5Zad.xpd.EtOod.pkphOe');
                    const rawUrl = parentDiv.find('a').attr('href');
                    if (rawUrl) {
                        cleanedUrl = rawUrl.split('/url?q=')[1];
                        if (cleanedUrl && !cleanedUrl.includes("sitemap")) {
                            cleanedUrl = cleanedUrl.split('&')[0]; // Clean the URL further
                        }
                    }
                }
            }
        });

        if (!cleanedUrl) return [];

        // Scrape the valid URL
        const scrapedData = await scrapeprice(cleanedUrl);
        if (!scrapedData) return [];

        // Cache and return result
        cache.set(brcode, scrapedData);

        console.log(scrapedData);
        
        return scrapedData;
    } catch (error) {
        console.error("Error while processing the URL:", error.message);
        return [];
    }
}

app.get('/', async (req, res) => {
    const data = await bbchrscrape(8901030519000);
    res.send(data);
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
