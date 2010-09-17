# node-facebook

Borrowing some ideas from the [PHP SDK](http://github.com/facebook/php-sdk) to connect to the Facebook API via node.js

The access_token utilized to make calls is currently retrieved from the request cookie headers. Therefore all calls must pass along a request with a 'cookies' property containing the parsed cookie header (i.e. req.cookies). A more flexible approach will come soon or feel free to fork.

Still a lot to add on and move around but it's a start.

Also see:

  - [http://coolaj86.github.com/articles/facebook-with-node.js.html](http://coolaj86.github.com/articles/facebook-with-node.js.html)
  - [http://developers.facebook.com/docs/authentication/](http://developers.facebook.com/docs/authentication/)
