const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// URL страницы
const url = 'https://mx.by/product-news/';

// Функция для очистки строки от недопустимых символов
function cleanXmlString(str) {
    // Удаляем недопустимые символы для XML
    return str.replace(/[<>&'"]/g, '');
}

// Функция для извлечения первых 7 слов из строки
function getFirstSevenWords(str) {
    const words = str.split(' '); // Разбиваем строку на массив слов
    return words.slice(0, 7).join(' '); // Возвращаем первые 7 слов, объединенные в строку
}

// Функция для парсинга страницы
async function parseProductCards(url) {
    try {
        // Делаем HTTP-запрос к сайту
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Загружаем HTML-документ с помощью cheerio
        const $ = cheerio.load(response.data);

        // Ищем карточки товаров
        const productCards = [];

        // Пример: ищем карточки товаров (например, в div с классом main_product)
        $('.main_product').each((index, element) => {
            const title = getFirstSevenWords(cleanXmlString($(element).find('.product-name .theme-link span').text().trim())); // Заголовок товара
            const price = cleanXmlString($(element).find('.current-price').text().trim()); // Цена товара
            const image = $(element).find('.product-images img').attr('src'); // Ссылка на изображение
            const link = $(element).find('.product-name .theme-link').attr('href'); // Ссылка на товар

            // Проверяем, что данные существуют
            if (title && price && image && link) {
                // Преобразуем относительные ссылки в абсолютные
                const absoluteLink = new URL(link, url).href;
                const absoluteImage = new URL(image, url).href;

                // Добавляем данные в массив
                productCards.push({
                    title,
                    price,
                    image: absoluteImage,
                    link: absoluteLink
                });
            }
        });

        // Выводим результат в консоль
        console.log('Карточки товаров:', productCards);

        // Сохраняем данные в JSON-файл
        fs.writeFileSync('products.json', JSON.stringify(productCards, null, 2));
        console.log('Данные успешно сохранены в products.json');
    } catch (error) {
        console.error('Ошибка при парсинге сайта:', error.message);
    }
}

// Запускаем парсер
parseProductCards(url);