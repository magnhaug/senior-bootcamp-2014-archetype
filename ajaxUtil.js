var request = require('request');

function getUrl(url, user, pass, func) {

    request.get({
            url: url,
            json: true,
            auth: {
                user: user,
                pass: pass,
                sendImmediately: false
            },
            headers: {
                'User-Agent': 'request'
            }
        },
        function (error, response, body) {
            if (error) {
                console.log("an error has occured. keep calm and carry on.", error);
            }
            func(body);
        });
}

exports.get = getUrl;