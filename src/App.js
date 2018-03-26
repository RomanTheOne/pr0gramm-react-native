/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  View,
} from 'react-native';

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

import Modal from './Modal'

// http://pr0gramm.com/api/items/get?older=275534&flags=1&promoted=1
const GET_ITEMS = gql`
  query($older: Int, $flags: Int, $promoted: Int, $pathFunction: any) {
    items(older: $older, flags: $flags, promoted: $promoted)
    @rest(type: "Items", pathBuilder: $pathFunction) {
      atEnd
      atStart
      items {
        id
        thumb
      }
    }
  }
`;

function _pathBuilder(variables) {
  const qs = Object.keys(
    variables,
  ).reduce((acc, key) => {
    if (variables[key] === null || variables[key] === undefined) {
      return acc;
    }
    if (acc === '') {
      return '?' + key + '=' + String(variables[key]);
    }
    return (
      acc + '&' + key + '=' + String(variables[key])
    );
  }, '');
  return 'items/get' + qs;
}

class App extends Component {
  constructor() {
    super();

    this.state = { items: null, refreshing: false, isModalVisible: false };

    this._keyExtractor = this._keyExtractor.bind(this);
    this._renderItem = this._renderItem.bind(this);
    this._onEndReached = this._onEndReached.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
    this._toggleModal = this._toggleModal.bind(this);
  }

  componentDidMount() {
    // this._updateItems();

    console.log('ZIS: ', this)
  }

  async _updateItems() {
    const items = await this._fetchItems();
    this.setState({ items, refreshing: false })
  }

  async _fetchItems(params={}) {
    let URL = "http://pr0gramm.com/api/items/get";
    Object.keys(params).forEach(key => URL = URL.concat(`?${key}=${params[key]}`));

    try {
      const response = await fetch(URL);
      const { items } = await response.json();
      return items

    } catch (err) {
      console.error(`Error: ${err.message}`)
    }
  }

  _toggleModal() {
    this.setState({ isModalVisible: !this.state.isModalVisible })
  }

  _keyExtractor(item) {
    return item.id
  }

  // http://thumb.pr0gramm.com/2017/12/19/97669f16cd0a1b6a.jpg
  _renderItem({ item }) {
    return(
      <TouchableOpacity onPress={this._toggleModal} style={styles.imageContainer}>
        <Image source={{uri: `http://thumb.pr0gramm.com/${item.thumb}`}}
               style={styles.image}
               resizeMode='cover'
               resizeMethod='scale'/>
      </TouchableOpacity>
    )
  }

  _onEndReached() {
    // TODO: GQL querry with latest item

    const { items: stateItems } = this.state;
    const { id } = stateItems[stateItems.length - 1];
    const items = this._fetchItems({ order: id });
    this.setState({ items: [...this.state.items, ...items] })
  }

  _onRefresh() {
    this.setState({ refreshing: true }, () => this._updateItems())
  }

  render() {
    return (
      <View style={styles.container}>
        { this.props.items &&
          <FlatList data={this.props.items.items}
                    numColumns={3}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                    onEndReached={this._onEndReached}
                    onEndReachedThreshold={0.5}
                    refreshing={this.state.refreshing}
                    onRefresh={this._onRefresh} />
        }
        { this.state.isModalVisible &&
          <Modal/>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#85444f'
  },
  imageContainer: {
    flex: 1,
    alignItems: 'stretch'
  },
  image: {
    flex: 1,
    width: null,
    height: 180,
    margin: 1
  },
});

export default graphql(GET_ITEMS, {
  props: ({ data: { loading, error, items }}) => {
    if (loading) {
      return { loading: loading }
    }

    if (error) {
      return { error: error }
    }

    return {
      items: items,
      loading: false,
    }
  },
  options: (props) => ({
    variables: {
      older: 275534,
      flags: 1,
      promoted: 1,
      pathFunction: _pathBuilder
    }
  }),
})(App);
