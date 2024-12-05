import { parse } from 'node-html-parser';
import fs from 'fs/promises';
import { createObjectCsvWriter } from 'csv-writer';
import readline from 'readline';

async function parsingCars(userURL) {
    const headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, jak Gecko) Chrome/77.0.3865.90 Safari/537.36"
    }

    let nextURL = userURL;
    let index = 2;

    const cars = [];

    while (nextURL) {
        const response = await fetch(nextURL, { method: "GET", headers: headers });
        const html = await response.text();
        const parsed = parse(html);

        const itemsHtml = parsed.querySelector(".listing__items");// Проверка чтобы был не пустой элемент
        if (!itemsHtml) {
            break;
        }
        const itemsList = itemsHtml.querySelectorAll(".listing-item");


        for (let i = 0; i < itemsList.length; i++) {
            const item = itemsList[i];
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
        const nextButtonPage = parsed.querySelector(".listing__pages");
        if (nextButtonPage) {
            let tempPage = `page=${index}`;
            nextURL = userURL.replace(/page=\d+/, tempPage); // Обновленный URL страницы
            index++;
        } else {
            nextURL = null;
        }
    }
    return cars;
};

async function createCarsJSON(arrayCars, fileName) {
    const jsonData = JSON.stringify(arrayCars, null, 2);
    try {
        await fs.writeFile(fileName, jsonData, 'utf8');
        console.log(`Данные успешно записаны в файл ${fileName}`);
    } catch (err) {
        console.error('Ошибка записи в файл ${fileName}:', err);
    }
};
function createCarsCSVTable(arrayCars, fileName) {
    const csvWriter = createObjectCsvWriter({
        path: fileName,
        header: [
            { id: 'carName', title: 'Car Name' },
            { id: 'carYear', title: 'Car Year' },
            { id: 'engineVolume', title: 'Car Volume' },
            { id: 'priceBYN', title: 'priceBYN' },
            { id: 'priceUSD', title: 'priceUSD' },
        ]
    });
    csvWriter.writeRecords(arrayCars)
        .then(() => {
            console.log(`CSV ${fileName} файл успешно создан!`);
        })
        .catch(err => {
            console.error('Ошибка записи в CSV файл', err);
        });
};

function askUser(object, text) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve, reject) => {
        rl.question(text, (target) => {
            rl.close();
            if (target in object) {
                resolve(target);
            } else {
                reject(new Error("Не найдено"));
            }
        });
    });
}

async function main() {
    try {
        const jsonCarsFile = await fs.readFile("./cars.json", "utf-8");

        const carsJson = JSON.parse(jsonCarsFile);

        const carBrand = await askUser(carsJson, "Введите марку автомобиля: ");
        const brandId = carsJson[carBrand]["id"];
        const carModel = await askUser(carsJson[carBrand]["models"], "Введите модель автомобиля: ");
        const modelId = carsJson[carBrand]["models"][carModel]
        const userURL = (`https://cars.av.by/filter?brands[0][brand]=${brandId}&brands[0][model]=${modelId}&page=1`)


        const carsList = await parsingCars(userURL);
        const carNameForFile = carsList[0].carName;
        await createCarsJSON(carsList, `${carNameForFile}.json`);
        createCarsCSVTable(carsList, `${carNameForFile}.csv`);

    } catch (err) {
        console.error(err.message);
        return;
    }
}

main();
