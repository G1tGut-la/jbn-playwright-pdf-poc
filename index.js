const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Number of concurrent executions
const EXECUTION_COUNT = 100;

// Log file path
const LOG_FILE = path.join(__dirname, 'execution_log.json');

// Function to generate a unique, random file name
const generateFileName = (index) => {
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 100000);
    return `output_${index}_${timestamp}_${randomPart}.pdf`;
};

// Function to load HTML and generate a PDF
async function generatePDF(instanceIndex) {
    const startTime = new Date().toISOString();
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Load the local dummy.html file
    const filePath = `file://${path.resolve(__dirname, 'dummy.html')}`;
    await page.goto(filePath);

    // Generate a unique PDF file name
    const pdfFileName = generateFileName(instanceIndex);
    const pdfFilePath = path.join(__dirname, pdfFileName);

    // Create PDF
    await page.pdf({ path: pdfFilePath, format: 'A4' });

    // Close browser
    await browser.close();

    const endTime = new Date().toISOString();

    return { instanceIndex, pdfFileName, startTime, endTime };
}

// Function to run multiple instances
async function runMultipleInstances() {
    console.log(`Starting ${EXECUTION_COUNT} Playwright instances...`);

    // Run all executions in parallel
    const results = await Promise.all(
        Array.from({ length: EXECUTION_COUNT }, (_, i) => generatePDF(i + 1))
    );

    // Append results to log file
    let logData = [];
    if (fs.existsSync(LOG_FILE)) {
        const existingData = fs.readFileSync(LOG_FILE, 'utf-8');
        logData = existingData ? JSON.parse(existingData) : [];
    }
    
    logData.push(...results);

    fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 4));

    console.log(`All ${EXECUTION_COUNT} instances finished. Log saved to execution_log.json`);
}

// Run the process
runMultipleInstances();
