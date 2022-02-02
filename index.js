'use strict';

const nodemailer = require('nodemailer');
const aws = require('@aws-sdk/client-ses');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const ejs = require('ejs');
const path = require('path');
const fsp = require('fs').promises;

const Executor = require('@runnerty/module-core').Executor;

class mailExecutor extends Executor {
  constructor(process) {
    super(process);
  }

  exec(params) {
    if (params.disable) {
      this.logger.log('warn', 'Mail sender is disable.');
      const endOptions = {
        end: 'end',
        messageLogType: 'warn',
        messageLog: 'Mail sender is disable.',
        err_output: 'Mail sender is disable.',
        msg_output: 'Mail sender is disable.'
      };
      this.end(endOptions);
    } else {
      this.sendMail(params);
    }
  }

  async sendMail(res) {
    try {
      const mail = res;
      mail.params = {};

      if (!res.devMode) {
        if (!res.from) throw new Error('Mail FROM, not setted');
        mail.from = res.from;
        if (!res.to?.length) throw new Error('Mail TO, not setted or array is empty');
        mail.to = res.to.join(',');
        if (res.cc?.length) mail.cc = res.cc.join(',');
        if (res.bcc?.length) mail.bcc = res.bcc.join(',');
      } else if (res.devMode && res.devOptions) {
        delete mail.to, mail.cc, mail.bbc;
        if (!res.from && !res.devOptions.from) throw new Error('Mail FROM, not setted in dev options nor regular mode');
        mail.from = res.devOptions.from ? res.devOptions.from : res.from;
        if (!res.devOptions.to?.length) throw new Error('Mail TO, not setted or array is empty in dev options');
        mail.to = res.devOptions.to.join(',');
        if (res.devOptions.cc?.length) mail.cc = res.devOptions.cc.join(',');
        if (res.devOptions.bcc?.length) mail.bcc = res.devOptions.bcc.join(',');
      } else {
        throw new Error('Dev options not setted in config');
      }

      mail.params.subject = res.subject || res.title;
      mail.params.message = res.message;

      let html,
        text = undefined;

      if (mail.templateDir && mail.template) {
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

        [html, text] = await Promise.all([
          this.paramsReplace(html_data.toString(), options),
          this.paramsReplace(text_data.toString(), options)
        ]);

        if (mail.ejsRender) {
          const args = { ...mail, ...(mail.args && typeof mail.args === 'object' ? mail.args : {}) };
          if (mail.partialsDir && mail.partials) {
            const partialsDir = path.resolve(mail.partialsDir, mail.partials);
            args.partialsDir = partialsDir;
          }
          html = ejs.render(html, args);
          text = ejs.render(text, args);
        }
      }

      const mailOptions = {
        from: mail.from,
        to: mail.to,
        cc: mail.cc,
        bcc: mail.bcc,
        subject: mail.params.subject,
        text: typeof text !== 'undefined' ? text : mail.params.message,
        html: typeof html !== 'undefined' ? html : mail.params.message,
        attachments: mail.attachments
      };

      // SES Transport
      if (mail.transport?.service === 'SES') {
        if (!mail.transport.region) throw new Error('Must indicate the region to use SES transport');

        const ses = new aws.SES({
          apiVersion: '2010-12-01',
          region: mail.transport.region,
          defaultProvider
        });

        const transport = nodemailer.createTransport({ SES: { ses, aws } });

        if (mail.transport.ses) {
          mailOptions.ses = Object.assign(mail.transport.ses, mail.ses);
        }
        await transport.sendMail(mailOptions);
      } else {
        // SMTP Transport
        const transport = nodemailer.createTransport(mail.transport);
        await transport.sendMail(mailOptions);
      }

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
