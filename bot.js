const { Client, Intents } = require('discord.js');
const axios = require('axios');
const puppeteer = require('puppeteer');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Step 1: Go to XeraMail and create a temporary email
    await page.goto('https://xeramail.com');
    await page.waitForSelector('#email');
    const tempEmail = await page.$eval('#email', el => el.textContent);
    console.log(`Temporary Email: ${tempEmail}`);

    // Step 2: Go to Discord signup page and paste the temporary email
    await page.goto('https://discord.com/register');
    await page.waitForSelector('#email');
    await page.type('#email', tempEmail);
    const randomUsername = `user${Math.floor(Math.random() * 1000000)}`;
    await page.type('#username', randomUsername);
    const randomPassword = `pass${Math.floor(Math.random() * 1000000)}`;
    await page.type('#password', randomPassword);

    // Step 3: Submit the form
    await page.click('button[type="submit"]');

    // Step 4: Wait for the verification email and click the link
    await page.waitForNavigation();
    await page.goto(`https://xeramail.com/inbox/${tempEmail}`);
    await page.waitForSelector('a[href*="discord.com/verify"]');
    const verifyLink = await page.$eval('a[href*="discord.com/verify"]', el => el.href);
    await page.goto(verifyLink);
    await page.waitForNavigation();

    // Step 5: Log the credentials
    console.log(`Username: ${randomUsername}`);
    console.log(`Password: ${randomPassword}`);

    await browser.close();
});

client.login(process.env.DISCORD_BOT_TOKEN);
