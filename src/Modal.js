import React, { PureComponent } from 'react'
import { View, Animated, PanResponder, ScrollView, StyleSheet } from 'react-native'

export default class Modal extends PureComponent {
  componentWillMount() {
    this.animated = new Animated.Value(0);
    this.animatedMargin = new Animated.Value(0);

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return true
      },

      onPanResponderMove: (evt, gestureState) => {
        /**
         * dx - negative value when moving left from initial position, positive
         * when moving right. Initial position is 0
         *
         * dy - negative when moving top from initial position, positive
         * when moving bottom. Initial position is 0
         *
         * moveX, moveY - current screen touch pixel coordinates
         *
         **/
        const { dy } = gestureState;

        (dy > 0)? this.animated.setValue(dy): this.animatedMargin.setValue(dy)
      },

      onPanResponderRelease: (evt, gestureState) => {
        const { dy } = gestureState;

        //  TODO: Close modal

        if (dy < -150) {
          // Animate away over the top
          Animated.parallel([Animated.timing(this.animated, {toValue: 400, duration: 150}), Animated.timing(this.animatedMargin, {toValue:0, duration: 150})]).start()
        } else if (dy > -150 && dy < 150) {
          // Return to initial position
          Animated.parallel([Animated.timing(this.animated, {toValue: 0, duration: 150}), Animated.timing(this.animatedMargin, {toValue: 0, duration: 150})]).start()
        } else if (dy > 150) {
          Animated.parallel([Animated.timing(this.animated, {toValue: 400, duration: 300})]).start()
        }
      }
    })

  }

  render() {
    const spacerStyle = {
      marginTop: this.animatedMargin
    };
    const opacityInterpolate = this.animated.interpolate({
      inputRange: [-400, 0, 400],
      outputRange: [0, 1, 0]
    });
    const modalStyle = {
      transform: [{ translateY: this.animated }],
      opacity: opacityInterpolate
    };

    return(
      <View style={styles.container}>
        <Animated.View style={spacerStyle}/>
        <Animated.View style={[styles.modal, modalStyle]} {...this.panResponder.panHandlers}>
          <View style={styles.comments}>
            <ScrollView >

              <View style={styles.placeholder}/>

            </ScrollView>
          </View>
        </Animated.View>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    zIndex: 1,
    width: "100%",

    padding: 10
  },
  modal: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333"
  },
  comments: {
    flex: 1
  },
  fakeText: {
    padding: 15,
    textAlign: "center"
  },
  placeholder: {
    height: 700,
    backgroundColor: "#f1f1f1"
  },
  inputWrap: {
    flexDirection: "row",
    paddingHorizontal: 15
  },
  textInput: {
    flex: 1,
    height: 50,
    borderTopWidth: 1,
    borderTopColor: "#000"
  }
});
