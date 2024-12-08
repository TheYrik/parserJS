import fs from 'fs/promises';
import { createObjectCsvWriter } from 'csv-writer';
export { createCarsJSON, createCarsCSVTable };


async function createCarsJSON(arrayCars, fileName) {
    const jsonData = JSON.stringify(arrayCars, null, 2);
    try {
        await fs.writeFile(`./output/${fileName}`, jsonData, 'utf8');
        console.log(`Данные успешно записаны в файл ./output/${fileName}`);
    } catch (err) {
        console.error('Ошибка записи в файл ${fileName}:', err);
    }
};


function createCarsCSVTable(arrayCars, fileName) {
    const csvWriter = createObjectCsvWriter({
        path: `./output/${fileName}`,
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
            console.log(`CSV файл успешно создан и записан в файл ./output/${fileName}!`);
        })
        .catch(err => {
            console.error('Ошибка записи в CSV файл', err);
        });
};

