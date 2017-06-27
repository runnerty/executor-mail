# Mail executor for [Runnerty]:

### Configuration sample:
```json
{
  "id": "mail_default",
  "type": "@runnerty-executor-mail",
  "disable": false,
  "from": "Runnerty Notificator <my@sender.com>",
  "transport": "smtp://my%mailsender.com:pass@smtp.host.com/?pool=true",
  "bcc":["mycc@mail.com"],
  "templateDir": "/etc/runnerty/templates",
  "template": "alerts",
  "ejsRender": true
}
```

### Plan sample:
```json
{ "id":"mail_default",  
  "to": ["my@mail.com"],
  "title": "Runnerty Mailer",
  "message": "My message from Runnerty!",
  "attachments": [{
    "filename": "sample.png",
    "path": "/etc/runnerty/templates/alerts/images/sample.png",
    "cid": "img_name@sample.png"
   }]
}
```

### EJS Template sample:
#### Plan:
```json
{ "id":"mail_default",  
  "to": ["my@mail.com"],
  "title": "Runnerty Mailer",
  "message": "My message from Runnerty!",
  "args": {"value_one":"Hello", "value_two":"world!", "value_three":":YYYY"}
}
```
#### HTML Template:
```html
<html>
  <head>
  <title><%= args.value_one %> <%= args.value_two %></title>
  </head>
  <body>
  <%= args.value_three %>
  </body>
</html>
```

## Want to help?

Want to file a bug, contribute some code, or improve documentation? Excellent! Read up on our
guidelines for [contributing][contributing].

[contributing]: https://github.com/Coderty/runnerty/blob/master/CONTRIBUTING.md
[Runnerty]: http://www.runnerty.io
