const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
require('dotenv').config()

const nodeSchedule = require('node-schedule');

const chromePaths = require('chrome-paths');

const fetch = require('node-fetch');
const fs = require('fs');
const moment = require('moment');
const chalk = require('chalk');
const delay = require('delay');
const readlineSync = require('readline-sync');
const NodeCache = require("node-cache");
const myCache = new NodeCache();


(async () => {


    console.log('')
    let tradeTypeValue = readlineSync.question('Pakai akun demo / real ex. (demo/real) ? ');


    let amount = readlineSync.question('set Amount ex 20000, jangan diisi jika memilih default 14000 ? ');
    let compent = readlineSync.question('set berapa kompensasi ex 3, jangan diisi jika memilih default 1 kompensasi ? ');

    if (!amount) {
        amount = '14000';
    }

    if (!compent) {
        compent = '1';
    }

    if (parseInt(compent) > 5) {
        console.log('max kompensasi 5');
        process.exit()
    }

    const tradeType = ['demo', 'real'];
    if (!tradeType.includes(tradeTypeValue)) {
        console.log(chalk.yellow(`Type trade hanya ada ${tradeType}`));
        process.exit(0)
    }
    console.log('')

    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--disable-accelerated-2d-canvas',
        '--no-zygote',
        '--no-first-run',
        '--disable-dev-shm-usage',
        '--window-size=1920x1080'
    ];


    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        executablePath: chromePaths.chrome,
        userDataDir: './tmp',
        slowMo: 0,
        devtools: false,
        args
    });


    const pages = await browser.pages();
    const page = pages[0];
    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://binomo-web.com/trading', {
        waitUntil: 'networkidle0',
        timeout: 120000,
    });

    let loginRequired = false;

    if ((await page.$('#qa_auth_LoginBtn > button')) !== null) {
        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow('Kamu harus login terlebih dahulu'));
        loginRequired = true
    } else {
        loginRequired = false
    }

    if (loginRequired) {
        const isLogin = readlineSync.question('Tekan enter jika sudah login [ENTER]');
        console.log('')

        if ((await page.$('#avatar > vui-badge > vui-avatar > img')) !== null) {
            await page.evaluate(() => document.querySelector("#avatar > vui-badge > vui-avatar > img").click());
        } else {
            await page.evaluate(() => document.querySelector("#avatar > vui-badge > vui-avatar > span").click());
        }

        await page.waitForSelector('#qa_header_MiniProfileDropdown > div.popover_body__3GBGJ > div > div.personal-information > div.wrap > div > p.name');
        let loginName = await page.$('#qa_header_MiniProfileDropdown > div.popover_body__3GBGJ > div > div.personal-information > div.wrap > div > p.name');
        let loginNameValue = await page.evaluate(el => el.textContent, loginName);
        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Berhasil login dengan akun : ${loginNameValue}`));
    } else {
        if ((await page.$('#avatar > vui-badge > vui-avatar > img')) !== null) {
            await page.evaluate(() => document.querySelector("#avatar > vui-badge > vui-avatar > img").click());
        } else {
            await page.evaluate(() => document.querySelector("#avatar > vui-badge > vui-avatar > span").click());
        }
        await page.waitForSelector('#qa_header_MiniProfileDropdown > div.popover_body__3GBGJ > div > div.personal-information > div.wrap > div > p.name');
        let loginName = await page.$('#qa_header_MiniProfileDropdown > div.popover_body__3GBGJ > div > div.personal-information > div.wrap > div > p.name');
        let loginNameValue = await page.evaluate(el => el.textContent, loginName);
        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Berhasil login dengan akun : ${loginNameValue}`));
    }



    await page.goto('https://binomo-web.com/trading', {
        waitUntil: 'networkidle0',
        timeout: 120000,
    });

    if (tradeTypeValue == 'demo') {
        await page.waitForSelector('#account-name');
        let checkLocationAccount = await page.$('#account-name');
        let locationAccountValue = await page.evaluate(el => el.textContent, checkLocationAccount);

        if (locationAccountValue.toLowerCase().includes('real')) {
            await page.evaluate(() => document.querySelector("#qa_trading_balance").click());
            await page.waitForSelector('#qa_trading_accountSwitcherDialog > div.popover_body__3GBGJ > account-list > div:nth-child(2) > vui-radio > label');
            await page.evaluate(() => document.querySelector("#qa_trading_accountSwitcherDialog > div.popover_body__3GBGJ > account-list > div:nth-child(2) > vui-radio > label").click());
            await page.evaluate(() => {
                document.querySelector('#qa_trading_accountSwitcherDialog > div.popover_body__3GBGJ > account-list > div:nth-child(2) > vui-radio > label')
                // balance.click();
            });
            await page.waitForSelector('body > ng-component > vui-modal > div > div.modal_header__1h7ps > button > vui-icon > i');
            await page.evaluate(() => document.querySelector("body > ng-component > vui-modal > div > div.modal_header__1h7ps > button > vui-icon > i").click());
        }
        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green('Trading menggunakan akun Demo'));
    } else if (tradeTypeValue == 'real') {

        await page.waitForSelector('#account-name');
        let checkLocationAccount = await page.$('#account-name');
        let locationAccountValue = await page.evaluate(el => el.textContent, checkLocationAccount);

        if (locationAccountValue.toLowerCase().includes('demo')) {
            await page.evaluate(() => document.querySelector("#qa_trading_balance").click());
            await page.waitForSelector('#qa_trading_accountSwitcherDialog > div.popover_body__3GBGJ > account-list > div:nth-child(1) > vui-radio > label > input[type=radio]');
            await page.evaluate(() => document.querySelector("#qa_trading_accountSwitcherDialog > div.popover_body__3GBGJ > account-list > div:nth-child(1) > vui-radio > label > input[type=radio]").click());
            await page.evaluate(() => {
                document.querySelector('#qa_trading_accountSwitcherDialog > div.popover_body__3GBGJ > account-list > div:nth-child(1) > vui-radio > label > input[type=radio]')
                // balance.click();
            });
            await page.waitForSelector('body > ng-component > vui-modal > div > div.modal_header__1h7ps > button > vui-icon > i');
            await page.evaluate(() => document.querySelector("body > ng-component > vui-modal > div > div.modal_header__1h7ps > button > vui-icon > i").click());
        }


        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green('Trading menggunakan akun Real'));
    }

    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Trading dimulai dengan amount : ${amount}`));
    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Kompensasi jika lose akan dilakukan sebanyak ${compent}x secara berturut`));
    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green('Start Trading...'));
    console.log('');

    await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
    const foo1 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
    await foo1.click({ clickCount: 3 });
    await page.keyboard.type(Math.ceil(parseInt(amount)).toString());

    await delay(2000);

    fs.writeFileSync('login.bak', tradeTypeValue, 'utf-8');

    const timeList = await fs.readFileSync('./time.txt', 'utf-8');
    const timeArray = timeList.split('\n');
    for (let index = 0; index < timeArray.length; index++) {
        const element = timeArray[index];

        if (element) {
            const hours = element.split(':')[0];
            const minute = element.split(':')[1].split(' ')[0];
            const type = element.split(':')[1].split(' ')[1];
            nodeSchedule.scheduleJob({ hour: minute == '00' ? hours - 1 : hours, minute: minute == '00' ? '59' : minute - 1 }, async () => {
                const haveCompent = myCache.get('compent');

                if (!haveCompent) {
                    if (type == 'B') {
                        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Buy at ${minute == '00' ? hours - 1 : hours}:${minute == '00' ? '59' : minute - 1} ...`));
                        await page.evaluate(() => document.querySelector("#qa_trading_dealUpButton > button").click());
                        await delay(59000);

                        await page.waitForSelector('#trade > div > div > app-toasts > app-option-toast > div > span.currency');
                        let profitCheck = await page.$('#trade > div > div > app-toasts > app-option-toast > div > span.currency');
                        let profitCheckValue = await page.evaluate(el => el.textContent, profitCheck);

                        if (profitCheckValue.substring(2) == '0,00' || profitCheckValue.substring(2) == '0.00') {
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Tidak profit : ${profitCheckValue}`));
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Next kompensasi.`));

                            myCache.set('compent', {
                                position: 1,
                                to: parseInt(compent)
                            })

                            let jumlahTrade = Math.ceil(parseInt(amount) * 2.5);
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Melakukan kompensasi dengan jumlah ${Math.ceil(parseInt(jumlahTrade))}`));

                            await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                            const foo2 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                            await foo2.click({ clickCount: 3 });
                            await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString());
                            await page.evaluate(() => document.querySelector("#qa_trading_dealUpButton > button").click());
                            await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                            const foo3 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                            await foo3.click({ clickCount: 3 });
                            await page.keyboard.type(Math.ceil(parseInt(amount)).toString());

                            const indexOfTimeLost = timeArray.findIndex(x => x.includes(element));
                            const nextSignal = timeArray[indexOfTimeLost + 1];

                            if (nextSignal) {

                                await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                const foo4 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                await foo4.click({ clickCount: 3 });
                                await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString());

                                if ((await page.$('body > ng-component > vui-modal > div > div.modal_body__3sRTW > ng-component > div > p')) !== null) {
                                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Ada problem : ${profitCheckValueAfterCompen}`));
                                    process.exit(0);
                                }

                                await delay(60000);

                                await page.waitForSelector('#trade > div > div > app-toasts > app-option-toast > div > span.currency');
                                let profitCheckAfterCompen = await page.$('#trade > div > div > app-toasts > app-option-toast > div > span.currency');
                                let profitCheckValueAfterCompen = await page.evaluate(el => el.textContent, profitCheckAfterCompen);
                                if (profitCheckValueAfterCompen.substring(2) == '0,00' || profitCheckValueAfterCompen.substring(2) == '0.00') {
                                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Kompensasi tidak menghasilkan :'( : ${profitCheckValueAfterCompen}`));
                                    if (parseInt(compent) > 1) {
                                        myCache.set('compent', {
                                            position: 2,
                                            to: parseInt(compent),
                                            amount: Math.ceil(parseInt(amount) * 2.5)
                                        })

                                        let checkCompent = myCache.get('compent');
                                        if (checkCompent) {
                                            do {
                                                checkCompent = myCache.get('compent');
                                                if (checkCompent) {
                                                    let jumlahTrade = Math.ceil(parseInt(checkCompent.amount) * 2.5);
                                                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Melakukan kompensasi ke ${checkCompent.position} dengan jumlah ${Math.ceil(parseInt(jumlahTrade))}`));

                                                    await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                                    const foo5 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                                    await foo5.click({ clickCount: 3 });
                                                    await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString());

                                                    const indexOfTimeLost = timeArray.findIndex(x => x.includes(element));
                                                    const nextSignal = timeArray[indexOfTimeLost + 1];

                                                    if (nextSignal) {

                                                        await page.evaluate(() => document.querySelector("#qa_trading_dealUpButton > button").click());


                                                        await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                                        const foo6 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                                        await foo6.click({ clickCount: 3 });
                                                        await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString());


                                                        await delay(60000);

                                                        await page.waitForSelector('#trade > div > div > app-toasts > app-option-toast > div > span.currency');
                                                        let profitCheckAfterCompen = await page.$('#trade > div > div > app-toasts > app-option-toast > div > span.currency');
                                                        let profitCheckValueAfterCompen = await page.evaluate(el => el.textContent, profitCheckAfterCompen);
                                                        if (profitCheckValueAfterCompen.substring(2) == '0,00' || profitCheckValueAfterCompen.substring(2) == '0.00') {
                                                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Kompensasi ke ${checkCompent.position} tidak menghasilkan :'( : ${profitCheckValueAfterCompen}`));
                                                            myCache.set('compent', {
                                                                position: checkCompent.position + 1,
                                                                to: parseInt(compent),
                                                                amount: jumlahTrade
                                                            })



                                                            if (checkCompent.position == checkCompent.to) {
                                                                myCache.del('compent')
                                                                await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                                                const foo7 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                                                await foo7.click({ clickCount: 3 });
                                                                await page.keyboard.type(Math.ceil(parseInt(amount)).toString());
                                                            }

                                                        } else {
                                                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Kompensasi ke ${checkCompent.position} profit : ${profitCheckValueAfterCompen}`));
                                                            myCache.del('compent')
                                                            await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                                            const foo8 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                                            await foo8.click({ clickCount: 3 });
                                                            await page.keyboard.type(Math.ceil(parseInt(amount)).toString());
                                                        }
                                                    }
                                                }
                                            } while (checkCompent);
                                        }
                                    }

                                    await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                    const foo9 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                    await foo9.click({ clickCount: 3 });
                                    await page.keyboard.type(Math.ceil(parseInt(amount)).toString());

                                } else {
                                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Kompensasi profit : ${profitCheckValueAfterCompen}`));
                                    myCache.del('compent')
                                    await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                    const foo10 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                    await foo10.click({ clickCount: 3 });
                                    await page.keyboard.type(Math.ceil(parseInt(amount)).toString());
                                }

                                await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                const foo11 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                await foo11.click({ clickCount: 3 });
                                await page.keyboard.type(Math.ceil(parseInt(amount)).toString());

                                console.log('')

                            } else {
                                console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow('Tidak ada sinyal selanjutnya.'));
                                process.exit(0);
                            }



                        } else {
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Profit guys : ${profitCheckValue}`));
                            await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                            const foo12 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                            await foo12.click({ clickCount: 3 });
                            await page.keyboard.type(Math.ceil(parseInt(amount)).toString());
                        }



                        console.log('');
                        await delay(2000);
                    } else if (type == 'S') {
                        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Sell at ${minute == '00' ? hours - 1 : hours}:${minute == '00' ? '59' : minute - 1} ...`));
                        await page.evaluate(() => document.querySelector("#qa_trading_dealDownButton > button").click());
                        await delay(59000);

                        await page.waitForSelector('#trade > div > div > app-toasts > app-option-toast > div > span.currency');
                        let profitCheck = await page.$('#trade > div > div > app-toasts > app-option-toast > div > span.currency');
                        let profitCheckValue = await page.evaluate(el => el.textContent, profitCheck);

                        if (profitCheckValue.substring(2) == '0,00' || profitCheckValue.substring(2) == '0.00') {
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Tidak profit : ${profitCheckValue}`));
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Next kompensasi.`));

                            myCache.set('compent', {
                                position: 1,
                                to: parseInt(compent)
                            })

                            let jumlahTrade = Math.ceil(parseInt(amount) * 2.5);
                            jumlahTrade = Math.ceil(jumlahTrade);
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Melakukan kompensasi dengan jumlah ${Math.ceil(parseInt(jumlahTrade))}`));



                            await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                            const foo13 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                            await foo13.click({ clickCount: 3 });
                            await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString());
                            await page.evaluate(() => document.querySelector("#qa_trading_dealDownButton > button").click());
                            await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text]");
                            await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                            const foo14 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                            await foo14.click({ clickCount: 3 });
                            await page.keyboard.type(Math.ceil(parseInt(amount)).toString());

                            const indexOfTimeLost = timeArray.findIndex(x => x.includes(element));
                            const nextSignal = timeArray[indexOfTimeLost + 1];
                            if (nextSignal) {


                                await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                const foo15 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                await foo15.click({ clickCount: 3 });
                                await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString());

                                await delay(60000);

                                await page.waitForSelector('#trade > div > div > app-toasts > app-option-toast > div > span.currency');
                                let profitCheckAfterCompen = await page.$('#trade > div > div > app-toasts > app-option-toast > div > span.currency');
                                let profitCheckValueAfterCompen = await page.evaluate(el => el.textContent, profitCheckAfterCompen);
                                if (profitCheckValueAfterCompen.substring(2) == '0,00' || profitCheckValueAfterCompen.substring(2) == '0.00') {
                                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Kompensasi tidak menghasilkan :'( : ${profitCheckValueAfterCompen}`));
                                    if (parseInt(compent) > 1) {
                                        myCache.set('compent', {
                                            position: 2,
                                            to: parseInt(compent),
                                            amount: Math.ceil(parseInt(amount) * 2.5)
                                        })

                                        let checkCompent = myCache.get('compent');

                                        if (checkCompent) {
                                            do {
                                                checkCompent = myCache.get('compent');
                                                if (checkCompent) {
                                                    let jumlahTrade = Math.ceil(parseInt(checkCompent.amount) * 2.5);
                                                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Melakukan kompensasi ke ${checkCompent.position} dengan jumlah ${Math.ceil(parseInt(jumlahTrade))}`));

                                                    await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                                    const foo16 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                                    await foo16.click({ clickCount: 3 });
                                                    await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString());

                                                    const indexOfTimeLost = timeArray.findIndex(x => x.includes(element));
                                                    const nextSignal = timeArray[indexOfTimeLost + 1];

                                                    if (nextSignal) {

                                                        await page.evaluate(() => document.querySelector("#qa_trading_dealDownButton > button").click());


                                                        await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                                        const foo17 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                                        await foo17.click({ clickCount: 3 });
                                                        await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString());



                                                        await delay(60000);

                                                        await page.waitForSelector('#trade > div > div > app-toasts > app-option-toast > div > span.currency');
                                                        let profitCheckAfterCompen = await page.$('#trade > div > div > app-toasts > app-option-toast > div > span.currency');
                                                        let profitCheckValueAfterCompen = await page.evaluate(el => el.textContent, profitCheckAfterCompen);
                                                        if (profitCheckValueAfterCompen.substring(2) == '0,00' || profitCheckValueAfterCompen.substring(2) == '0.00') {
                                                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Kompensasi ke ${checkCompent.position} tidak menghasilkan :'( : ${profitCheckValueAfterCompen}`));
                                                            myCache.set('compent', {
                                                                position: checkCompent.position + 1,
                                                                to: parseInt(compent),
                                                                amount: Math.ceil(parseInt(jumlahTrade)).toString()
                                                            })



                                                            if (checkCompent.position == checkCompent.to) {
                                                                myCache.del('compent')
                                                                await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                                                const foo18 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                                                await foo18.click({ clickCount: 3 });
                                                                await page.keyboard.type(Math.ceil(parseInt(amount)).toString());
                                                            }

                                                        } else {
                                                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Kompensasi ke ${checkCompent.position} profit : ${profitCheckValueAfterCompen}`));
                                                            myCache.del('compent')
                                                            await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                                            const foo19 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                                            await foo19.click({ clickCount: 3 });
                                                            await page.keyboard.type(Math.ceil(parseInt(amount)).toString());
                                                        }
                                                    }
                                                }
                                            } while (checkCompent);
                                        }
                                    }
                                    await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                    const foo20 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                    await foo20.click({ clickCount: 3 });
                                    await page.keyboard.type(Math.ceil(parseInt(amount)).toString());
                                } else {
                                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Kompensasi profit : ${profitCheckValueAfterCompen}`));
                                    myCache.del('compent');
                                    await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                    const foo21 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                    await foo21.click({ clickCount: 3 });
                                    await page.keyboard.type(Math.ceil(parseInt(amount)).toString());
                                }
                                await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                                const foo22 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                                await foo22.click({ clickCount: 3 });
                                await page.keyboard.type(Math.ceil(parseInt(amount)).toString());
                                console.log('')
                            } else {
                                console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow('Tidak ada sinyal selanjutnya.'));
                                process.exit(0);
                            }

                        } else {
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Profit guys : ${profitCheckValue}`));
                            await page.waitForSelector("#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text");
                            const foo23 = await page.$('#amount-counter > div.input_input-group__39TBc > div.input_input-helper__17cT2 > vui-input-number > input[type=text');
                            await foo23.click({ clickCount: 3 });
                            await page.keyboard.type(Math.ceil(parseInt(amount)).toString());
                        }

                        console.log('');
                        await delay(2000);
                    }


                }



            });

        }

    }



})();