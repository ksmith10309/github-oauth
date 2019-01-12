'use strict';

import superagent from 'superagent';

import User from '../model.js'; 

const authorize = (req) => {
  // GitHub redirects back to my site with a temporary code
  let code = req.query.code;

  // Exchange this code for an access token
  return superagent.post('https://github.com/login/oauth/access_token')
    .send({
      code: code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: `${process.env.API_URL}/oauth`,
    })

    // Response takes the form of an access token with a token type of bearer
    .then(response => {
      let githubToken = response.body.access_token;
      return githubToken;
    })

    // Use access token to make requests to the API on behalf of user
    .then(token => {
      return superagent.get(`https://api.github.com/user?access_token=${token}`)
        .then(response => {
          let user = response.body;
          return user;
        });
    })

    .then(user => {
      return User.createFromOAuth(user);
    })

    .catch(error => error);
    
};

export default {authorize};
