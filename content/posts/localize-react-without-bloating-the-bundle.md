---
path: /localize-react-apps-the-performant-way/
date: 2019-08-16T22:56:11.257Z
title: Localize React without Bloating the Bundle
heroImage: /assets/localize-bg.png
---
There are so many possibilities when you want to localize your application with your React application. I believe that localization is difficult because it requires excellence in several pieces of a stack at the same time. You have to have a working pipeline that can take string resources that would get translated. Then, you have to have a way to load these strings onto your page or application. Finally, you have to have a way to take these strings and inject them into the components inside your application. As you can see, you can choose just about any tech to help you accomplish these goals. I am documenting a particular set of stack that I believe helps you achieve this in the most performant way with tools that you're already probably using.

## Translation Pipeline
At work, we have a translation-as-a-service API that we rely on to refresh localized strings for us every night. There's a growing team that has built a simple Azure DevOps task we add as a step in one of our pipelines which runs nightly.

Not everyone is as fortunate that has something they can use from their own company. Given that, I'll suggest a pattern here as the first step. Do a search for "localization as a service" and look for a vendor that can help add a step in your CI pipeline of choice. Set up a nightly job to refresh your application's localized strings as JSON like this:

```json
{
  "HELLO_NAME": "Hello {name}!",
  "CLICK_ME": "Click me"
}
```

## Rendering Localized Strings
React is a large ecosystem. So then the paradox of choice is real when finding supplemental libraries for React. Conventional wisdom is to find the most popular packages from npmjs.org. So given this, I first looked at react-intl to help me inject localized strings into my application. The issue here is that react-intl uses higher order components all over the place. One of the explicit goals (as I heard it from ReactConf 2018) of React hooks is to do away with depth of the component tree caused by the higher order components. Higher order component, or HOC, is a neat idea until the consumer needed to access the ref to the original wrapped component. When all your components that use localized strings are wrapped in HOCs, your application start to look like a sideways mountain. (aside: go look at your component tree in React DevTool to see if you're suffering from HOC-itis)

Enter react-intl-universal. The Alibaba Group created this library to get around the HOC issues of react-intl. On top of this, there are times where strings are needed from outside of the component's render() method. It takes 2 steps to place strings inside your components.

First you have to initialize the locale data. Note that the data can be preloaded from a server or can be retrieved at runtime. The choice is yours. For the most optimal case, we definitely would have the server preload strings right in the app as it is being loaded.

Let's pretend that ./locales/en-US.json has the same content as the example above.

```js
// locale data
const locales = {
  "en-US": require('./locales/en-US.json'),
  "zh-CN": require('./locales/zh-CN.json'),
};
```

Then, we initialize the react-intl-universal library inside a componentDidMount() call. And we'll use the localized string inside the render() method with the .get() function:

```js
import intl from 'react-intl-universal'; 

class App extends Component {
  state = { isLoading: false }
  componentDidMount() {
    this.loadLocales();
  }

  async loadLocales() {
    await intl.init({
      currentLocale: 'en-US',
      locales,
    });
    this.setState({ isLoading: true });
  }

  render() {
    return (
      !this.state.isLoading &&
      <div>
        {intl.get('HELLO_NAME', {name: 'world'})}
      </div>
    );
  }
}
```

Note that the init() call returns a Promise. This means that we can use the async / await syntax to write our string load code. Once this is added, we look at the way we retrieve the strings by key. For that, we use the get(). Get takes in two parameters: the key and some object. Sometimes the strings have slots that can be replaced by the object values.

## Loading Localized Strings
This is where it gets interesting. So far, we've assumed that we had the locale data all upfront. This means that all the localized strings would had been loaded inside a bundle or onto the page somehow. Loading all the language strings in one go can only be feasible if the app barely contain any text. If we're using Webpack, we should take advantage of a feature that I recently came to know. We all have seen the dynamic import() syntax:

```js
const SomeModule = import('some-module');
```

But, have you seen what Webpack can do with something like this?

```js
const getLocale = (locale) => import(`./locales/${locale}.json`);
```

Based on the .json files it finds inside ./locales, Webpack is smart enough to generate chunks for dynamic loading! That means your main bundle will not incur the weight of the entire library of localized strings. Putting all these concepts together, I've created a repo to demonstrate concepts from this post:

https://github.com/kenotron/react-intl-example

I'll go over some of the points from that repo. First, I created a HOC that you place at the ROOT of the application. Don't worry! It is only one HOC for the entire app. It is called LocaleComponent - I'm keeping this strange little name until React.createResource() becomes a thing maybe in the future.

```js
const getLocale = locale => import(`./locale/${locale}.json`);

class LocaleComponent extends React.Component {
  state = { isLoading: true };
  
  async loadLocales() { 
    const locales = await getLocale('en');
    const currentLocale = 'en';
    await intl.init({ currentLocale, locales });
    this.setState({ isLoading: false });
  }
  
  render() {
    return !this.state.isLoading ? <>this.props.children</> : null;
  }
}
```
