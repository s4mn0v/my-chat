const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const natural = require('natural');
const fs = require('fs');

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();
const stopwords = new Set(natural.stopwords);

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
};

let knowledgeDocs;

function initializeChatbot() {
    const knowledgeBaseText = fs.readFileSync(path.join(__dirname, 'knowledge_base.txt'), 'utf-8');
    knowledgeDocs = knowledgeBaseText.split('\n\n').filter(paragraph => paragraph.trim() !== '');
    knowledgeDocs.forEach(doc => {
        tfidf.addDocument(preprocessText(doc));
    });
}

function preprocessText(text) {
    return tokenizer.tokenize(text.toLowerCase())
        .filter(word => !stopwords.has(word))
        .join(' ');
}

function respondToQuery(query) {
    const processedQuery = preprocessText(query);
    let relevantDocs = [];
    
    knowledgeDocs.forEach((doc, index) => {
        const processedDoc = preprocessText(doc);
        tfidf.addDocument(processedDoc);
        const score = tfidf.tfidf(processedQuery, index);
        if (score > 0) {
            relevantDocs.push({ index, score, content: doc });
        }
    });

    relevantDocs.sort((a, b) => b.score - a.score);

    if (relevantDocs.length === 0) {
        return "Lo siento, no tengo información específica sobre eso en mi base de conocimientos. ¿Puedes reformular tu pregunta o preguntar sobre otro tema?";
    }

    return generateResponse(relevantDocs);
}

function generateResponse(relevantDocs) {
    let response = "Aquí está la información que encontré:\n\n";
    relevantDocs.slice(0, 3).forEach((doc) => {
        response += `\nContenido relevante:\n${doc.content}\n\n`;
    });
    response += "¿Hay algo más específico que quieras saber sobre este tema?";
    return response;
}

app.whenReady().then(() => {
    initializeChatbot();
    createWindow();

    ipcMain.on('user-query', (event, query) => {
        const response = respondToQuery(query);
        event.reply('bot-response', response);
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});