const { Schema, model } = require('mongoose')
const tokenModel = require('./token-model')

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  registrationTime: { type: Date, required: true },
  lastLoginTime: { type: Date },
  status: { type: String, default: 'active' }
})

UserSchema.pre('deleteOne', { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getFilter());
  await tokenModel.deleteOne({ user: doc._id });
});

module.exports = model('User', UserSchema)