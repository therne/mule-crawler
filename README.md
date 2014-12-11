Mule Crawler
============

Mule 악기 중고장터에 새 매물이 올라오면 이메일을 통해서 알림을 보냅니다.

![이미지](http://i58.tinypic.com/2100ok2.png)<br/>

설치 및 사용방법
-------
모듈 의존성을 설치합니다.
<pre>npm install</pre>

config.json을 수정하여 이메일 계정 및 크롤링 주기를 설정하세요.

그리고, 실행
<pre>node crawler.js [검색 키워드]</pre>

혹은, [forever](https://github.com/nodejitsu/forever)를 이용해서 실행시킬 수도 있습니다.
<pre>forever start crawler.js [검색 키워드]</pre>

설정 (config.json)
-------
***email*** : Gmail 계정을 설정합니다. 해당 계정을 SMTP로 이용해, 해당 계정에 알림을 보냅니다.<br>
***interval*** : 확인 주기를 설정합니다. (ms)
