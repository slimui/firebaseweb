module.exports = class EmailService {
  constructor({ mailTransport }) {
    this.mailTransport = mailTransport;
    this.appName = 'ShopTrends';
  }

  sendWelcomeEmail({ email, displayName }) {
    const mailOptions = {
      from: '"ShopTrends" <noreply@firebase.com>',
      to: email,
      subject: `Welcome to ${this.appName}!`,
      text: `Hi!, Welcome to ${this.appName}. Thank You for signing up with ShopTrends. We’re really happy to have you. Our goal is to help you discover and purchase celebrity and designer fashion and to make this experience as easy and fun as possible. 
We hope you enjoy using ShopTrends and discover a whole new world of designers and brands. We would also love to hear your feedback. Please email us at support@shoptrends.co with your thoughts.
Have fun shopping !

Thanks,
Team ShopTrends
www.shoptrends.co `
    };

    return this.mailTransport.sendMail(mailOptions).then(() => {
      const message = `New welcome email sent to: ${email}`;
      console.log(message);
      return message;
    });
  }

    sendGoodbyeEmail({ email, displayName }) {
    const mailOptions = {
      subject: 'Bye!',
      from: '"ShopTrends" <noreply@firebase.com>',
      to: email,
      text: `Hey ${displayName}!, We confirm that we have deleted your ${this.appName} account. We are Sorry to see you leave. If you could spare a moment, we would like to know why you are leaving and any thoughts you had on what it would take for us to bring you back on ShopTrends. 
  Please email us at support@shoptrends.co with your thoughts.

  Thanks,
  Team SHopTrends
  www.shoptrends.co`
    };

    return this.mailTransport.sendMail(mailOptions).then(() => {
      const message = `Account deletion confirmation email sent to: ${email}`;
      console.log(message);
      return message;
    });
  }
};
