var sys = require('sys'),
    crypto = require('crypto'),
    http = require('http'),
    querystring = require('querystring'),
    phpjs = require('./phpjs'),
    EventEmitter = require('events').EventEmitter;

function Facebook (config) {
  if (!(this instanceof Facebook)) {
    return new Facebook(config);
  };
  
  this.appId = '';
  this.apiKey = '';
  this.appSecret = '';
  
  for (var key in config) {
    this[key] = config[key];
  };
};
sys.inherits(Facebook, EventEmitter);
module.exports = Facebook;

Facebook.prototype.callRest = function (req, params, callback) {
  var self = this;
  
  params['api_key'] = this.appId;
  params['format'] = 'json-strings';
  
  this._oauthRequest(req, this.getApiUrl(params['method']), 'POST', 'restserver.php', params, callback);
};

Facebook.prototype.callGraph = function (req, path, callback, method, params) {
  var self = this;
  
  method = method || 'GET';
  
  this._oauthRequest(req, Facebook.DOMAIN_MAP['graph'], method, path, {}, callback);
};

Facebook.prototype.getApiUrl = function(method) {
  var READ_ONLY_CALLS = {
    'admin.getallocation': 1,
    'admin.getappproperties': 1,
    'admin.getbannedusers': 1,
    'admin.getlivestreamvialink': 1,
    'admin.getmetrics': 1,
    'admin.getrestrictioninfo': 1,
    'application.getpublicinfo': 1,
    'auth.getapppublickey': 1,
    'auth.getsession': 1,
    'auth.getsignedpublicsessiondata': 1,
    'comments.get': 1,
    'connect.getunconnectedfriendscount': 1,
    'dashboard.getactivity': 1,
    'dashboard.getcount': 1,
    'dashboard.getglobalnews': 1,
    'dashboard.getnews': 1,
    'dashboard.multigetcount': 1,
    'dashboard.multigetnews': 1,
    'data.getcookies': 1,
    'events.get': 1,
    'events.getmembers': 1,
    'fbml.getcustomtags': 1,
    'feed.getappfriendstories': 1,
    'feed.getregisteredtemplatebundlebyid': 1,
    'feed.getregisteredtemplatebundles': 1,
    'fql.multiquery': 1,
    'fql.query': 1,
    'friends.arefriends': 1,
    'friends.get': 1,
    'friends.getappusers': 1,
    'friends.getlists': 1,
    'friends.getmutualfriends': 1,
    'gifts.get': 1,
    'groups.get': 1,
    'groups.getmembers': 1,
    'intl.gettranslations': 1,
    'links.get': 1,
    'notes.get': 1,
    'notifications.get': 1,
    'pages.getinfo': 1,
    'pages.isadmin': 1,
    'pages.isappadded': 1,
    'pages.isfan': 1,
    'permissions.checkavailableapiaccess': 1,
    'permissions.checkgrantedapiaccess': 1,
    'photos.get': 1,
    'photos.getalbums': 1,
    'photos.gettags': 1,
    'profile.getinfo': 1,
    'profile.getinfooptions': 1,
    'stream.get': 1,
    'stream.getcomments': 1,
    'stream.getfilters': 1,
    'users.getinfo': 1,
    'users.getloggedinuser': 1,
    'users.getstandardinfo': 1,
    'users.hasapppermission': 1,
    'users.isappuser': 1,
    'users.isverified': 1,
    'video.getuploadlimits': 1
  };
  var name = 'api';
  if (method.toLowerCase() in READ_ONLY_CALLS) {
    name = 'api_read';
  }
  return Facebook.DOMAIN_MAP[name];
}

Facebook.prototype._oauthRequest = function(req, host, method, path, params, callback) {
  if (!('access_token' in params)) {
    params['access_token'] = this.getAccessToken(req);
  }
  
  for (var prop in params) {
    if (typeof(params[prop]) != 'string') {
      params[prop] = JSON.stringify(params[prop]);
    }
  } 
  
  this.makeRequest(host, method, path, params, callback);
}

Facebook.prototype.makeRequest = function(host, method, path, params, callback) {
  params = phpjs.http_build_query(params, null, '&');
  
  var fb_client = http.createClient('443', host, true);
  
  if (method == 'GET') {
    path = path + '?' + params;
    var fb_request = fb_client.request(method, path, {'host': host, 'User-Agent': 'NodeJS HTTP Client'});
  } else {
    var fb_request = fb_client.request(method, path, {'host': host, 'User-Agent': 'NodeJS HTTP Client', 'Content-Length': params.length, 'Content-Type': 'application/x-www-form-urlencoded'});
    fb_request.write(params);
  }
  
  fb_request.end();

  fb_request.on('response', function (response) {
    response.setEncoding('utf8');
    var chunks = '';
    
    response.on('data', function (chunk) {
      chunks += chunk;
    });
    response.on('end', function () {
      callback(chunks);
    });
  });
}

/**
 * COOKIES AND SESSION
 */
Facebook.prototype.getAccessToken = function(req) {
  /*$session = $this->getSession();
  // either user session signed, or app signed
  if ($session) {
    return $session['access_token'];
  } else {
    return $this->getAppId() .'|'. $this->getApiSecret();
  }*/
  var cookie = this.getCookie(req.cookies);
  return cookie.access_token;
}
Facebook.prototype.getSessionCookieName = function () {
  return 'fbs_' + this.appId;
}
Facebook.prototype.getCookie = function(cookies) {
  var args = [],
      payload = '',
      fb_cookie;

  fb_cookie = cookies[this.getSessionCookieName()] || '';
  args = querystring.parse(fb_cookie.replace(/\\/,'').replace(/"/,''));

  var keys = Object.keys(args).sort();
  keys.forEach(function(key) {
    var value = args[key];
    if (key !== 'sig') {
      payload += key + '=' + value;
    }
  });

  var digest = crypto.createHash('md5').update(payload + this.appSecret).digest('hex');

  if (digest !== args.sig) {
    return null;
  };
  return args;
};

/**
 * CONSTANTS
 */
Facebook.DOMAIN_MAP = {
  'api'      : 'api.facebook.com',
  'api_read' : 'api-read.facebook.com',
  'graph'    : 'graph.facebook.com',
  'www'      : 'www.facebook.com'
};
