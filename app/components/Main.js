import React, {Component} from "react";
import {AppRegistry, Navigator, NavigatorIOS, NetInfo, Platform, StyleSheet, Text, View} from "react-native";

import Login from "./Login";
import Splash from "./Splash";
import UserConfirmDetails from "./UserConfirmDetails";
import Dashboard from "./Dashboard";
import PlaceDetails from "./PlaceDetails";
import PlaceAddPopUp from "./PlaceAddPopUp";
import SearchScreen from "./SearchScreen";

import Consts from "../consts/Consts";

// For Testing, set this to the screen you are working on. Saves the time of Navigation.
// To test the whole app, uncomment the next line
const INITIAL_SCREEN = {
    component: Consts.SCREENS.SPLASH,
    title: Consts.SCREEN_TITLES.SPLASH
};

// const INITIAL_SCREEN = {
//     component: Login,
//     title: Consts.SCREEN_TITLES.USER_CONFIRM_DETAILS
// };

//const INITIAL_SCREEN = {name: Consts.SCREEN_TITLES.LOG_IN};

/**
 * Entry point of the application.
 * This component is rendered first in the application every time.
 */
export default class Main extends Component {


    sceneChanger = (route, navigator) => {
        console.info("Navigator: Going to '" + route.name + "' screen");
        switch (route.title) {
            case Consts.SCREEN_TITLES.LOG_IN :
                return <Login navigator={navigator}/>;
                break;
            case Consts.SCREEN_TITLES.SPLASH :
                return <Splash navigator={navigator}/>;
                break;
            case Consts.SCREEN_TITLES.NETWORK :
                return <Network navigator={navigator}/>;
                break;
            case Consts.SCREEN_TITLES.USER_CONFIRM_DETAILS :
                return <UserConfirmDetails navigator={navigator}/>;
                break;
            case Consts.SCREEN_TITLES.DASHBOARD :
                return <Dashboard navigator={navigator}/>;
                break;
            case Consts.SCREEN_TITLES.PLACE_DETAILS:
                return <PlaceDetails
                    navigator={navigator}
                    markerObject={route.markerObject}
                />;
                break;
            case Consts.SCREEN_TITLES.PLACE_ADD_POP_UP:
                return <PlaceAddPopUp
                    navigator={navigator}
                    markerObject={route.markerObject}
                />;
            case Consts.SCREEN_TITLES.SEARCH_SCREEN:
                return <SearchScreen
                    navigator={navigator}
                />;
            default:
                console.log("Navigator WARNING: SCENE NOT FOUND!")
        }
    };


    configureScene = (route) => {
        if (route.sceneConfig) {
            return route.sceneConfig;
        }
        return {
            ...Navigator.SceneConfigs.FadeAndroid,
            gestures: {}
        };
    };


    /**
     * Helper function to hide or show the loading text view.
     * The loading text for current screen is 'synchronizing...'
     * @param isVisible
     */
    setLoadingTextViewVisibility = (isVisible) => {
        this.loadingText.setNativeProps({
            style: {
                bottom: isVisible ? 12 : -100,
                elevation: 20
            }
        });
    };


    /**
     * Creates and returns the view for the loading text.
     * This view is displayed when the user taps on the okay button
     */
    getLoadingTextView = () => {
        return <View
            ref={loadingText => this.loadingText = loadingText}
            style={styles.loadingTextContainer}>
            <Text
                style={styles.loadingText}>No network connection!</Text>
        </View>
    };


    render() {

        let navigator;

        if (Platform.OS === 'ios') {
            navigator = <NavigatorIOS
                style={{flex: 1}}
                initialRoute={INITIAL_SCREEN}
                navigationBarHidden={true}
            />
        } else {
            console.log("Okay it is navigator");
            // navigator = <Navigator
            //     initialRoute={INITIAL_SCREEN}
            //     renderScene={this.sceneChanger}
            //     configureScene={this.configureScene}
            // />;
        }

        return (
            <View style={styles.mainContainer}>
                {/*{navigator}*/}
                {this.getLoadingTextView()}
            </View>
        )
    }


    networkStatusChanged = (status) => {
        switch (status) {
            case Consts.NETWORK_STATUS.WIFI : {
                this.setLoadingTextViewVisibility(false);
                break;
            }
            case Consts.NETWORK_STATUS.CELL: {
                this.setLoadingTextViewVisibility(false);
                break;
            }
            case Consts.NETWORK_STATUS.MOBILE: {
                this.setLoadingTextViewVisibility(false);
                break;
            }
            case Consts.NETWORK_STATUS.NONE: {
                this.setLoadingTextViewVisibility(true);
                break;
            }
            default : {
                this.setLoadingTextViewVisibility(true);
                break;
            }
        }
    };

    componentDidMount() {
        // console.warn("attaching network listener..");
        NetInfo.addEventListener('change', this.networkStatusChanged);


        // This is for your info
        // If you want to remove the listener,
        // NetInfo.removeEventListener( 'change', callback );

    }
}

styles = StyleSheet.create({
    mainContainer: {
        flex: 1
    },

    loadingText: {
        color: "white"
        //borderWidth: 1
    },

    loadingTextContainer: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: -100,
        borderWidth: 1,
        width: 180,
        height: 30,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderColor: "rgba(255,0,0,0.5)",
        backgroundColor: "rgba(255,0,0,0.6)",
        elevation: 20

    }
});

AppRegistry.registerComponent(Consts.SCREEN_TITLES.MAIN, () => Main);
