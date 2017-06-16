import React, {Component} from "react";
import {AppRegistry, BackHandler} from "react-native";
import {StackNavigator} from "react-navigation";
import Consts from "./app/consts/Consts";
import Main from "./app/components/Main";

export default class IOSTop7 extends Component {

    static navigationOptions = {header: null};

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
    [Consts.SCREEN_TITLES.SPLASH]: {screen: Consts.SCREENS.SPLASH},
    [Consts.SCREEN_TITLES.LOG_IN]: {screen: Consts.SCREENS.LOG_IN},
    [Consts.SCREEN_TITLES.DASHBOARD]: {screen: Consts.SCREENS.DASHBOARD},
});

AppRegistry.registerComponent('IOSTop7', () => Top7);