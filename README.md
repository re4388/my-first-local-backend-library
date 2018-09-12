前置作業

1.安裝NVM, NPM, NODE, EXPRESS都已經安裝好
https://github.com/creationix/nvm/blob/master/README.md#installation


1.1
install or update nvm  in command line

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash


1.2
Verify installation

command -v nvm

1.3
To download, compile, and install the latest release of node, do this:

nvm install node


1.4
And then in any new shell just use the installed version:

nvm use node



2.安裝，express 

終端輸入

npm install express-generator -g

此為安裝application generator

3.此例我們安裝pug這個view engine, 另外我們css engine不安裝，database先不安裝

4. 終端輸入下面指令，會產生很多檔案，pjt_name選用自己要取的專案名字

express pjt_name --view=pug


5. 建立好了，會跑出如下畫面， 說明如何安裝需要的dependencies(already listed in the Package.jason file)，和啟動server

create : express-locallibrary-tutorial
   create : express-locallibrary-tutorial/package.json
   create : express-locallibrary-tutorial/app.js
   create : express-locallibrary-tutorial/public/images
   create : express-locallibrary-tutorial/public
   create : express-locallibrary-tutorial/public/stylesheets
   create : express-locallibrary-tutorial/public/stylesheets/style.css
   create : express-locallibrary-tutorial/public/javascripts
   create : express-locallibrary-tutorial/routes
   create : express-locallibrary-tutorial/routes/index.js
   create : express-locallibrary-tutorial/routes/users.js
   create : express-locallibrary-tutorial/views
   create : express-locallibrary-tutorial/views/index.pug
   create : express-locallibrary-tutorial/views/layout.pug
   create : express-locallibrary-tutorial/views/error.pug
   create : express-locallibrary-tutorial/bin
   create : express-locallibrary-tutorial/bin/www

   install dependencies:
     > cd express-locallibrary-tutorial && npm install

   run the app:
     > SET DEBUG=express-locallibrary-tutorial:* & npm start


6. 為了之後對於server的修改，另外安裝一個dev-dependencies來讓sever會自動啟動（只要你修改內容）。

6.1 終端輸入：

npm install --save-dev nodemon

-dev表示這個depndencis是在dev下

6.2 確認在你的案子下的package.json有下面的顯示

"devDependencies": {
    "nodemon": "^1.14.11"
  }


6.3 除非我們透過patch來加入這個dependencis, 所以我們無法在終端globally呼叫，我們需要可以透過Npm在終端呼叫，用下面指令：

Window:
SET DEBUG=express-locallibrary-tutorial:* & npm run devstart

Mac:
DEBUG=express-locallibrary-tutorial:* npm run devstart

or in this case:



6.4 不過我們需要加入下面指令在我們的scripts section of your package.json.

"scripts": {
    "start": "node ./bin/www",
    "devstart": "nodemon ./bin/www"
  },



7. Package.jason說明

基本上這個檔案是定義了這個應用程式的相依應用和其他資訊

{
  "name": "my-first-local-backend-library",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start": "node ./bin/www",
    "devstart": "nodemon ./bin/www"     
  },
  "dependencies": {
    "cookie-parser": "~1.4.3",   //用來讀cookie header 和產生req.cookies
    "debug": "~2.6.9",     //一個小的nod除錯工具處理器 A tiny node debugging utility 
    "express": "~4.16.0",   //當然會用到package
    "http-errors": "~1.6.2",
    "morgan": "~1.9.0",   //HTTP request logger 
    "pug": "2.0.0-beta11"   // view engine
  },
  "devDependencies": {
    "nodemon": "^1.18.4"   //自動啟動
  }
}

7.1 其他可以裝的相依應用：

body-parser(make http POST req中的body的exract easier)
serve-favicon: Node middleware for serving a favicon (this is the icon used to represent the site inside the browser tab, bookmarks, etc.).





