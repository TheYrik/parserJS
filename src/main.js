import readline from 'readline';
import fs from 'fs/promises';
import { fetchPage, parsingCars } from "./parser/parser.js";
import { createCarsJSON, createCarsCSVTable } from "./parser/fileManager.js";


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
        const jsonCarsFile = await fs.readFile("./public/files/cars.json", "utf-8");

        const carsJson = JSON.parse(jsonCarsFile);

        const carBrand = await askUser(carsJson, "Введите марку автомобиля: ");
        const brandId = carsJson[carBrand]["id"];
        const carModel = await askUser(carsJson[carBrand]["models"], "Введите модель автомобиля: ");
        const modelId = carsJson[carBrand]["models"][carModel]
        const userURL = (`https://cars.av.by/filter?brands[0][brand]=${brandId}&brands[0][model]=${modelId}&page=1`)


        const htmlArray = await fetchPage(userURL);
        const carsList = await parsingCars(htmlArray);
        const carNameForFile = carsList[0].carName;
        await createCarsJSON(carsList, `${carNameForFile}.json`);
        await createCarsCSVTable(carsList, `${carNameForFile}.csv`);

    } catch (err) {
        console.error(err.message);
        return;
    }
}

main();
