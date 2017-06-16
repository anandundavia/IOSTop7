import React, {Component} from "react";
import {AppRegistry} from "react-native";
import {StackNavigator} from "react-navigation";

import Main from "./app/components/Main";

export default class IOSTop7 extends Component {
    static navigationOptions = {
        title: 'Welcome',
        header: null
    };

    render() {
        return <Main/>;
    }
}


const Top7 = StackNavigator({
    Home: {screen: IOSTop7},
});

AppRegistry.registerComponent('IOSTop7', () => Top7);