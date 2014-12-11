'use strict';

var util = require('util');
var nodemailer = require('nodemailer');
var request = require('request');
var config = require('./config');
var cheerio = require('cheerio');
var async = require('async');

// Mule에 관한 설정
var muleUrlFormat = 'http://www.mule.co.kr/instrument/2/bbslist.aspx?sort=15&page=1&searchword=%s&searchregion=5';
var muleUrlPath = 'http://www.mule.co.kr/instrument/2/';
var mulePrefix = '#ctl00_ctl00_ctl00_content_content_subcontent_BBSList1_ListView1_ctrl0_';

var mail = nodemailer.createTransport({
    service: 'Gmail',
    auth: config.email
});

var latest = 0, isFirst = true;
var keyword = process.argv[2];
if (!keyword) {
    console.log('usage: node crawler.js [keyword]');
    return;
}

function crawl() {
    async.waterfall([
        function getPage(next) {
            request(util.format(muleUrlFormat, keyword), next);
        },
        function checkThePageIsNew(res, body, next) {
            if (!body) return;
            var $ = cheerio.load(body);

            // 최신 게시글인지 체크
            var number = parseInt($(mulePrefix + 'lblNum').text());
            if (!number) {
                console.log('error: no search result');
                process.exit(1);
            }
            if (number > latest) {
                latest = number;

                var link = config.root + $(mulePrefix + 'HyperLink1').attr('href');
                var title = $(mulePrefix + 'Label1').text();
                var date = $(mulePrefix + 'wdateLabel').text();

                // 맨 첫번째는 마지막 게시물을 알아보기 위한 용도로 사용되기때문에
                // 메일을 보내지 않음.
                if (isFirst) {
                    isFirst = false;
                    console.log('latest article ' + number + ' is written at ' + date);
                    return next(null);
                }

                console.log('[Catched] ' + title + ' at ' + date);

                mail.sendMail({
                    from: 'ThCrawler <crawler@thedeblur.com>',
                    to: config.email.user,
                    subject: util.format('새로운 중고품 (%s) : %s', date, title),
                    text: link
                }, next);

            } else next(null);
        }
    ], function(err) {
        if (err) console.log(err.stack);
    });
}

crawl(); // 처음에 latest number를 알아오기 위함
setInterval(crawl, config.interval);
console.log("[Mule] " + keyword + " Crawler Started!");
