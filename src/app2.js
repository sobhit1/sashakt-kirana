import https from 'https';
import { parse } from 'url';
import * as cheerio from 'cheerio';
import http from 'http';

// Function to scrape price
function scrapePrice(html) {
    try {
        const $ = cheerio.load(html);

        let mrpPrice = $('tr:contains("MRP") td.line-through').text().trim();
        if (!mrpPrice) {
            mrpPrice = $('tr:contains("Price") td:contains("Price")').text().trim();
            const priceMatch = mrpPrice.match(/₹[\d,.]+/);
            mrpPrice = priceMatch ? priceMatch[0] : 'N/A';
        }

        return {
            Name: $("h1.Description___StyledH-sc-82a36a-2.bofYPK").text().trim() || 'N/A',
            Price: mrpPrice.split("₹")[1] || 'N/A'
        };
    } catch (error) {
        console.error("Error during scraping:", error.message);
        return null;
    }
}

// Function to fetch the HTML from a URL
function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        const startTime = performance.now();
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const endTime = performance.now();
                if (endTime - startTime < 3000) {  // Check if response time is within 1 second
                    resolve(data);
                } else {
                    reject(new Error('Request took too long'));
                }
            });
        }).on('error', (err) => reject(err));
    });
}

// Function to search Google and scrape the product details
async function bbchrscrape(brcode) {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(brcode + ' bigbasket')}`;
    try {
        const html = await fetchHtml(searchUrl);
        const $ = cheerio.load(html);

        let cleanedUrl = '';

        $('div.BNeawe.s3v9rd.AP7Wnd').each((_, element) => {
            if (!cleanedUrl) {
                const text = $(element).text();
                if (text.includes(brcode) && !text.includes("Missing")) {
                    const parentDiv = $(element).closest('div.Gx5Zad.xpd.EtOod.pkphOe');
                    const rawUrl = parentDiv.find('a').attr('href');
                    if (rawUrl) {
                        cleanedUrl = rawUrl.split('/url?q=')[1]?.split('&')[0] || '';
                    }
                }
            }
        });

        if (!cleanedUrl) {
            console.log("No valid URL found!");
            return {};
        }

        const productHtml = await fetchHtml(cleanedUrl);
        return scrapePrice(productHtml);
    } catch (error) {
        console.error("Error in bbchrscrape:", error.message);
        return null;
    }
}

// Create an HTTP server
const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url.startsWith('/')) {
        const queryObject = new URL(req.url, `http://${req.headers.host}`).searchParams;
        const brcode = queryObject.get('brcode') || '8901030519000';

        try {
            const data = await bbchrscrape(brcode);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(data));
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ message: "An error occurred", error: error.message }));
        }
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
});

// Listen on port 3000
const PORT = 3000;
server.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
