import { parse } from 'node-html-parser';
export { fetchPage, parsingCars };


async function fetchPage(userURL) {
    const headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, jak Gecko) Chrome/77.0.3865.90 Safari/537.36"
    }
    let nextURL = userURL;
    let index = 2;

    const allPagesHtml = [];

    while (nextURL) {
        const response = await fetch(nextURL, { method: "GET", headers: headers });
        const html = await response.text();
        const parsed = parse(html);
        const nextButtonPage = parsed.querySelector(".listing__pages");
        if (nextButtonPage) {
            let tempPage = `page=${index}`;
            nextURL = userURL.replace(/page=\d+/, tempPage); // Обновленный URL страницы
            index++;
        }
        else {
            nextURL = null;
        }
        allPagesHtml.push(html);
    }
    return allPagesHtml;
}


function parsingCars(htmlArray) {

    const cars = [];

    for (let i = 0; i < htmlArray.length; i++) {
        const parsedHtml = parse(htmlArray[i]);
        const itemsHtml = parsedHtml.querySelector(".listing__items");// Проверка чтобы был не пустой элемент
        if (!itemsHtml) {
            break;
        }
        const itemsList = itemsHtml.querySelectorAll(".listing-item");

        for (let j = 0; j < itemsList.length; j++) {
            const item = itemsList[j];
            const carName = item.querySelector(".link-text");
            const yearDiv = item.querySelector(".listing-item__params div:first-child");
            const yearNumber = Number(yearDiv.textContent.replace(/\D/g, ""));
            const carVolumeDiv = item.querySelector(".listing-item__params div:nth-child(2)"); // nth-child(2) div-элемент по индексу;
            const carVolumeText = carVolumeDiv.textContent.trim();
            const carEngineVolumeElement = parseFloat(carVolumeText.replace(/\D/g, "")) / 10;// Убираются лишние элементы по типу типа двигателя, коробка передач и остается только объем.
            const priceBYNDiv = item.querySelector(".listing-item__price");
            const priceBYN = parseFloat(priceBYNDiv.textContent.replace(/\D/g, ""));
            const priceUSDDiv = item.querySelector(".listing-item__priceusd");
            const priceUSD = parseFloat(priceUSDDiv.textContent.replace(/\D/g, ""));

            const carData = {
                carName: carName ? carName.textContent.trim() : null,
                carYear: yearNumber ? yearNumber : null,
                engineVolume: carEngineVolumeElement ? carEngineVolumeElement : null,
                priceBYN: priceBYN ? priceBYN : null,
                priceUSD: priceUSD ? priceUSD : null
            };
            cars.push(carData);
        };
    }
    return cars;
};
