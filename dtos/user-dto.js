module.exports = class UserDto {
  email;
  name;
  id;
  registrationTime;
  lastLoginTime;
  status;

  constructor(model) {
    this.email = model.email
    this.id = model._id
    this.registrationTime = model.registrationTime
    this.lastLoginTime = model.lastLoginTime
    this.status = model.status
    this.name = model.name
  }
}