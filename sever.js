const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.static('public')); // Hosts your game HTML

app.get('/live.gif', async (req, res) => {
    // 1. Tell Discord this is an image that never finishes loading (MJPEG hack)
    res.writeHead(200, {
        'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    });

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // 2. Open the game (it's hosted on the same server)
    await page.setViewport({ width: 480, height: 270 }); // Small for speed
    await page.goto(`http://localhost:${process.env.PORT || 3000}`);

    // 3. Loop: Take a picture and send it to Discord as a "GIF frame"
    const streamInterval = setInterval(async () => {
        try {
            const screenshot = await page.screenshot({ type: 'jpeg', quality: 50 });
            res.write(`--frame\r\nContent-Type: image/jpeg\r\n\r\n`);
            res.write(screenshot);
            res.write(`\r\n`);
        } catch (e) {
            clearInterval(streamInterval);
            await browser.close();
        }
    }, 1000); // 1 frame per second (Discord limit)

    req.on('close', async () => {
        clearInterval(streamInterval);
        await browser.close();
    });
});

app.listen(process.env.PORT || 3000);
