import React, {Component} from "react";
import {AppRegistry, BackAndroid} from "react-native";

import Main from "./app/components/Main";
export default class IOSTop7 extends Component {

    render() {
        //Added in android to remove the effect of back button
        BackAndroid.addEventListener('hardwareBackPress', () => true);
        return (
            <Main/>
        );
    }
}

AppRegistry.registerComponent('IOSTop7', () => IOSTop7);