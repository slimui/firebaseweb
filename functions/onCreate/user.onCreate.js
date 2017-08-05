module.exports = class UserOnCreate {
  constructor({ emailService }) {
    this.emailService = emailService;
  }

  getFunction() {
    return e => this.emailService.sendWelcomeEmail(e.data);
  }
};
