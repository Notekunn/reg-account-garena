const request = require("request-promise").defaults({ json: true });
const crypto = require("crypto");
const fs = require("fs");
let totalUser = require("./account.json").length + 10;
const SSO_URL = "https://sso.garena.com/api";
const AZCAPTCHA_KEY = "3zjrmkvw4yh8gftdrnflb7wqnybpjqp2"
const CAPTCHA_URL = "https://captcha.garena.com/image?key=";
const REDIRECT_URL = "https://sso.garena.com/ui/login?app_id=10100&redirect_uri=https%3A%2F%2Faccount.garena.com%2F%3Flocale_name%3DVN&locale=vi-VN";
const ecryptPassword = "6337b65ec5d995cd13d4e503de107efd6f83bfa1035e1b1c1fe97a3431f8394a0c894514d081b2bcece353788a856314e1152a96dda223162eea5e013f7c235caa13c0fbad0a6aa4253a8f082686e4ed1ad96fd560c08bde177e68a0adffe633c2e7ef10d53b35ce09e461d6ebc9ba13a09c087f9b1fce7dc5b4eae351005654";

const createRandomHash = (seed = 4) => crypto.randomBytes(seed).toString("hex").slice(0, seed)
const getCaptcha = (key) => {
    return request({
        url: `${CAPTCHA_URL}${key}`,
        encoding: null
    })
}
const createRandomUserName = (seed) => seed + (++totalUser);
const register = ({ username, captcha, captcha_key }) => {
    return request.post({
        url: `${SSO_URL}/register`,
        form: {
            username,
            email: "",
            password: ecryptPassword,
            location: "VN",
            redirect_uri: REDIRECT_URL,
            captcha_key,
            captcha,
            format: "json",
            id: Math.floor((new Date()).getTime() / 1000)
        },
        json: true
    })
}
const getResult = async function get(id){
    let result = await request({
            method: 'GET',
            url: 'http://azcaptcha.com/res.php',
            qs: {
                key: AZCAPTCHA_KEY,
                action: 'get',
                id,
                json: '1'
            }
    });
    if(result.request == "CAPCHA_NOT_READY") return await get(id);
    return result.request;
}
const sloveCaptcha = async function() {
    try {
        const options = {
            method: 'POST',
            url: 'http://azcaptcha.com/in.php',
            formData: {
                key: AZCAPTCHA_KEY,
                method: 'post',
                json: '1',
                file: {
                    value: fs.createReadStream("./public/captcha.png"),
                    options: {
                        filename: 'captcha.png',
                        contentType: null
                    }
                }
            }
        };

        let solve = await request(options);
        if(solve.status == 0) {
            console.log(solve.request);
            return undefined;
        }
        let captcha = await getResult(solve.request);
        console.log("Captcha: " + captcha);
        return captcha;
    }
    catch (e) {
        console.log("Co loi xay ra: " + e);
        return 12345;
    }
}

// const encryptPassword = ({password, v1, v2}) =>{
//     const passwordMd5 = crypto.createHash('md5').update(password).digest("hex");

// }
module.exports = {
    SSO_URL,
    createRandomHash,
    getCaptcha,
    createRandomUserName,
    register,
    sloveCaptcha
}
