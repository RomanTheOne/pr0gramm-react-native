import React, { Component } from 'react'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { RestLink } from 'apollo-link-rest'

import { graphql } from 'graphql'
import schema from './schema'

import App from "./App";

import P from './P'
import {View, Image} from 'react-native'

const patchIfExists = (data, key, __typename, patcher) => {
  const value = data[key];
  if (value == null) {
    return {}
  }
  const result = { [key]: patcher(value, __typename, patcher) };
  return result
};

const typePatcher = {
  //TODO: Type should be renamed...
  People: (obj, outerType, patchDeeper) => {
    if (obj == null) {
      return obj
    }

    return {
      ...obj,
      ...patchIfExists(obj, 'tags', 'Tags', patchDeeper),
      ...patchIfExists(obj, 'comments', 'Comments', patchDeeper)
    }
  },
  Tags: (obj, outerType, patchDeeper) => {
    if (obj == null) {
      return obj
    }

    return {
      ...obj,
      ...patchIfExists(obj, 'tags', 'TagsType', patchDeeper)
    }
  },
  Comments: (obj, outerType, patchDeeper) => {
    if (obj == null) {
      return obj
    }

    return {
      ...obj,
      ...patchIfExists(obj, 'comments', 'CommentsType', patchDeeper)
    }
  },

  // TODO: patch for App.js
  Items: (obj, outerType, patchDeeper) => {
    if (obj == null) {
      return obj
    }

    return {
      ...obj,
      ...patchIfExists(obj, 'items', 'Item', patchDeeper)
    }
  },
  Item: (obj, outerType, patchDeeper) => {
    if (obj == null) {
      return obj
    }

    return {
      ...obj,
    }
  },
};

const client = new ApolloClient({
  link: new RestLink({ uri: 'http://pr0gramm.com/api/', typePatcher }),
  cache: new InMemoryCache(),
});

function setup(): ReactClass<{}> {
  class Root extends Component {
    render() {
      return (
        <ApolloProvider client={client}>
          <App/>
        </ApolloProvider>
      )
    }
  }

  return Root
}

// Info app example
{/*<P searchInput={2423944}/>*/}

module.exports = setup;
