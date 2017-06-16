import React, {Component} from "react";
import {
    Animated,
    Easing,
    Image,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from "react-native";
import MapView from "react-native-maps";
import Consts from "../consts/Consts";
import Memory from "../core/Memory";
import Backend from "../core/Backend";


export default class PlaceDetails extends Component {

    static navigationOptions = {header: null};

    constructor(props) {
        super(props);
        this.loadingText = null;
        let length;
        this.params = props.navigation.state.params;
        if (this.params.markerObject.friendsView === undefined || this.params.markerObject.friendsView === null || this.params.markerObject.friendsView.length === 0) {
            length = 0;
        } else {
            length = 80;
        }
        this.friendsViewHeight = new Animated.Value(length);
    }

    /**
     * Go back to the dashboard when the user taps on back button
     */
    goBack = () => {
        this.props.navigation.goBack();
    };

    addPlaceToFavourite = () => this.props.navigation.navigate(
        Consts.SCREEN_TITLES.PLACE_ADD_POP_UP,
        {markerObject: this.params.markerObject}
    );


    /**
     * Helper function to generate possible list id for the user.
     * list id = userID_city_state_country_type
     * @returns {string}
     */
    getListID = () => {
        return Memory().userObject.id + "_" +
            this.params.markerObject.location.city + "_" +
            this.params.markerObject.location.state + "_" +
            this.params.markerObject.location.country + "_" +
            this.params.markerObject.type;
    };

    /**
     * Returns the top bar used for navigation and is fixed.
     * TODO: The ADD icon should only be displayed iff the place is not already added in user's list
     * @returns {XML}
     */
    getTheTopbarView = () => {
        let listID = this.getListID();
        let tempPlaceArray = Memory().userObject.lists;

        // Well the following can happen in rare case of client being deleted from server.
        if (!tempPlaceArray) {
            tempPlaceArray = [];
        }
        let listIndex = null;

        // Search for the list id in lists
        for (let i = 0; i < tempPlaceArray.length; i++) {
            let list = tempPlaceArray[i];
            if (list.listID === listID) {
                listIndex = i;
                break;
            }
        }

        let showAddButton = true;
        let placeRank = null;
        // Did we found the list with listID ?
        if (listIndex !== null) {
            // Yes, we did! Meaning that there are chances that
            // this list might have the place already added.
            let places = Memory().userObject.lists[listIndex].places;
            for (let i = 0; i < places.length; i++) {
                let place = places[i];
                //Does the current place id matches the place id in marker object?
                if (place.id === this.params.markerObject.id) {
                    // Yes. it does. This place is already added to user's one of the favourite list.
                    // Do not load the add button
                    showAddButton = false;
                    placeRank = places.length - i;
                }
            }
        }

        //console.log("Place index is : " + placeRank);
        let addButtonView = null;

        // Do we want to show the add button ?
        if (showAddButton) {
            // Yes. We do want to show the add button
            // Because the list is not added in user's information
            addButtonView = <TouchableHighlight style={styles.addButtonContainer}
                                                underlayColor={'rgba(0,0,0,0)'}
                                                onPress={this.addPlaceToFavourite}>
                <Image source={require('../icons/plus_black.png')}/>
            </TouchableHighlight>
        } else {
            // No, the list is already added. We do not want to show the add button
            addButtonView = <View style={styles.existsContainer}>
                <Text style={styles.rank}>{placeRank}</Text>
                <Text style={styles.rankTH}>{Consts.getTHString(placeRank)}</Text>
            </View>;
        }

        return <View style={styles.topBar}>
            {/*The view for back button*/}
            <TouchableHighlight style={styles.backButtonContainer}
                                underlayColor={'rgba(0,0,0,0)'}
                                onPress={this.goBack}>
                <Image source={require('../icons/back_black.png')}/>
            </TouchableHighlight>

            {/*The add button*/}
            {addButtonView}
        </View>;
    };


    /**
     * Loads all the reviews of the place.
     * Reviews are now pulled from Google API
     * @returns {XML}
     */
    loadAllReviews = () => {

        if (this.params.markerObject.reviews.length === 0) {
            Backend.getReviews(this.params.markerObject.id, (reviews) => {
                this.params.markerObject.reviews = reviews;
                this.setState({});
            });
        }

        let review = this.params.markerObject.reviews.map((value, key) => {
            return <View key={key} style={styles.review}>
                {/*View for user name and image*/}
                <View style={styles.userNameAndImage}>
                    <Image style={styles.userImage}
                           source={{uri: value.profile_photo_url}}
                    />
                    <Text style={styles.userName}>
                        {value.author_name}
                    </Text>
                </View>

                {/*View for the user review text*/}
                <View style={styles.reviewTextContainer}>
                    <Text style={styles.reviewText}>
                        {value.text}
                    </Text>
                </View>

            </View>
        });

        return <View style={styles.allReviewsContainer}>
            <Text style={styles.title}>Reviews</Text>
            {review}
        </View>;
    };


    getRatingsView = () => {
        let rating = Math.floor(this.params.markerObject.rating);
        let diff = this.params.markerObject.rating - rating;

        let stars = [];

        let index;

        for (index = 0; index < rating; index++) {
            stars.push(<Image key={index} source={require("../icons/star-fill.png")}/>)
        }


        if (0 < diff && diff < 0.5) {
            stars.push(<Image key={index} source={require("../icons/star-half.png")}/>);
        } else if (0.5 <= diff) {
            stars.push(<Image key={index} source={require("../icons/star-fill.png")}/>);
        }

        if (diff === 0) index--;

        while (++index < 5) {
            stars.push(<Image key={index} source={require("../icons/star.png")}/>)
        }


        {/*
         All ratings for place. Not to be confused with 'reviews'
         Ratings are in range of 0 to 5?
         */
        }

        return <View style={styles.ratingsContainer}>
            <Text style={styles.title}>Ratings</Text>
            <View style={styles.starsContainer}>{stars}</View>
        </View>
    };


    /**
     * Creates and returns the view for the loading text.
     * This view is displayed when the user taps on the okay button
     */
    getLoadingTextView = () => {
        if (this.params.markerObject.reviews.length === 0)
            return <View style={styles.loadingTextContainer}>
                <Text
                    ref={loadingText => this.loadingText = loadingText}
                    style={styles.loadingText}>Getting reviews...</Text>
            </View>
    };


    getFriendsView = () => {
        if (this.params.markerObject.friendsView === undefined || this.params.markerObject.friendsView === null) {
            this.params.markerObject.friendsView = [];
        }
        return <Animated.View
            ref={view => this.friendsContainer = view}
            style={[styles.friendsContainer, {height: this.friendsViewHeight}]}>
            {this.params.markerObject.friendsView}
        </Animated.View>
    };


    openMapApp = () => {
        if (Platform.OS === 'ios') {
            let googleMapURL = "comgooglemaps://?saddr=" + +this.params.markerObject.coordinate.latitude + "," + this.params.markerObject.coordinate.longitude;
            Linking.openURL(googleMapURL).then((e) => {
            }).catch((err) => {
                let appleMapURL = "http://maps.apple.com/?daddr=" + this.params.markerObject.coordinate.latitude + "," + this.params.markerObject.coordinate.longitude;
                Linking.openURL(appleMapURL).then((e) => {
                }).catch((err) => {
                    console.log("Can not open maps..");
                    console.log(JSON.stringify(err));
                });
            });
        } else {
            console.warn("Opening maps on android is not yet supported...")
        }


    };


    /**
     * Creates and returns the main container of the place details.
     * @returns {XML}
     */
    getMainView = () => {

        let typeIcon;
        let type;
        switch (this.params.markerObject.type) {
            case  Consts.PLACE_TYPES.BAR:
                typeIcon = <Image style={styles.placeDetailsIcon} source={require("../icons/bar_white.png")}/>;
                type = <Text style={styles.placeDetailsText}>{Consts.PLACE_TYPES.BAR.toUpperCase()}</Text>;
                break;
            case Consts.PLACE_TYPES.CLUB:
                typeIcon = <Image style={styles.placeDetailsIcon} source={require("../icons/club_white.png")}/>;
                type = <Text style={styles.placeDetailsText}>{Consts.PLACE_TYPES.CLUB.toUpperCase()}</Text>;
                break;
            default :
                typeIcon = <Image style={styles.placeDetailsIcon} source={require("../icons/restaurant_white.png")}/>;
                type = <Text style={styles.placeDetailsText}>{Consts.PLACE_TYPES.RESTAURANT.toUpperCase()}</Text>;
                break;
        }


        let priceLevelIcon;
        let priceLevel;
        let priceLimit;

        if (this.params.markerObject.number) {
            priceLimit = 0;
        } else {
            priceLimit = 3;
        }
        if (this.params.markerObject.priceLevel <= priceLimit) {
            priceLevelIcon = <Image style={[styles.placeDetailsIcon, {marginLeft: 2}] }
                                    source={require("../icons/affordable_white.png")}/>;
            priceLevel = <Text style={styles.placeDetailsText}>{Consts.PRICE_LEVEL.AFFORDABLE.toUpperCase()}</Text>
        } else {
            priceLevelIcon = <Image style={[styles.placeDetailsIcon, {marginLeft: 2}]}
                                    source={require("../icons/expensive_white.png")}/>;
            priceLevel = <Text style={styles.placeDetailsText}>{Consts.PRICE_LEVEL.EXPENSIVE.toUpperCase()}</Text>
        }

        return <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar hidden/>

            {/*Image of the place*/}
            <View style={styles.imageContainer}>
                <Image
                    source={this.params.markerObject.icon}
                    style={styles.placeImage}/>
                <TouchableHighlight
                    onPress={() => {
                        if (this.params.markerObject.phoneNumber) {
                            Linking.openURL('tel:' + this.params.markerObject.phoneNumber).then((e) => {
                                console.log("Calling successful");
                                console.log(JSON.stringify(e))
                            }).catch((err) => {
                                console.log("Error calling..");
                                console.log(JSON.stringify(err));
                            });
                        } else {
                            console.warn("No phone number found.");
                            console.log(JSON.stringify(this.params.markerObject));
                        }
                    }}
                    underlayColor={'rgba(0,0,0,0)'}
                    style={styles.callContainer}>
                    <Image style={styles.callIcon} source={require("../icons/call_big.png")}/>
                </TouchableHighlight>
            </View>
            {/*Name of the place*/}
            <View style={styles.placeNameContainer}>
                <Text style={styles.placeName}>
                    {this.params.markerObject.name}
                </Text>
            </View>

            <View style={styles.horizontalLine}/>


            {this.getFriendsView()}


            <View
                style={[styles.horizontalLineCustom]}/>

            <View style={styles.placeDetailsContainer}>
                <View style={styles.placeDetailsIconContainer}>
                    <View style={styles.placeDetailsCircle}>{typeIcon}</View>
                    {type}
                </View>

                <View style={styles.placeDetailsIconContainer}>
                    <View style={styles.placeDetailsCircle}>{priceLevelIcon}</View>
                    {priceLevel}
                </View>

                {/*<View style={styles.placeDetailsIconContainer}>*/}
                {/*<View style={styles.placeDetailsCircle}>*/}
                {/*<Image style={styles.placeDetailsIcon} source={require("../icons/romantic_white.png")}/>*/}
                {/*</View>*/}
                {/*<Text style={styles.placeDetailsText}>ROMANTIC</Text>*/}
                {/*</View>*/}
            </View>

            {/*Location of place of the place*/}
            <View style={styles.mapViewContainer}>
                <MapView
                    scrollEnabled={false}
                    style={styles.map}
                    onRegionChangeComplete={() => {
                    }}
                    region={this.params.markerObject.coordinate}>
                    <MapView.Marker
                        onPress={this.openMapApp}
                        coordinate={this.params.markerObject.coordinate}>
                        <Image source={require('../icons/pin_black.png')}/>
                    </MapView.Marker>
                </MapView>
            </View>


            {this.getRatingsView()}

            <View style={styles.horizontalLine}/>

            {/*All the reviews*/}
            {this.loadAllReviews()}


        </ScrollView>;
    };


    componentDidMount() {
        if (this.params.markerObject.friendsView === undefined || this.params.markerObject.friendsView === null || this.params.markerObject.friendsView.length === 0) {
            this.params.markerObject.friendsView = [];
            //console.log("No friends. Gonna make the req.");
            let req = {
                userid: Memory().userObject.id,
                placeid: this.params.markerObject.id,
                placeType: this.params.markerObject.type
            };

            let friendsView = [];
            Backend.getFriendsRank(req, (friends) => {
                let n = Math.min(friends.length, 4);
                if (n !== 0) {
                    let i;
                    for (i = 0; i < n; i++) {
                        friendsView.push(
                            <View key={i} style={styles.circle}>
                                <Image key={i} source={{uri: friends[i].picture.data.url}}
                                       style={styles.circle}/>
                                <View style={styles.userImageRankContainer}>
                                    <Text style={styles.userImageRank}>{friends[i].placerank}</Text>
                                </View>
                            </View>
                        );
                    }
                    for (i = n; i < 5; i++) {
                        friendsView.push(<View key={i} style={styles.circle}/>);
                    }

                } else {
                    friendsView.push(
                        <View key={0} style={styles.noFriendsContainer}>
                            <Text style={styles.noFriendsText}>None of your friends have ranked this place!</Text>
                        </View>
                    )
                }
                this.params.markerObject.friendsView = friendsView;
                Animated.timing(this.friendsViewHeight, {
                    // value is in percentage so converting it into dimensions.
                    toValue: 80,
                    easing: Easing.bounce,
                    duration: 500
                }).start(() => this.setState({}));

            });
        }
    }

    render() {
        console.log("PlaceDetails: Render called");
        return (
            <View>
                {this.getTheTopbarView()}
                {this.getMainView()}
                {/*The view for the loading text*/}
                {this.getLoadingTextView()}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "rgb(255,255,255)",
    },

    topBar: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    backButtonContainer: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },


    addButtonContainer: {
        width: 40,
        height: 40,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
    },

    existsContainer: {
        flexDirection: "row",
        width: 30,
        height: 30,
        right: 5,
        marginTop: 5,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        backgroundColor: "white",
    },

    rank: {
        marginLeft: 4,
        fontSize: 16,
        color: "black",
        fontWeight: "bold",
    },

    rankTH: {
        color: "black",
        fontSize: 8,
        marginTop: -8,
    },

    imageContainer: {
        //borderWidth: 1,
    },

    placeImage: {
        width: "auto",
        height: 400 // because google image has max 400 height & width
    },

    callContainer: {
        position: "absolute",
        bottom: -25,
        right: 10,
        borderRadius: 25,
        height: 50,
        width: 50,
        justifyContent: "center",
        alignItems: "center",
        //backgroundColor: "#3DB76F",
        // zIndex: 1,
        //borderWidth: 1,
    },


    callIcon: {
        height: 50,
        width: 50,
    },

    placeNameContainer: {
        //borderWidth: 1,
        margin: 15,
    },

    placeName: {
        fontSize: 24,
        color: "black",
        fontWeight: "bold",
        backgroundColor: "rgba(0,0,0,0)"
    },


    friendsContainer: {
        width: "100%",
        height: 0,
        paddingLeft: 15,
        paddingRight: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        //borderWidth: 1,
    },

    circle: {
        borderRadius: 30,
        height: 60,
        width: 60,
        //marginRight: 15,
        marginTop: -3,
        // borderWidth: 1,
    },

    userImageRankContainer: {
        position: "absolute",
        bottom: 0,
        right: 0,
        height: 18,
        width: 18,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: "white",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#3a589b"
    },


    noFriendsContainer: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginTop: -5,
    },


    noFriendsText: {
        fontSize: 16,
    },

    userImageRank: {
        fontSize: 12,
        fontWeight: "bold",
        color: "white"
    },

    placeDetailsContainer: {
        marginLeft: 15,
        marginRight: 15,
        marginBottom: 20,
        marginTop: 15,
        flexDirection: "row",
        alignSelf: "center",
        justifyContent: "space-between",
        width: "40%",
    },

    placeDetailsIconContainer: {
        alignItems: "center",
        justifyContent: "center",
        //borderWidth: 1,
    },

    placeDetailsText: {
        marginTop: 2,
        color: "black",
        fontSize: 9,
        fontWeight: "bold"
    },

    placeDetailsIcon: {
        height: 35,
        width: 35,
        // borderWidth: 1,
        // borderColor: "red"
    },

    placeDetailsCircle: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#CFBA6E",
        borderRadius: 25,
        height: 50,
        width: 50,
    },

    title: {
        fontSize: 19,
        color: "black",
        fontWeight: "bold"
    },
    horizontalLine: {
        height: 1,
        borderRadius: 1,
        width: "95%",
        alignSelf: 'center',
        margin: 5,
        backgroundColor: "#CFBA6E",
    },


    horizontalLineCustom: {
        height: 1,
        borderRadius: 1,
        width: "95%",
        alignSelf: 'center',
        marginTop: -5,
        marginBottom: 5,
        marginLeft: 5,
        marginRight: 5,
        backgroundColor: "#CFBA6E",
    },

    description: {
        color: "black",
        fontSize: 16,
        //margin: 5,
    },

    mapViewContainer: {
        margin: 5,
        height: 300
    },

    map: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },

    ratingsContainer: {
        margin: 15,

    },

    starsContainer: {
        // height: 50,
        marginBottom: 5,
        flexDirection: "row"
    },

    allReviewsContainer: {
        margin: 15,
        height: 'auto'
    },

    userNameAndImage: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    userImage: {
        height: 80,
        width: 80,
        borderRadius: 40,

    },
    userName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "black",
        marginLeft: 20
    },
    reviewTextContainer: {
        marginTop: 5
    },
    reviewText: {
        color: "black",
        fontSize: 15
    },
    review: {
        marginTop: 10,
    },


    loadingText: {
        color: "white"
        //borderWidth: 1
    },

    loadingTextContainer: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: 12,
        borderWidth: 1,
        width: 150,
        height: 30,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderColor: "rgba(0,0,0,0.5)",
        backgroundColor: "rgba(0,0,0,0.5)",
        elevation: 20

    }
});