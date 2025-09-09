const axios = require('axios');
const cheerio = require('cheerio');
const pdf = require('pdf-parse');
const puppeteer = require('puppeteer');

// Opciones de configuración para las peticiones de scraping
const scraperOptions = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  timeout: 15000 // Límite de 15 segundos
};

/**
 * Extrae la misión y visión desde la página institucional de la UTS.
 */
async function scrapeUtsMissionVision() {
  try {
    const url = 'https://www.uts.edu.co/sitio/institucional/mision-y-vision/';
    const { data } = await axios.get(url, scraperOptions);
    const $ = cheerio.load(data);
    const contentDiv = $('div.entry-content');
    const missionText = contentDiv.find('p').text();
    if (missionText) return missionText;
    return "No se pudo encontrar la información de la misión en la página de la UTS.";
  } catch (error) {
    console.error("Error en scrapeUtsMissionVision:", error.message);
    return "Hubo un error al intentar obtener la Misión y Visión. El sitio de la UTS puede estar tardando mucho en responder.";
  }
}

/**
 * Descarga y extrae el texto del PDF del calendario académico.
 */
async function scrapeAcademicCalendar() {
  try {
    const url = 'https://www.uts.edu.co/sitio/wp-content/uploads/2019/10/ACUERDO-No.-03-018-CALENDARIO-ACADEMICO-PRESENCIAL-2025-2.pdf';
    const fileScraperOptions = { ...scraperOptions, responseType: 'arraybuffer' };
    const response = await axios.get(url, fileScraperOptions);
    const data = await pdf(response.data);
    return data.text || "No se pudo extraer texto del PDF del calendario.";
  } catch (error) {
    console.error("Error en scrapeAcademicCalendar:", error.message);
    return "Hubo un error al leer el PDF del calendario. El sitio de la UTS puede estar tardando mucho en responder.";
  }
}

// Se eliminó la función de scraping de noticias por ser inestable.

// Exportar solo las funciones que se utilizan
module.exports = {
  scrapeUtsMissionVision,
  scrapeAcademicCalendar
};