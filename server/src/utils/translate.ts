import puppeteer from "puppeteer";
import JsGoogleTranslateFree from "@kreisler/js-google-translate-free";
async function translateText(text: string): Promise<string> {
    const from = "en";
    const to = "hu";
    const translation = await JsGoogleTranslateFree.translate({ from, to, text });
    return translation;
}

export const TranslteAnime = async (searchTerm: string) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(`https://www.livechart.me/search?q=${searchTerm}`);

        await page.waitForSelector(".grouped-list-item.anime-item");
        const animeLink = await page.$eval('.grouped-list-item.anime-item a[data-anime-item-target="mainTitle"]', (element: any) => element.href);

        await page.goto(animeLink);

        const lexpander = await page.$eval(".lc-expander", (element: any) => `${element.querySelector("p")?.textContent}\n\n${element.querySelector("p.italic")?.textContent}`);

        const translatedText = await translateText(lexpander);
        return translatedText;
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await browser.close();
    }
};
