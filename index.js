const readlineSync = require("readline-sync");
const utils = require("./utils");
const fs = require("fs");
const accounts = require("./account.json");
const chalk = require("chalk");
async function doTask() {
    try {
        const captchaKey = utils.createRandomHash(18);

        const captchaImage = await utils.getCaptcha(captchaKey);

        fs.writeFileSync("./public/captcha.png", captchaImage);
        
        const captcha = (await utils.sloveCaptcha()) || readlineSync.question(chalk.red("Nhap captcha: "));

        const username = utils.createRandomUserName("clonebmn");

        const result = await utils.register({ username, captcha, captcha_key: captchaKey });
        if (result && !result.error) {
            accounts.push({
                username,
                password: "cuongdeptrai@123", //khong thay pass dc
                uid: result.uid
            });
            fs.writeFileSync("./account.json", JSON.stringify(accounts, null, "\t"));
            console.log(chalk.blue("Đăng ký thành công tài khoản ") + chalk.red(username));
        }
        else console.log(chalk.red("Đăng ký thất bại: ") + result.error);
    }
    catch (e) {}
}

async function exec() {
    await doTask();
    exec();
}

exec();
