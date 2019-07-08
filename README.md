# Understand JS

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

JavaScript notifier for capturing errors in web browsers and reporting to [Understand](https://app.understand.io).

## Table of Contents

* [Installation](#installation)
* [Getting Started](#getting-started)
* [Api](#api)
* [Browser Support](#browser-support)
* [Framework Integration](#framework-integration)
* [Gotchas](#gotchas)
* [Contributing](#contributing)
* [License](#license)

### Installation

Install it using Yarn:

```
yarn add understand-js-handler
```

or Npm:

```
npm install understand-js-handler
```

or include the handler from the CDN:

```
<script src="https://cdn.understand.io/understand-js/beta/bundle.min.js" crossorigin="anonymous"></script>
```

### Getting Started

* Initialize the component as soon as possible and optionally bind browser errors so they are automatically catched (using `installErrorHandlers`)

```
Understand.init({
    env: 'staging', // define environment
    token : 'b6eeab13-72f6-4c35-8452-5e96d3d24f1a' // define authentication token
})
.installErrorHandlers();
```

* Define more context information (for example, in Laravel view)

```
Understand.withContext(function (context) {
    context.setSession({
        id: '{{ sha1(request()->session()->getId()) }}'
    });

    context.setUser({
        id: {{ Auth::id() }},
        ip_address: '{{ request()->getClientIp() }}'
    });

    // set tags as an array
    context.setTags(['error_log']);
});
```

Note that here we are using `sha1` to hash the session id in order to avoid security concernes.


* Send your first message to Understand

```
Understand.captureMessage('This is my first message');
```

### API

#### Initialization

```
Understand.init({
  env: 'production', // REQUIRED: the environment of your application
  token: '<token>',  // REQUIRED: the Understand token
  beforeSend: (event) => {},  // callback that allows you to modify the event before sending it
}
```

#### Automatically Capturing Errors

To automatically attach global handlers to capture uncaught exceptions and unhandled rejections you will need to call `installErrorHandlers` after initialization process.

```
Understand.installErrorHandlers();
```

To optionally enable/disable global handlers you can pass an object to `installErrorHandlers` with the proper boolean values, for example:

```
Understand.installErrorHandlers({
  enableWindowError: true,
  enableUnhandledRejection: false
});
```

#### Capture Exceptions

You can pass an [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) object to `captureError()` to get it captured as an event.

```
try {
  throw new Error('Oh snap!');
} catch (e) {
  Understand.captureError(e);
}
```

You can throw a string (or other primitives) as an error, but it would then be treated as a message. See [A string is not an Error](#a-string-is-not-an-error) for more information.

#### Capture Messages

If you need to send a basic message to Understand you can do so by using the `captureMessage()` method:

```
Understand.captureMessage('my message', 'info');
```

You can set the severity of a message to one of five values: `fatal`, `error`, `warning`, `info`, and `debug`. When capturing messages `info` is the default level.

**Note:** only messages with `fatal` and `error` severity level will show up in the Errors section of Understand's dashboard.

#### Filter Errors

The Understand handler exposes a `beforeSend(event)` callback which can be used to add/remove information on the event or optionally discard it by returning `null`.

```
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

`Context` lets you add arbitrary information along with your events. Understand supports 3 types of structured data for context and all their values are optional:

##### Session

```
Understand.withContext(function (context) {
  context.setSession({
    id: '<session identifier>',
    request_id: '<request identifier>'
  });
});
```

* `id`: you can optionally send to Understand the id of the HTTP session
* `request_id`: this value is used by Understand to group multiple errors into the same issue.

##### User

```
Understand.withContext(function (context) {
  context.setUser({
    id: '<user identifier>,
    ip_address: '<ip address>'
  });
});
```

* `id`: the identifier of the logged user
* `ip_address`: the IP address of the user

##### Tags

Tags are an array of strings that can help you categorize events.

```
Understand.withContext(function (context) {
  context.setTags(['error_log']);
});
```

You can clear the context using the `clear()` method:

```
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

The Understand handler will then automatically fetch the source code and source maps by scraping the URLs within the stack trace. However, you can legitimately decide to disable this feature. You can do this using the option `disableSourceMaps` when initializing the handler:

```
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

### Browser Support

* Chrome: 20+
* Firefox: 23+
* Safari: 8+
* Opera: 24+
* IE: 9+
* iOS: 7+
* Android: 4.2+

### Framework Integration

#### Angular 2+

By default, Angular comes with its own [`ErrorHandler`](https://angular.io/api/core/ErrorHandler) that intercepts all the errors and logs them to the console, preventing the app from crashing. To report errors to Understand you need to create a new class that implements the `ErrorHandler`:

```
import { ErrorHandler, Injectable} from '@angular/core';

@Injectable()
export class UnderstandErrorHandler implements ErrorHandler {
  handleError(error: Error) {
    Understand.captureError(error);
  }
}
```

Then we’ll need to tell Angular that it should use our `UnderstandErrorHandler` class when a new client error happens (provide it):

```
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

```
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });

    // Send error to Understand
    Understand.captureError(error);
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

```
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```

React 15 and previous versions do not handle errors as nicely as the latest version, but you can still leverage `window.onerror` to report failures to Understand.

#### Vue.js

Vue.js offers a [handler](https://vuejs.org/v2/api/#errorHandler) for uncaught errors during component render function and watchers. You can hook into it and report any errors using the Undestand client.

```
Vue.config.errorHandler = function (err, vm, info) {
  Understand.captureError(err);
}
```

### Gotchas

#### A string is not an Error

In JavaScript you can throw any type of data that you'd like:

```
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

```
<script src="//cdn.example.com/site.js" crossorigin></script>
```

Loading assets with CORS is [not supported](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script) in Internet Explorer.

See [https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror#Notes](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror#Notes) for more information.

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

[MIT](LICENSE)