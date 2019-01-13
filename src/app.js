'use strict';

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import authRouter from './auth/router.js';

let app = express();

app.set('view engine', 'ejs');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static('./public'));

app.use(authRouter);

app.get('/', (req, res) => {
  let githubURL = 'https://github.com/login/oauth/authorize';
  let QueryString = `client_id=78154fe1dda516155fa5`;
  let authURL = `${githubURL}?${QueryString}`;
  res.render('home', {url: authURL});
});

app.use('*', (req, res) => {
  res.statusCode = 404;
  res.statusMessage = 'Not Found';
  res.setHeader('Content-Type', 'text/html');
  res.render('404');
});

app.use((err, req, res, next) => {
  res.statusCode = err.status || 500;
  res.statusMessage = err.message || 'Server Error';
  res.setHeader('Content-Type', 'text/html');
  console.log('ERROR: ', err);
  res.render('error', {error: res.statusCode, message: res.statusMessage});
});

let server = false;

module.exports = {
  start: (port) => {
    if(!server) {
      server = app.listen(port, (err) => {
        if(err) { throw err; }
        console.log('Server running on', port);
      });
    }
    else {
      console.log('Server is already running');
    }
  },

  stop: () => {
    server.close( () => {
      console.log('Server is now off');
    });
  },
};
