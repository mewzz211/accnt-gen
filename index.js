const puppeteer = require('puppeteer');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.content === '!generateaccount') {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Go to XeraMail and create an email
        await page.goto('https://xeramail.com');
        await page.waitForSelector('#email');
        const email = await page.$eval('#email', el => el.value);
        console.log(`Created email: ${email}`);

        // Copy the email
        await page.evaluate(() => {
            const emailInput = document.querySelector('#email');
            emailInput.select();
            document.execCommand('copy');
        });

        // Go to Discord signup and paste the email
        await page.goto('https://discord.com/register');
        await page.waitForSelector('#email');
        await page.type('#email', email);

        // Generate a random username and password
        const username = Math.random().toString(36).substring(2, 10);
        const password = Math.random().toString(36).substring(2, 15);
        await page.type('#username', username);
        await page.type('#password', password);

        // Submit the form
        await page.click('button[type="submit"]');

        // Go to the email to verify
        await page.goto(`https://xeramail.com/inbox/${email}`);
        await page.waitForSelector('a[href*="verify"]');
        const verifyLink = await page.$eval('a[href*="verify"]', el => el.href);
        await page.goto(verifyLink);

        // Log the credentials
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);

        // Send the credentials to the Discord channel
        message.channel.send(`Username: ${username}\nPassword: ${password}`);

        await browser.close();
    }
});

client.login('MTU0NTY4MzY3NjU5NDE3NjA4MQ.GHuJeB.P7WEcjC2Hw4x8PtO5xJRJH2FZU71CGv9A_sZt8');
