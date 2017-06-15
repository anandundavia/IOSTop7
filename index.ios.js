import React, {Component} from "react";
import {AppRegistry, View, Text} from "react-native";
import Main from "./app/components/Main";


export default class IOSTop7 extends Component {
    render() {
        return (<Main/>);
    }
}

AppRegistry.registerComponent('IOSTop7', () => IOSTop7);