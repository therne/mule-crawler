
const nodemailer = require('nodemailer');
const request = require('superagent');
const cheerio = require('cheerio');
const config = require('./config');

const keyword = process.argv[2];
if (!keyword) {
    console.log('usage: node crawler.js [keyword]');
    return;
}

// Mule에 관한 설정
const searchUrl = 'http://www.mule.co.kr/instrument/2/bbslist.aspx?sort=15&page=1&searchregion=5&searchword=';
const muleUrlPath = 'http://www.mule.co.kr/instrument/2/';
const mulePrefix = '#ctl00_ctl00_ctl00_content_content_subcontent_ListView1_ctrl0_';

const mail = nodemailer.createTransport({
    service: 'Gmail',
    auth: config.email
});

let latest = 0, isFirst = true;

async function crawl() {
    const res = await request(searchUrl + keyword);
    if (!res) return;

    const $ = cheerio.load(res.text);

    // 최신 게시글인지 체크
    const number = parseInt($(mulePrefix + 'lblNum').text());
    if (!number) {
        console.log('error: no search result');
        process.exit(1);
    }
    if (number > latest) {
        latest = number;

        const link = config.root + $(mulePrefix + 'HyperLink1').attr('href');
        const title = $(mulePrefix + 'Label1').text();
        const date = $(mulePrefix + 'wdateLabel').text();

        // 맨 첫번째는 마지막 게시물을 알아보기 위한 용도로 사용되기때문에
        // 메일을 보내지 않음.
        if (isFirst) {
            isFirst = false;
            console.log(`latest article ${title} is written at ${date}`);
            return;
        }

        console.log(`[Catched] ${title} at ${date}`);

        mail.sendMail({
            from: 'ThCrawler <crawler@thedeblur.com>',
            to: config.email.user,
            subject: `새로운 중고품 (${date}) : ${title}`,
            text: link
        });
    }
}

crawl(); // 처음에 latest number를 알아오기 위함
setInterval(crawl, config.interval);
console.log(`[Mule] ${keyword} crawler started.`);
