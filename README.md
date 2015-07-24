## UtahJS Conference Call for Papers

A simple Express app to allow submitting presentation proposals

Install and Test
----------------

```bash
git clone https://github.com/kensnyder/utahjs-cfp.git ~/utahjs-cfp

pushd ~/utahjs-cfp

npm install

grunt --force

npm start
```

Edit your `/etc/hosts`
```
127.0.0.1 localhost.conf.utahjs.com
```

Test in your browser

<http://localhost.conf.utahjs.com:3001>

To Deploy
---------

```bash
git push heroku master
```

[More info](https://devcenter.heroku.com/articles/git)
