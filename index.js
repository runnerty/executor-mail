"use strict";

const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const Execution = global.ExecutionClass;

function readFilePromise(type, file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      let res = {};
      if (err) {
        res[type] = err;
        reject(res);
      } else {
        res[type] = data;
        resolve(res);
      }
    });
  });
}

class mailExecutor extends Execution {
  constructor(process) {
    super(process);
  }

  exec(res) {
    let _this = this;
    let mail = res;
    mail.params = {};

    if (res.to) {
      mail.to = res.to.join(",");
      if (res.cc) {
        mail.cc = res.cc.join(",");
      }
      if (res.bcc) {
        mail.bcc = res.bcc.join(",");
      }
      mail.params.subject = res.title;
      mail.params.message = res.message;

      const templateDir = path.resolve(mail.templateDir, mail.template);
      const htmlTemplate = path.resolve(templateDir, "html.html");
      const txtTemplate = path.resolve(templateDir, "text.txt");

      Promise.all([readFilePromise("html", htmlTemplate), readFilePromise("text", txtTemplate)])
        .then(async res => {
          let [html_data_file, text_data_file] = res;
          let html_data = html_data_file.html.toString();
          let text_data = text_data_file.text.toString();

          const options = {
            useArgsValues: true,
            useProcessValues: true,
            useGlobalValues: true,
            useExtraValue: mail.params
          };
          let [html, text] = await Promise.all([
            _this.paramsReplace(html_data, options),
            _this.paramsReplace(text_data, options)
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

          if (mail.disable) {
            _this.logger.log("warn", "Mail sender is disable.");
            let endOptions = {
              end: "end",
              messageLogType: "warn",
              messageLog: "Mail sender is disable.",
              err_output: "Mail sender is disable.",
              msg_output: "Mail sender is disable."
            };
            _this.end(endOptions);
          } else {
            let transport = nodemailer.createTransport(mail.transport);

            transport.sendMail(mailOptions, err => {
              if (err) {
                const endOptions = {
                  end: "error",
                  messageLog: `Error sending mail (sendMail): ${JSON.stringify(err)}`,
                  err_output: `Error sending mail: ${JSON.stringify(err)}`
                };

                _this.end(endOptions);
              } else {
                _this.end();
              }
            });
          }
        })
        .catch(err => {
          const endOptions = {
            end: "error",
            messageLog: `Error sending mail: ${JSON.stringify(err)}`,
            err_output: `Error sending mail: ${JSON.stringify(err)}`
          };
          _this.end(endOptions);
        });
    } else {
      const endOptions = {
        end: "error",
        messageLog: "Error Mail to not setted.",
        err_output: "Error Mail to not setted.",
        msg_output: ""
      };
      _this.end(endOptions);
    }
  }
}

module.exports = mailExecutor;
