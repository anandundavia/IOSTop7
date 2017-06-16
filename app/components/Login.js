import {LoginManager} from "react-native-fbsdk";
import React, {Component} from "react";
import {Image, StatusBar, StyleSheet, Text, TouchableHighlight, View} from "react-native";

import Consts from "../consts/Consts";
import Facebook from "../core/Facebook";
import Memory from "../core/Memory";
import Backend from "../core/Backend";


export default class Login extends Component {

    static navigationOptions = {header: null};

    constructor(props) {
        super(props);
        this.state = {
            isAccessTokenChecked: false,
            isUserLoggedIn: false,
        }
    }

    /**
     * Handle the data of user received from Graph Manager
     * @param error
     * @param result
     */
    handleData = (error, result) => {
        if (!error) {
            Memory().userObject = result;
            Backend.syncUserInfo((isUserNew) => {
                this.setLoadingTextViewVisibility(false);
                if (isUserNew) {
                    this.props.navigator.push({
                        component: Consts.SCREENS.USER_CONFIRM_DETAILS,
                        title: Consts.SCREEN_TITLES.USER_CONFIRM_DETAILS
                    });
                } else {
                    this.props.navigator.push({
                        component: Consts.SCREENS.DASHBOARD,
                        title: Consts.SCREEN_TITLES.DASHBOARD
                    });
                }
            })
        } else {
            console.log(error)
        }
    };


    /**
     * Once the login is done ( or cancelled ) handle the flow
     * @param result
     */
    handleLogIn = (result) => {
        if (result.isCancelled) {
            alert("Login was cancelled");
        } else {
            this.setLoadingTextViewVisibility(true);
            Facebook.makeGraphRequest(this.handleData);
        }
    };


    /**
     * Initiate the facebook login flow using LoginManager of Facebook
     */
    initLogIn = () => {
        LoginManager.logInWithReadPermissions(['public_profile', 'email', 'user_friends'])
            .then(this.handleLogIn, (error) => alert(error))
            .catch((error) => {
                console.error(error)
            });
        Backend.getBackendAccessToken(() => {
        });
    };


    /**
     * Skip the login and go to dashboard when the user does not want to login
     */
    skipLogIn = () => {

    };


    /**
     * Helper function to hide or show the loading text view.
     * The loading text for current screen is 'synchronizing...'
     * @param isVisible
     */
    setLoadingTextViewVisibility = (isVisible) => {
        this.loadingText.setNativeProps({
            style: {
                bottom: isVisible ? 20 : -100,
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
                style={styles.loadingText}>Please wait...</Text>
        </View>
    };

    render() {
        console.log("Login: Render called");
        return (
            <Image
                source={require("../icons/background.png")}
                style={styles.container}>
                <StatusBar hidden={true}/>
                <Image
                    style={styles.appLogo}
                    source={require("../icons/logo_white.png")}
                />

                <TouchableHighlight
                    onPress={this.initLogIn}
                    style={styles.facebookLoginContainer}>
                    <Text
                        style={styles.facebookLoginText}>
                        LOGIN WITH FACEBOOK
                    </Text>
                </TouchableHighlight>

                <TouchableHighlight
                    onPress={this.skipLogIn}
                    style={styles.skipLoginContainer}>
                    <Text style={styles.skipLoginText}>
                        skip login
                    </Text>
                </TouchableHighlight>

                {/*<LoginButton/>*/}

                <View style={styles.declarationTextContainer}>
                    <Text style={styles.declarationText}>I agree to Top7's terms of service and privacy policy</Text>
                </View>

                {this.getLoadingTextView()}

            </Image>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: "cover",
        alignItems: "center",
        justifyContent: "center",
    },

    appLogo: {
        marginBottom: 60,
        alignSelf: "center"
    },

    facebookLoginContainer: {
        width: "80%",
        height: "8%",
        borderRadius: 50,
        backgroundColor: "#3B5999",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: 120,
    },

    facebookLoginText: {
        fontWeight: "bold",
        color: "white"
    },

    skipLoginContainer: {
        position: "absolute",
        bottom: 90,
    },

    skipLoginText: {
        textDecorationLine: "underline",
        fontSize: 12,
    },

    declarationTextContainer: {
        backgroundColor: "rgba(0,0,0,0)",
        position: "absolute",
        bottom: 10,
    },

    declarationText: {},

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
        borderColor: "rgba(0,0,0,0.5)",
        backgroundColor: "rgba(0,0,0,0.5)",
        elevation: 20,
        zIndex: 100,

    },
});
