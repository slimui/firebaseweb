module.exports = class UserOnCreate {
  constructor({ emailService }) {
    this.emailService = emailService;
  }

  getFunction() {
    return e => this.emailService.sendGoodbyeEmail(e.data);
  }
};
