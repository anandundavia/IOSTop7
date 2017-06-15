import React, {Component} from "react";
import {Image, StyleSheet, Text, TouchableHighlight, View, Linking} from "react-native";
import MapView from "react-native-maps";
import Consts from "../consts/Consts";

export default class Marker extends Component {

    constructor(props) {
        super(props);
        if (!props.markerObject.name) {
            console.warn("set place name using placeName prop");
        }
        if (!props.markerObject.icon) {
            console.warn("set place icon using placeIcon prop");
        }
        if (!props.markerObject.coordinate) {
            console.err("Cordinate object not set in props");
        }
    }


    /**
     * When the tooltip is pressed, the page details page is loaded.
     */
    onToolTipPressed = () => {
        this.props.navigator.push({
            component: Consts.SCREENS.PLACE_DETAILS,
            title: Consts.SCREEN_TITLES.PLACE_DETAILS,
            passProps: {markerObject: this.props.markerObject}
        })
    };

    /**
     * Creates and returns the Callout.
     * Callout is shown when user taps on the marker
     * @returns {XML}
     */
    getMarkerCalloutView = () => {

        let typeIcon;
        let type;
        switch (this.props.markerObject.type) {
            case  Consts.PLACE_TYPES.BAR:
                typeIcon = <Image style={styles.placeDetailsIcon} source={require("../icons/bar_black.png")}/>;
                type = <Text style={styles.placeDetailsText}>{Consts.PLACE_TYPES.BAR.toUpperCase()}</Text>;
                break;
            case Consts.PLACE_TYPES.CLUB:
                typeIcon = <Image style={styles.placeDetailsIcon} source={require("../icons/club_black.png")}/>;
                type = <Text style={styles.placeDetailsText}>{Consts.PLACE_TYPES.CLUB.toUpperCase()}</Text>;
                break;
            default :
                typeIcon = <Image style={styles.placeDetailsIcon} source={require("../icons/restaurant_black.png")}/>;
                type = <Text style={styles.placeDetailsText}>{Consts.PLACE_TYPES.RESTAURANT.toUpperCase()}</Text>;
                break;
        }


        let priceLevelIcon;
        let priceLevel;
        let limit;
        if (this.props.markerObject.number) {
            limit = 0;
        } else {
            limit = 3;
        }

        if (this.props.markerObject.priceLevel <= limit) {
            priceLevelIcon = <Image style={styles.placeDetailsIcon} source={require("../icons/affordable_black.png")}/>;
            priceLevel = <Text style={styles.placeDetailsText}>{Consts.PRICE_LEVEL.AFFORDABLE.toUpperCase()}</Text>
        } else {
            priceLevelIcon = <Image style={styles.placeDetailsIcon} source={require("../icons/expensive_black.png")}/>;
            priceLevel = <Text style={styles.placeDetailsText}>{Consts.PRICE_LEVEL.EXPENSIVE.toUpperCase()}</Text>
        }

        return <MapView.Callout style={{zIndex: 10}} tooltip>
            <View style={styles.placeDetailsMarkerContainer}>
                <TouchableHighlight
                    onPress={this.onToolTipPressed}
                    style={styles.placeDetailsMakerPlaceImageContainer}>
                    <Image
                        source={this.props.markerObject.icon}
                        style={styles.placeDetailsMakerPlaceImage}/>
                </TouchableHighlight>
                <View style={styles.placeDetailsMakerPlaceNameContainer}>
                    <Text style={styles.placeDetailsMakerPlaceName}>
                        {this.props.markerObject.name}
                    </Text>
                </View>
                <View style={styles.placeDetailsMakerPlaceDetailsContainer}>
                    <View style={styles.placeDetailsIconContainer}>
                        {typeIcon}
                        {type}
                    </View>

                    <View style={styles.placeDetailsIconContainer}>
                        {priceLevelIcon}
                        {priceLevel}
                    </View>


                    {/*<View style={styles.placeDetailsIconContainer}>*/}
                    {/*<Image style={styles.placeDetailsIcon} source={require("../icons/romantic_black.png")}/>*/}
                    {/*<Text style={styles.placeDetailsText}>ROMANTIC</Text>*/}
                    {/*</View>*/}

                    <TouchableHighlight
                        onPress={() => {
                            if (this.props.markerObject.phoneNumber) {
                                Linking.openURL('tel:' + this.props.markerObject.phoneNumber).then((e) => {
                                    console.log("Calling successful");
                                    console.log(JSON.stringify(e))
                                }).catch((err) => {
                                    console.log("Error calling..");
                                    console.log(JSON.stringify(err));
                                });
                            } else {
                                console.warn("No phone number found.");
                                console.log(JSON.stringify(this.props.markerObject));
                            }
                        }}
                        underlayColor={'rgba(0,0,0,0)'}
                        style={styles.placeDetailsIconContainer}>
                        <View>
                            <Image style={styles.placeDetailsIcon} source={require("../icons/call.png")}/>
                            <Text style={styles.placeDetailsText}>CALL NOW</Text>
                        </View>

                    </TouchableHighlight>
                </View>
            </View>
        </MapView.Callout>;
    };


    /**
     * Gets the markerview.
     * Marker container is default if the marker is not leaderboard marker
     * else a custom container for marker is created and then returned.
     * @returns {XML}
     */
    getMarkerView = () => {
        if (this.props.markerObject.number) {
            return <View>
                <Image source={require('../icons/pin_black.png')}/>
                <View style={styles.numberContainer}>
                    <Text style={styles.markerNumber}>{this.props.markerObject.number}</Text>
                    <Text style={styles.numberTH}>{Consts.getTHString(this.props.markerObject.number)}</Text>
                </View>
            </View>;
        }
    };


    render() {

        return (
            <MapView.Marker

                centerOffset={{x: 0, y: 0}}
                coordinate={this.props.markerObject.coordinate}>
                {this.getMarkerView()}
                {this.getMarkerCalloutView()}
            </MapView.Marker>
        )
    }
}

const styles = StyleSheet.create({
    numberContainer: {
        flexDirection: "row",
        position: "absolute",
        alignSelf: "center",
        marginTop: 15
    },

    markerNumber: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
    },

    numberTH: {
        marginTop: 2,
        fontSize: 9,
        fontWeight: "bold",
        color: "white",
    },

    placeDetailsMarkerContainer: {
        alignItems: "center",
        height: 232,
        width: 220,
        borderRadius: 10,
    },

    placeDetailsMakerPlaceImageContainer: {
        height: 140,
        width: "100%",
        borderRadius: 10,
    },
    placeDetailsMakerPlaceImage: {
        height: 150,
        width: "100%",
        borderRadius: 10,
    },

    placeDetailsMakerPlaceNameContainer: {
        width: "100%",
        height: 35,
        paddingLeft: 10,
        justifyContent: "center",
        backgroundColor: "#CFBA6E"
    },

    placeDetailsMakerPlaceName: {
        width: "100%",
        height: 20,
        fontSize: 14,
        color: "black",
    },


    placeDetailsMakerPlaceDetailsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: -10,
        height: 67,
        borderRadius: 10,
        width: "100%",
        paddingLeft: 6,
        paddingRight: 6,
        backgroundColor: "white",
        zIndex: -1,
    },


    placeDetailsIconContainer: {
        flex: 1,
        marginTop: 14,
        alignItems: "center",
        //borderWidth: 1,
    },

    placeDetailsIcon: {
        height: 35,
        width: 35,
        // borderWidth: 1,
        // borderColor: "red"
    },

    placeDetailsText: {
        fontSize: 7,
        fontWeight: "bold",
        marginTop: 4
    },

});