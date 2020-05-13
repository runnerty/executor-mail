'use strict';

const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const fsp = require('fs').promises;

const Execution = global.ExecutionClass;

class mailExecutor extends Execution {
  constructor(process) {
    super(process);
  }

  exec(res) {
    if (res.disable) {
      this.logger.log('warn', 'Mail sender is disable.');
      let endOptions = {
        end: 'end',
        messageLogType: 'warn',
        messageLog: 'Mail sender is disable.',
        err_output: 'Mail sender is disable.',
        msg_output: 'Mail sender is disable.'
      };
      this.end(endOptions);
    } else {
      this.sendMail(res);
    }
  }

  async sendMail(res) {
    try {
      const mail = res;
      mail.params = {};

      if (!res.to) throw new Error('Mail TO, not setted');
      mail.to = res.to.join(',');
      if (res.cc) mail.cc = res.cc.join(',');
      if (res.bcc) mail.bcc = res.bcc.join(',');

      mail.params.subject = res.title;
      mail.params.message = res.message;

      const templateDir = path.resolve(mail.templateDir, mail.template);
      const htmlTemplate = path.resolve(templateDir, 'html.html');
      const txtTemplate = path.resolve(templateDir, 'text.txt');

      const html_data = await fsp.readFile(htmlTemplate);
      const text_data = await fsp.readFile(txtTemplate);

      const options = {
        useArgsValues: true,
        useProcessValues: true,
        useGlobalValues: true,
        useExtraValue: mail.params
      };

      let [html, text] = await Promise.all([
        this.paramsReplace(html_data.toString(), options),
        this.paramsReplace(text_data.toString(), options)
      ]);

      if (mail.ejsRender) {
        html = ejs.render(html, mail);
        text = ejs.render(text, mail);
      }

      const mailOptions = {
        from: mail.from,
        to: mail.to,
        cc: mail.cc,
        bcc: mail.bcc,
        subject: mail.params.subject,
        text: text,
        html: html,
        attachments: mail.attachments
      };

      const transport = nodemailer.createTransport(mail.transport);
      await transport.sendMail(mailOptions);
      this.end();
    } catch (err) {
      const endOptions = {
        end: 'error',
        messageLog: `Error sending mail: ${err.message}`,
        err_output: `Error sending mail: ${err.message}`
      };
      this.end(endOptions);
    }
  }
}

module.exports = mailExecutor;
