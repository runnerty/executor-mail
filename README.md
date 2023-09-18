<p align="center">
  <a href="http://runnerty.io">
    <img height="257" src="https://runnerty.io/assets/header/logo-stroked.png">
  </a>
  <p align="center">Smart Processes Management</p>
</p>

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Dependency Status][david-badge]][david-badge-url]
<a href="#badge">
<img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg">
</a>

# Mail executor for [Runnerty]:

Email notification module with [ejs] template support.

### Installation:

```bash
npm i @runnerty/executor-mail
```

You can also add modules to your project with [runnerty]

```bash
npx runnerty add @runnerty/executor-mail
```

This command installs the module in your project, adds example configuration in your [config.json] and creates an example plan of use.

If you have installed [runnerty] globally you can include the module with this command:

```bash
runnerty add @runnerty/executor-mail
```

### Configuration samples:

Add in [config.json]:

```json
{
  "id": "mail_default",
  "type": "@runnerty-executor-mail",
  "disable": false,
  "from": "Runnerty Notificator <sample@runnerty.io>",
  "transport": "smtp://my%mailsender.com:pass@smtp.host.com/?pool=true",
  "bcc": ["mycc@mail.com"],
  "templateDir": "/etc/runnerty/templates",
  "template": "alerts",
  "ejsRender": true
}
```

```json
{
  "id": "mail_aws_ses_iam_smtp",
  "type": "@runnerty-executor-mail",
  "disable": false,
  "from": "Runnerty <hello@runnerty.io>",
  "transport": {
    "host": "email-smtp.eu-west-1.amazonaws.com",
    "port": 465,
    "secure": true,
    "auth": {
      "user": "aws_ses_user",
      "pass": "aws_ses_pass"
    }
  },
  "templateDir": "/etc/runnerty/templates",
  "template": "alerts",
  "ejsRender": true
}
```

To use AWS SES [transport]:

```json
{
  "id": "mail_aws_ses_role",
  "type": "@runnerty-executor-mail",
  "from": "Runnerty <hello@runnerty.io>",
  "transport": {
    "service": "SES",
    "region": "us-east-1",
    "ses": {
      // optional extra arguments for SendRawEmail
      "Tags": [
        {
          "Name": "tag_name",
          "Value": "tag_value"
        }
      ]
    }
  },
  "templateDir": "/etc/runnerty/templates",
  "template": "alerts",
  "ejsRender": true
}
```

### Plan sample:

Add in [plan.json]:

```json
{
  "id": "mail_default",
  "to": ["my@mail.com"],
  "title": "Runnerty Mailer",
  "message": "My message from Runnerty!",
  "attachments": [
    {
      "filename": "sample.png",
      "path": "/etc/runnerty/templates/alerts/images/sample.png",
      "cid": "img_name@sample.png"
    }
  ]
}
```

### EJS Template sample:

#### Plan:

```json
{
  "id": "mail_default",
  "to": ["my@mail.com"],
  "title": "Runnerty Mailer",
  "message": "My message from Runnerty!",
  "args": { "value_one": "Hello", "value_two": "world!", "value_three": ":YYYY" }
}
```

#### HTML Template:

```html
<html>
  <head>
    <title><%= value_one %> <%= value_two %></title>
  </head>
  <body>
    <%= value_three %>
  </body>
</html>
```

## Want to help?

Want to file a bug, contribute some code, or improve documentation? Excellent! Read up on our
guidelines for [contributing][contributing].

[contributing]: https://github.com/runnerty/runnerty/blob/master/CONTRIBUTING.md
[runnerty]: https://www.runnerty.io
[downloads-image]: https://img.shields.io/npm/dm/@runnerty/executor-mail.svg
[npm-url]: https://www.npmjs.com/package/@runnerty/executor-mail
[npm-image]: https://img.shields.io/npm/v/@runnerty/executor-mail.svg
[david-badge]: https://david-dm.org/runnerty/executor-mail.svg
[david-badge-url]: https://david-dm.org/runnerty/executor-mail
[config.json]: http://docs.runnerty.io/config/
[plan.json]: http://docs.runnerty.io/plan/
[transport]: https://nodemailer.com/transports/ses/
[ejs]: https://ejs.co
