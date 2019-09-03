/**
 * Sample React Native App with Firebase
 * https://github.com/invertase/react-native-firebase
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableNativeFeedback,
  Dimensions
} from "react-native";

import {
  firebase,
  VisionCloudTextRecognizerModelType
} from "@react-native-firebase/ml-vision";

const Button =
  Platform.OS === "android" ? TouchableNativeFeedback : TouchableOpacity;

import { RNCamera } from "react-native-camera";

// TODO(you): import any additional firebase services that you require for your app, e.g for auth:
//    1) install the npm package: `yarn add @react-native-firebase/auth@alpha` - you do not need to
//       run linking commands - this happens automatically at build time now
//    2) rebuild your app via `yarn run run:android` or `yarn run run:ios`
//    3) import the package here in your JavaScript code: `import '@react-native-firebase/auth';`
//    4) The Firebase Auth service is now available to use here: `firebase.auth().currentUser`

const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\nCmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\nShake or press menu button for dev menu"
});

const firebaseCredentials = Platform.select({
  ios: "https://invertase.link/firebase-ios",
  android: "https://invertase.link/firebase-android"
});

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flash: "off",
      zoom: 0,
      autoFocus: "on",
      autoFocusPoint: {
        normalized: { x: 0.5, y: 0.5 }, // normalized values required for autoFocusPointOfInterest
        drawRectPosition: {
          x: Dimensions.get("window").width * 0.5 - 32,
          y: Dimensions.get("window").height * 0.5 - 32
        }
      },
      depth: 0,
      type: "back",
      whiteBalance: "auto",
      ratio: "16:9",
      text: [],
      captured: false
    };
  }

  async takePicture() {
    this.setState({});
    if (this.camera) {
      const options = {
        quality: 0.5,
        base64: true,
        skipProcessing: true,
        forceUpOrientation: true
      };
      const data = await this.camera.takePictureAsync(options);
      // for on-device (Supports Android and iOS)
      // const deviceTextRecognition = await RNMlKit.deviceTextRecognition(
      //   data.uri
      // );
      //console.log("Text Recognition On-Device", deviceTextRecognition);
      // for cloud (At the moment supports only Android)
      // const cloudTextRecognition = await RNMlKit.cloudTextRecognition(data.uri);
      // console.log("Text Recognition Cloud", cloudTextRecognition);
      const cloudTextRecognition = await firebase
        .vision()
        .cloudTextRecognizerProcessImage(data.uri, {
          modelType: VisionCloudTextRecognizerModelType.DENSE_MODEL
        });
      this.setState({
        captured: true,
        text: cloudTextRecognition.blocks
      });
      console.log("Text Recognition Cloud", cloudTextRecognition);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {!this.state.captured ? (
          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={{
              flex: 1
            }}
            type={this.state.type}
            flashMode={this.state.flash}
            //autoFocus={this.state.autoFocus}
            autoFocusPointOfInterest={this.state.autoFocusPoint.normalized}
            zoom={this.state.zoom}
            //whiteBalance={this.state.whiteBalance}
            ratio={this.state.ratio}
            focusDepth={this.state.depth}
            androidCameraPermissionOptions={{
              title: "Permission to use camera",
              message: "We need your permission to use your camera",
              buttonPositive: "Ok",
              buttonNegative: "Cancel"
            }}
          >
            <Button
              style={[styles.flipButton, styles.picButton]}
              onPress={this.takePicture.bind(this)}
            >
              <View
                style={{
                  width: 200,
                  height: 50
                }}
              >
                <Text style={styles.flipText}> SNAP </Text>
              </View>
            </Button>
          </RNCamera>
        ) : (
          <View>
            {this.state.text.map((u, i) => {
              return <Text key={i}>{u.text}</Text>;
            })}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF"
  }
});
