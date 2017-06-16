import React, {Component} from "react";
import {Image, StyleSheet, TouchableHighlight} from "react-native";
import {GooglePlacesAutocomplete} from "react-native-google-places-autocomplete";

import Consts from "../consts/Consts";
import Memory from "../core/Memory";

export default class SearchScreen extends Component {

    static navigationOptions = {header: null};

    /**
     * Called When any place from auto complete bar is tapped.
     * Changes the state as required.
     * @param data
     * @param details
     */
    suggestedPlaceOnPress = (data, details = null) => {
        let type = null;


        if (details.types) {
            for (let i = 0; i < details.types.length; i++) {
                if (!type) { // If the type is not found
                    if (details.types[i] === Consts.PLACE_TYPES.RESTAURANT) {
                        type = Consts.PLACE_TYPES.RESTAURANT;
                    } else if (details.types[i] === "night_club") {
                        type = Consts.PLACE_TYPES.CLUB;
                    } else if (details.types[i] === "bar") {
                        type = Consts.PLACE_TYPES.BAR;
                    }
                } else { // Type is found, break!
                    break;
                }
            }
        } else {
            console.warn("Google has no types!");
        }

        // If the place is neither restaurant nor club nor bar, do not show the marker
        // Should show a message or something to user about why the marker is not loaded
        if (!type) {
            return;
        }

        //check if the details have address component
        let city = null;
        let state = null;
        let country = null;

        if (details.address_components) {
            for (let i = 0; i < details.address_components.length; i++) {
                let types = details.address_components[i].types;
                if (!city && types.includes("administrative_area_level_2")) {
                    city = details.address_components[i].short_name;
                } else if (!state && types.includes("administrative_area_level_1")) {
                    state = details.address_components[i].long_name;
                } else if (!country && types.includes("country")) {
                    country = details.address_components[i].long_name;
                }
            }
            //console.log(city, state, country);
        } else {
            // console.warn("Google has no address component!..");
        }


        //Check if the place details have photos array
        //TODO: What if there are no images? Find a way to handle that case.
        let ref = null;
        let icon = null;
        if (details.photos && details.photos.length !== 0) {
            //Pick the first photo to show
            ref = details.photos[0].photo_reference;

            // Google API need reference of the image to get the full image.
            icon = Consts.API_URLS.GOOGLE_PHOTO_API_BASE + "maxwidth=400&photoreference=" + ref + "&key=" +
                Consts.KEYS.GOOGLE_API_KEY;
        } else {
            // console.warn("Google has no images of this place. Marker will not be loaded..");
        }


        console.log("Phone number: " + JSON.stringify(details.international_phone_number));


        //Create the review array.
        let reviews = [];
        for (let i = 0; i < details.reviews.length; i++) {
            let review = details.reviews[i];
            reviews.push({
                author_name: review.author_name,
                profile_photo_url: review.profile_photo_url,
                text: review.text
            });
        }

        let newMaker = {
            id: data.place_id,
            priceLevel: details.price_level,
            icon: {uri: icon},
            name: details.name,
            phoneNumber: details.international_phone_number,
            type: type,
            location: {
                city: city,
                state: state,
                country: country
            },
            coordinate: {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                latitudeDelta: 0.15,
                longitudeDelta: 0.15,
            },
            reviews: reviews,
            rating: details.rating
        };

        this.props.navigator.push({
            title: Consts.SCREEN_TITLES.PLACE_DETAILS,
            component: Consts.SCREENS.PLACE_DETAILS,
            passProps: {markerObject: newMaker}
        });

    };

    /**
     * Creates the Google Auto-complete component required for search.
     * @returns {XML}
     */
    getGoogleAutoCompleteView = () => {
        // Need API key and type of the place you want to search.
        // Read: https://github.com/FaridSafi/react-native-google-places-autocomplete
        const query = {key: Consts.KEYS.GOOGLE_API_KEY, types: "establishment"};

        return <GooglePlacesAutocomplete
            placeholder='Search'
            minLength={2} // minimum length of text to search
            autoFocus={true}
            listViewDisplayed='false' // true/false/undefined
            fetchDetails={true}
            renderDescription={(row) => row.description}
            onPress={this.suggestedPlaceOnPress}
            getDefaultValue={() => ""}
            query={query}
            styles={autoCompleteStyle}
            currentLocationLabel="Current location"
            nearbyPlacesAPI="GooglePlacesSearch"
        />
    };

    render() {
        return (
            <Image
                source={require("../icons/background.png")}
                style={styles.container}>
                {this.getGoogleAutoCompleteView()}
                <TouchableHighlight
                    style={{width: 25, height: 80, justifyContent: "center",}}
                    underlayColor={"rgba(0,0,0,0)"}
                    onPress={() => this.props.navigator.pop()}>
                    <Image
                        style={{marginLeft: 5,}}
                        source={require("../icons/back_black.png")}/>
                </TouchableHighlight>
            </Image>
        )
    }
}
const autoCompleteStyle = {

    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
    },

    description: {
        width: 100,
        color: "black"
    },

    listView: {
        backgroundColor: "white",
        elevation: 15,
    },

    textInputContainer: {
        height: 80,
        alignItems: 'center',
        backgroundColor: '#DCC670',
        elevation: 15,
    },

    textInput: {
        //marginTop: 0,
        height: 50,
        fontSize: 18,
        marginLeft: 25,
        marginTop: 13
    },

};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: "cover",
    }
});