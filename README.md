# JavaScript error tracking for Understand.io

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![npm downloads](https://img.shields.io/npm/dt/@understand/understand-js)](https://www.npmjs.com/package/@understand/understand-js)
[![npm version](https://img.shields.io/npm/v/@understand/understand-js)](https://www.npmjs.com/package/@understand/understand-js)
[![license](https://img.shields.io/npm/l/@understand/understand-js)](https://www.npmjs.com/package/@understand/understand-js)
[![tests](https://github.com/understand/understand-js/workflows/Test/badge.svg)](https://github.com/understand/understand-js)

## Introduction
The package provides a full abstraction for Understand.io and provides extra features to improve JavaScript default logging capabilities. It's capable of delivering JavaScript errors and events in the right format to [Understand.io](https://www.understand.io).

## Table of Contents

* [Quick Start](#quick-start)
* [How to Send Events](#how-to-send-events)
* [Context Information](#context-information)
* [Framework Support](#framework-support)
* [Gotchas](#gotchas)
* [Browser Support](#browser-support)
* [API](#api)
* [Contributing](#contributing)
* [License](#license)

## Quick Start

1) Install it using Npm (or Yarn):

```
npm install @understand/understand-js
```

or include the package from the CDN:

```html
<script src="https://cdn.understand.io/understand-js/v1/bundle.min.js" crossorigin="anonymous"></script>
```

2) Initialize the library as soon as possible and call the `catchErrors` method to catch JavaScript errors.

```js
Understand.init({
    env: 'production', // define environment (production, staging, ...)
    token : 'b6eeab13-72f6-4c35-8452-5e96d3d24f1a' // set the input token from your Understand.io channel
})
.catchErrors();
```

- See [Framework Support](#quick-start) if you are using a JavaScript framework (Vue.js, React.js, ...).
- See [Laravel error tracking](https://www.understand.io/docs/1.0/laravel/js) if you are using the Laravel framework.


3) Send your first error
```html

<script src="https://cdn.understand.io/understand-js/v1/bundle.min.js" crossorigin="anonymous"></script>

<script>
Understand.init({
    env: 'production', // define environment (production, staging, ...)
    token : 'b6eeab13-72f6-4c35-8452-5e96d3d24f1a' // set the input token from your Understand.io channel
})
.catchErrors();

throw new Error('Understand.io test error');

</script>
```

## How to Send Events
- If you have used the `catchErrors()` method or you are using the framework integration then all unhandled errors will get automatically sent to Understand.io.
- Any handled exceptions can be delivered by using the `Understand.logError(e)` method:
```js
try {
  throw new Error('Oh snap!');
} catch (e) {
  Understand.logError(e);
}
```
- Regular events can be delivered by using the `Understand.logMessage` method:
```js
Understand.logMessage('The user added a new cart item.');
```

## Context Information

You can define `context` information to send additional information with each error, which can help simplify the debugging process. Understand.io aggregates errors based on the context information and gives excellent insight into how many users are affected, the origin of an error, and more.

```js
Understand.init({
    env: 'staging',
    token : 'b6eeab13-72f6-4c35-8452-5e96d3d24f1a',
    context: {
      request_id: '08394443-31d5-4d65-8392-a29d733c498d', // the uuid4 format
      session_id: '7b52009b64fd0a2a49e6d8a939753077792b0554', // the sha1 hashed version of the user session identifier
      user_id: 12, // the user ID
      client_ip: '141.93.46.10' // the user IP
    }
});
```

- Although the context fields are optional, we recommend that they are specified.
- The `request_id` is optional, but it will help Understand.io to group errors, which will allow you to easily view all errors that happen within each request.
- If the `client_ip` value is not specified, Understand.io will automatically attach it based on the incoming request.
- If the `session_id` is not specified, then the library will maintain the user session for you by utilising local storage. The `session_id` is only used by the the library to group errors.
- Never send a real `session_id`; only use a hashed version (sha1).

The handler will take care of providing default values for request_id and session_id, but you can always use your own values if you want to have more control on how events are grouped.


Send a test message to see if your configuration is working as expected:
```
Understand.logMessage('This is my first message');
```

### Framework Support

#### Angular 2+

By default, Angular comes with its own [`ErrorHandler`](https://angular.io/api/core/ErrorHandler) that intercepts all the errors and logs them to the console, preventing the app from crashing. To report errors to Understand you need to create a new class that implements the `ErrorHandler`:

```js
import { ErrorHandler, Injectable} from '@angular/core';

@Injectable()
export class UnderstandErrorHandler implements ErrorHandler {
  handleError(error: Error) {
    Understand.logError(error);
  }
}
```

Then we’ll need to tell Angular that it should use our `UnderstandErrorHandler` class when a new client error happens (provide it):

```js
import {NgModule, ApplicationRef, ErrorHandler} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {UnderstandErrorHandler} from './understand-error-handler';
import {AppComponent} from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: ErrorHandler,
      useClass: UnderstandErrorHandler,
    },
  ],
})

export class AppModule {}
```

#### React.js

If you're using React 16 you can leverage `ErrorBoundary` [components](https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html) to capture errors inside your render tree.

```js
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });

    // Send error to Understand
    Understand.logError(error);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

Then you can use it as a regular component:

```js
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```

React 15 and previous versions do not handle errors as nicely as the latest version, but you can still leverage `window.onerror` to report failures to Understand.

#### Vue.js

Vue.js offers a [handler](https://vuejs.org/v2/api/#errorHandler) for uncaught errors during component render function and watchers. You can hook into it and report any errors using the Undestand client.

```js
Vue.config.errorHandler = function (err, vm, info) {
  Understand.logError(err);
}
```

### Gotchas

#### A string is not an Error

In JavaScript you can throw any type of data that you'd like:

```js
throw "hello";
throw { name: "Nicholas" };
throw true;
throw 12345;
throw new Date();
```

Doing so will cause an error to be thrown, but from a debugging point of view this is not optimal because those primitives do not carry enough meaningful information as `Error` objects.

Besides holding the message passed to the constructor, `Error` objects keep track of where they were built and originated using the `stack` property. This property is specific to each JavaScript engine and/or browser that implements it.

For this reason the handler is only able to report primitive errors as error messages, without full stack trace.

#### "Script Error"

When an error occurs in a script, loaded from a different origin, the details of the error are not reported (to the `onerror` callback) to prevent leaking information. Instead the error reported is simply _"Script error"_, without details about what the error is, nor from which code it’s originating.

```
"Script error.", "", 0, 0, undefined
```

This isn't a JavaScript bug because browsers intentionally hide errors originating from script files from different origins for security reasons. For this reason, browsers only give `window.onerror` insight into errors originating from the same domain.

This behavior can be overriden in some browsers using the `crossorigin` attribute on `<script>` and having the server send the appropriate [CORS](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script) HTTP response headers.

1. Make sure that your external assets are served with the `Access-Control-Allow-Origin: *` CORS header. Most CDNs are already configured appropriately, but you should apply this change to your hosted assets (for example, if they are provided from a different cookieless domain).
2. Add the [crossorigin attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) to your script tag.

```html
<script src="//cdn.example.com/site.js" crossorigin></script>
```

Loading assets with CORS is [not supported](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script) in Internet Explorer.

See [https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror#Notes](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror#Notes) for more information.

#### Source Maps not expanded

If your errors in Understand are not showing the full stack trace and they point to the minified assets instead, you probably have an issue with source maps.

If you're serving your assets (and source maps) of your application from a different domain, make sure that the server is sending the appropriate [CORS](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script) HTTP response headers, otherwise the UnderstandJS tracker will not be able to instrument the stack trace of your errors with the original source file references.

For example, if your assets are served from [AWS CloudFront](https://aws.amazon.com/cloudfront) to your app domain, you will have to do the following:

1. add the `crossorigin` attribute on the dependencies

```html
<script src="https://xxxxxxxxxxxxx.cloudfront.net/app.js" crossorigin="anonymous"></script>
```

2. if your file are hosted in S3, you have to configure CORS on the bucket. See https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html for more information
3. you can check if the response headers are being sent by requesting the dependencies directly from S3. When you're sure that CORS headers are configured correctly, you can configure CloudFront to forward them. See https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/header-caching.html for more information.

### Browser Support

* Chrome: 20+
* Firefox: 23+
* Safari: 8+
* Opera: 24+
* IE: 9+
* iOS: 7+
* Android: 4.2+


### API

#### Initialization

```js
Understand.init({
  env: 'production', // REQUIRED: the environment of your application
  token: '<token>',  // REQUIRED: the Understand token
  beforeSend: (event) => {},  // callback that allows you to modify the event before sending it
  context: {}        // context object
});
```

#### Automatically Capturing Errors

To automatically attach global handlers to capture uncaught exceptions and unhandled rejections you will need to call `catchErrors` after initialization process.

```js
Understand.catchErrors();
```

To optionally enable/disable global handlers you can pass an object to `catchErrors` with the proper boolean values, for example:

```js
Understand.catchErrors({
  enableWindowError: true,
  enableUnhandledRejection: false
});
```

#### Capture Exceptions

You can pass an [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) object to `logError()` to get it captured as an event.

```js
try {
  throw new Error('Oh snap!');
} catch (e) {
  Understand.logError(e);
}
```

You can throw a string (or other primitives) as an error, but it would then be treated as a message. See [A string is not an Error](#a-string-is-not-an-error) for more information.

#### Capture Messages

If you need to send a basic message to Understand you can do so by using the `logMessage()` method:

```js
Understand.logMessage('my message', 'info');
```

You can set the severity of a message to one of five values: `fatal`, `error`, `warning`, `info`, and `debug`. When capturing messages `info` is the default level.

**Note:** only messages with `fatal` and `error` severity level will show up in the Errors section of Understand's dashboard.

#### Capture Metadata

With `logError` and `logMessage` methods you can also send custom metadata to Understand:

- `logError(e, { foo: 'bar' })`
- `logMessage('my message', 'info', { foo: 'bar' })`

#### Filter Errors

In some situations, you may want to avoid sending specific JS errors to Understand.io. It can be particularly useful if you have well-known errors which you would like to filter at the library level.

By default, the library filter all of the Script errors [Script errors](#script-error). You can disable this feature by setting the `ignoreScriptErrors` option set to `false`:

```js
Understand.init({
    env: 'staging',
    token : 'b6eeab13-72f6-4c35-8452-5e96d3d24f1a',
    ignoreScriptErrors: false
});
```

Additionally, you might want to filter some specific errors. You can define them as entries in the `ignoredErrors` option. It allows partial matches (using RexExp) and exact matches (using Strings):

```js
Understand.init({
    env: 'staging',
    token : 'b6eeab13-72f6-4c35-8452-5e96d3d24f1a',
    ignoredErrors: [/ResizeObserver/]
});
```

The configuration above prevents sending any errors that contain the `ResizeObserver` string.

You can also blacklist specific URLs using the `blacklistedUrls` option. The errors generated from those origins will not be sent to Understand.io.
This option allows partial and exact matches, just like `ignoredErrors`.

```js
Understand.init({
    env: 'staging',
    token : 'b6eeab13-72f6-4c35-8452-5e96d3d24f1a',
    blacklistedUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i
    ]
});
```

For more complex situations, the library allows to extend the `beforeSend(event)` callback which can be used to adjust the event data or optionally discard it by returning `null`:

```js
Understand.init({
  ...
  beforeSend: (event) => {
    // discard events coming from localhost
    if (event.client_ip === '127.0.0.1') {
      return null;
    }

    return event;
  },
}
```

#### Context

`Context` lets you add arbitrary information along with your events. Understand supports 3 types of structured data for context and all their values are optional.

Context can be injected using the initialization options:

```js
Understand.init({
    ...
    context: {
      request_id: '<request id>',
      session_id: '<session id>',
      user_id: <user id>,
      client_ip: '<client ip>'
    }
});
```

or using setters:

##### Session

```js
Understand.withContext(function (context) {
  context.setRequestId('<request identifier>');
  context.setSessionId('<session identifier>');
});
```

* `request_id`: this value is used by Understand.io to group multiple errors into the same issue.
* `session_id`: you can optionally send to Understand.io the id of the HTTP session

##### User

```js
Understand.withContext(function (context) {
  context.setUserId(<user identifier>);
  context.setClientIp('<ip address>');
});
```

* `user_id`: the identifier of the logged user
* `client_ip`: the IP address of the user

##### Tags

Tags are an array of strings that can help you categorize events.

```js
Understand.withContext(function (context) {
  context.setTags(['error_log']);
});
```

You can clear the context using the `clear()` method:

```js
Understand.withContext(function (context) {
  context.clear();
});
```

#### Source Maps

Understand supports un-minifying JavaScript via source maps. This lets you view source code context obtained from stack traces in their original untransformed form, which is particularly useful for debugging minified code (e.g. UglifyJS), or transpiled code from a higher-level language (e.g. TypeScript, ES6). We recommend you to incorporate source maps with your source code if you want to receive the full benefit of error tracking and monitoring.

The simplest way to start is to host your source maps alongside your bundled JS. The library will then look for the

```
//# sourceMappingURL=
```

comment in the minified file to know where to fetch the expanded source. This comment is inserted automatically by most tools that generate source maps. For example, when using [UglifyJS](https://github.com/mishoo/UglifyJS2/tree/v2.x) you can generate source maps using a command like the follwing

```
$ uglifyjs --compress --source-map source.js.map --source-map-root http://<root url> --source-map-url test.js.map --output source.min.js source.js
```

The library will then automatically fetch the source code and source maps by scraping the URLs within the stack trace. However, you can disable this feature. You can do this using the option `disableSourceMaps: true` when initializing the handler:

```js
Understand.init({
    token : '<token>',
    disableSourceMaps: true
})
```

#### Close handler

If at any time you decide that you don't want to report errors anymore you can close the handler.

```
Understand.close();
```


### Contributing

Install dependencies:

```
npm install
```

Run unit tests:

```
npm run test
```

Build project and bundle generation:

```
npm run build
```

### License

The Understand.io JavaScript library is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT)
