'use strict';

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  name: {type: String, required: true},
  id: {type: String},
});

// Before we save, hash the plain text password
userSchema.pre('save', function(next) {
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      // Update the password for this instance to the hashed version
      this.password = hashedPassword;
      // Continue on (actually do the save)
      next();
    })
    // In the event of an error, do not save, but throw it instead
    .catch(error => {
      throw error;
    });
});

userSchema.statics.createFromOAuth = function(incoming) {
  if (!incoming || !incoming.login) {
    return Promise.reject('VALIDATION ERROR: missing username/email or password ');
  }
  return this.findOne({username:incoming.login})
    .then(user => {
      if (!user) throw new Error ('User Not Found');
      return user;
    })
    .catch(error => {
    // Create the user
      return this.create({
        username: incoming.login,
        password: incoming.node_id,
        name: incoming.name,
        id: incoming.id,
      });
    });
};

export default mongoose.model('users', userSchema);
