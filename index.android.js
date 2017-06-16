import React, {Component} from "react";
import {AppRegistry, BackHandler} from "react-native";
import {StackNavigator} from "react-navigation";
import Consts from "./app/consts/Consts";
import Main from "./app/components/Main";

export default class IOSTop7 extends Component {

    static navigationOptions = {
        title: 'Welcome',
        header: null
    };

    render() {
        return <Main navigation={this.props.navigation}/>;
    }

    componentDidMount() {
        //Added in android to remove the effect of back button
        BackHandler.addEventListener('hardwareBackPress', () => true);
    }
}

const Top7 = StackNavigator({
    "Home": {screen: IOSTop7},
    "Splash": {screen: Consts.SCREENS.SPLASH},
    "Login": {screen: Consts.SCREENS.LOG_IN}
});

AppRegistry.registerComponent('IOSTop7', () => Top7);