import React, {Component} from "react";

import {Dimensions, Image, PanResponder, StyleSheet, Text, TouchableHighlight, View} from "react-native";
import Memory from "../core/Memory";
import Backend from "../core/Backend";


import Consts from "../consts/Consts";
const {height} = Dimensions.get('window');


export default class PlaceAddPopUp extends Component {

    static navigationOptions = {
        gesturesEnabled: false,
        header: null
    };


    constructor(props) {
        super(props);
        // The view which will be dragged
        this.currentPlace = null;


        this.allPlaces = [];

        // The index of the object in the lists array.
        this.listIndex = -1;

        // The array index of the place in the list.
        this.placeIndex = -1;

        // Whether the user has already dropped the place or not
        this.currentPlaceDropped = false;

        // In memory place holder for the place array on which the changes are to be made
        this.tempPlaceArray = null;


        this.tempUserObject = JSON.parse(JSON.stringify(Memory().userObject));

        this.listPlaceObject = null;
        this.listPlaceIndex = null;

        this.tempFontStyle = {color: "white"};

        this.currentViewProps = {
            style: {
                top: 0,
                zIndex: 1,
            }
        };
        this.params = props.navigation.state.params;


        if (this.params.isAdded !== null) {
            this.currentPlaceDropped = true;
        }

    }


    /**
     * Hide the popUp.
     * This function is called as the onPress on back button
     */
    hidePopUp = () => {
        this.props.navigation.goBack();
    };


    okButtonPressed = () => {
        this.setLoadingTextViewVisibility(true);

        Memory().updateLeaderboard = true;

        let url = this.params.markerObject.icon.uri;
        let index = url.indexOf("photoreference=") + "photoreference=".length;
        let end = url.indexOf("&key=");

        let reference = url.substring(index, end);


        // ("Temp:");
        // console.log(JSON.stringify(this.tempUserObject));console.log
        Memory().userObject = this.tempUserObject;
        // console.log("memory:");
        // console.log(JSON.stringify(Memory().userObject));


        let numberRated;
        let weightedRating;

        if (Memory().userObject.expert) {
            numberRated = "numberOfExpertRated";
            weightedRating = "expertTotalWeightedRating";
        } else {
            numberRated = "numberOfUserRated";
            weightedRating = "userTotalWeightedRating";
        }

        let number;
        if (this.params.isAdded) {
            number = 0;
        } else {
            number = 1;
        }


        Memory().commonRequest = {
            userDetails: Memory().userObject,
            place: {
                id: this.params.markerObject.id,
                name: this.params.markerObject.name,
                types: [this.params.markerObject.type],
                phoneNumber: this.params.markerObject.phoneNumber,
                setting: "both",
                googlePhotoRef: reference,
                priceLevel: this.params.markerObject.priceLevel <= 3 ? 0 : 1,
                location: {
                    city: this.params.markerObject.location.city,
                    state: this.params.markerObject.location.state,
                    country: this.params.markerObject.location.country,
                    cityLatitude: this.params.markerObject.coordinate.latitude,
                    cityLongitude: this.params.markerObject.coordinate.longitude,
                    zoomingIndex: 0.06
                },
                rating: this.params.markerObject.rating,
                [numberRated]: number,
                [weightedRating]: (10 - this.placeIndex)
            }
        };


        console.log(JSON.stringify(Memory().commonRequest));

        Backend.updateUserInformation(() => {
            this.setLoadingTextViewVisibility(false);
            this.props.navigation.state.params.onGoBack();
            this.props.navigation.goBack();
        });
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
     * Once the user drops the place, push down the places according to the logic
     * The places should be pushed down until an empty location is found or to the end.
     * If no empty location is found, the last element from the list will be removed.
     */
    dropReleased = () => {
        // The placeIndex will be -1 if the place is not currentPlaceDropped anywhere.
        // No need to execute the function in that case.
        // Just return!
        if (this.placeIndex < 0)
            return;


        console.log("Previous Index: " + this.listPlaceIndex + ", New Index: " + this.placeIndex);


        let temp = this.tempPlaceArray.reverse();
        let t; // temporary var
        let index = this.placeIndex;
        //let newPlace = {id: this.params.markerObject.id, name: this.params.markerObject.name};
        let newPlace = this.listPlaceObject;

        /*
         The following while loop 'pushes' the elements down
         till the end of the array or till it finds an empty location
         */
        while (index !== this.listPlaceIndex && index < temp.length && temp[index].id) {
            t = temp[index];
            temp[index] = newPlace;
            newPlace = t;
            index++;
        }
        temp[index] = newPlace;


        if (this.listPlaceIndex !== null && this.listPlaceIndex !== this.placeIndex) {
            temp[this.listPlaceIndex] = {id: null, name: null};
        }
        // Take the first three elements and add last three as empty
        // This needs to be done because we are adding 10 places in the user object
        temp = temp.splice(0, 7).concat([{}, {}, {}]);
        this.tempPlaceArray = temp.reverse();


        // Save the reversed temporary array.

        if (!this.tempUserObject.lists) {
            // console.log("Yeah. No more null pointer");
            this.tempUserObject.lists = [];
            this.tempUserObject.lists[this.listIndex] = this.getEmptyListObject(this.getListID());
        }

        this.tempUserObject.lists[this.listIndex].places = this.tempPlaceArray;

        // The place is now currentPlaceDropped. Update the state variables

        if (this.listPlaceIndex !== null) {
            this.allPlaces[this.listPlaceIndex].setNativeProps({style: styles.userListPlaceNameContainerPopUp});
        } else {
            this.currentPlaceDropped = true;
            this.currentPlace.setNativeProps({
                style: {
                    borderWidth: 0
                }
            });
        }


        this.tempFontStyle = {color: "white"};

        this.setState({});
    };


    /**
     * The component should follow the drag!
     * The method will set the decide the index of the object being dragged
     * @param event
     * @param gestureState
     */
    dragStarted = (event, gestureState) => {
        // y0 is the loaction where the touch started..
        // If the y0 is less than 30% of height, then the default selected place component is being moved.
        // Else, any component from list is being moved.
        // Is the component being moved is current selected place?


        let limit;
        if (this.currentPlaceDropped) {
            limit = (0.20 * height)
        } else {
            limit = (0.30 * height)
        }
        if (gestureState.y0 <= limit) {
            // Yes it it. Drag it.
            /*
             The list starts from the 30% of the height and then
             spans over the full height.
             Thus, the list is of 70% of height of whole screen
             Thus, each restaurant will be of 10% of height.
             Please note that due to margin of the component, the 10% height might not be exact.

             If the y is the height of current touch, then
             y = 30% of height + currentIndex * 10 % of height
             (the offset is 30% height)

             so, currentIndex = ( y - 30% of height ) / ( 10% of height )
             */
            let y = ( gestureState.moveY - 0.30 * height ) / (0.1 * height);
            if (y >= 0) {
                // index >=0 means the drag touch is in the list somewhere
                // set the top to follow the touch
                // added 7.25% of the height as offset so that the component almost
                // follows the drag
                this.currentViewProps.style.top = y * 0.1 * height + 0.075 * height;
                this.placeIndex = Math.floor(y);
            } else {
                // If the index is out of the list, then the current place should be on the
                // location. which is relative top = 0
                this.currentViewProps.style.top = 0;
                this.placeIndex = -1;
            }
            this.listPlaceObject = {id: this.params.markerObject.id, name: this.params.markerObject.name};
            // setting the native props will kinda sorta refresh the view 'lightly'
            this.currentPlace.setNativeProps(this.currentViewProps);


            // Unsetting the set flag, if any
            this.listPlaceIndex = null;

        } else {

            // No it is a component from the list.
            // Index is the index of the component being moved
            // This is the index of the place which is being dragged
            let index;
            //The top value.
            let top;
            if (this.currentPlaceDropped) {
                index = parseInt(( gestureState.y0 - 0.20 * height ) / (0.1 * height));
                top = ( gestureState.moveY - 0.20 * height - (0.1) * (index) * height);
            } else {
                index = parseInt(( gestureState.y0 - 0.30 * height ) / (0.1 * height));
                top = ( gestureState.moveY - 0.30 * height - (0.1) * (index) * height);
            }

            // This is the gonna be new index for that place
            let newIndex = top / (0.1 * height);

            let newFinalIndex;
            // Is the place being dragged above its old position ?
            if (newIndex <= 0) {
                // Yes it is, take the ceil value
                newFinalIndex = Math.ceil(newIndex);

                //console.log("Index: " + newIndex + ", Refined: " + newFinalIndex);
            } else {
                // Nope. Keep taking floor value
                newFinalIndex = Math.floor(newIndex);
                //console.log("Index: " + newIndex + ", Refined: " + newFinalIndex);
            }

            let tempArr = this.tempPlaceArray.slice(3).reverse();
            this.listPlaceObject = {id: tempArr[index].id, name: tempArr[index].name};
            this.listPlaceIndex = index;
            this.placeIndex = this.listPlaceIndex + newFinalIndex;


            this.allPlaces[index].setNativeProps({
                style: {
                    top: top,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    zIndex: 1,
                    borderBottomWidth: 0,
                }
            });
            this.tempFontStyle = {color: "black"};
        }


    };


    /**
     * Helper function to generate possible list id for the user.
     * list id = userID_city_state_country_type
     * @returns {string}
     */
    getListID = () => {
        return this.tempUserObject.id + "_" +
            this.params.markerObject.location.city + "_" +
            this.params.markerObject.location.state + "_" +
            this.params.markerObject.location.country + "_" +
            this.params.markerObject.type;
    };


    /**
     * Helper function to create the empty list object with given id
     * The type and location of the object will be taken directly from the marker object
     */
    getEmptyListObject = (listID) => {
        let emptyArray = [];
        //Push 10 empty objects.
        // TODO: This is soon gonna be 7 :P
        for (let i = 0; i < 10; i++) {
            emptyArray.push({});
        }

        return {
            listID: listID,
            listType: this.params.markerObject.type,
            location: this.params.markerObject.location,
            places: emptyArray
        }
    };


    /**
     * Precompute the list information
     */
    precomputeListInformation = () => {

        // getting the list id
        let listID = this.getListID();

        //console.log("List id is  "+listID);

        let found = false;
        let index = -1;

        for (let i = 0; this.tempUserObject.lists && i < this.tempUserObject.lists.length; i++) {
            if (this.tempUserObject.lists[i].listID === listID) {
                found = true;
                index = i;
                break;
            }
        }

        // The list can not be found when
        // 1. The list array itself does not exist
        // 2. The list exists, but the list array does not have the object with same id
        if (!found) {
            // Taking care of the case where the list array itself not exists
            if (!this.tempUserObject.lists) {
                this.tempUserObject.lists = [];
            }

            // List array exists, but not the object with given id, so create it.
            this.tempUserObject.lists.push(this.getEmptyListObject(listID));

            //If the list is not found. Then the index would be the size - 1
            index = this.tempUserObject.lists.length - 1;
        }

        this.tempPlaceArray = this.tempUserObject.lists[index].places;
        this.listIndex = index;

    };


    /**
     * Sets up the dragging.
     */
    setUpDragging = () => {
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderRelease: this.dropReleased,
            onPanResponderMove: this.dragStarted,
        });
    };


    /**
     * Removes the place from the given index and sets it to
     * {id:null, name:null}
     * Then synchronizes the information with backend
     * @param index
     */
    removePlace = (index) => {
        this.tempPlaceArray[this.tempPlaceArray.length - 1 - index] = {id: null, name: null};

        let isEmpty = true;

        // Let us check if all the places from this array has been removed
        // If all are empty, just delete that list
        for (let i in this.tempPlaceArray) {
            // The object can be empty if it is {}
            // or it is {id:null, name:null}
            // (Null Object pattern is looking batter and batter, eh?)
            let place = this.tempPlaceArray[i];
            if (Object.keys(place).length !== 0 && (place.id !== null && place.name !== null)) {
                // Yeah found one object that is not empty.
                // Set the flag and break the loop!
                isEmpty = false;
                break;
            }
        }


        // is the list empty?
        if (isEmpty) {
            // Yes the list is empty. Delete the list object from the user altogether
            this.tempUserObject.lists.splice(this.listIndex, 1);

            // Does user have any more lists?
            if (this.tempUserObject.lists.length === 0) {
                // Nope he does not. Delete the whole key of list.
                delete this.tempUserObject.lists;
            }
        } else {
            // No the list has other elements, set the temp place array to the listIndex
            this.tempUserObject.lists[this.listIndex].places = this.tempPlaceArray;
        }
        this.setState({});
    };


    /**
     * Creates and returns the top bar with back and OK button
     */
    getTopBarView = () => {
        return <View style={styles.topBarContainerPopUp}>
            {/*back button*/}
            <TouchableHighlight
                onPress={this.hidePopUp}
                underlayColor={"#c5b167"}
                style={styles.buttonContainerPopUp}>
                <Image
                    style={{marginLeft: -3}}
                    source={require('../icons/back_black.png')}/>
            </TouchableHighlight>

            {/*ok button*/}
            <TouchableHighlight
                onPress={this.okButtonPressed}
                underlayColor={"#c5b167"}
                style={styles.buttonContainerPopUp}>
                {/*<Image style={styles.submitButtonPopUp}
                 source={require('../images/back1600.png')}/>*/}
                <Text style={styles.submitButtonPopUp}>OK</Text>
            </TouchableHighlight>
        </View>;
    };


    /**
     * Creates and returns the view used to display the name of list
     * The format is Top7 {type}S, {city}
     * @returns {XML}
     */
    getCurrentListNameView = () => {
        let type = this.params.markerObject.type;
        let typeName = type.charAt(0).toUpperCase() + type.slice(1) + "s";

        return <View style={styles.placeNameContainerPopUp}>
            <Text
                style={styles.placeNamePopUp}>Top7 {typeName}, {this.params.markerObject.location.city}</Text>
        </View>
    };


    /**
     * Gets the current selected place if not dragged and currentPlaceDropped yet
     * @returns {XML}
     */
    getCurrentPlaceView = () => {
        if (!this.currentPlaceDropped && !this.params.isAdded) {
            return <View
                ref={currentPlace => this.currentPlace = currentPlace}
                style={styles.currentPlaceContainerPopUp}
                {...this.panResponder.panHandlers}>
                <Image
                    source={require("../icons/drag_black.png")}
                    //style={styles.dragImageContainerPopUp}
                />
                <Text style={styles.dragPlaceNamePopUp}>{this.params.markerObject.name}</Text>
            </View>
        }

    };


    /**
     * Creates and returns the view of the current list of the user
     * @returns {XML}
     */
    getCurrentListView = () => {
        /*
         The reverse is unnecessary but, There are only 7 places max.
         So it is okay. May be you want to do something about to increase the
         performance by a couple of milliseconds ?
         Slice(3) is to take the subset from 3 to array.length-1
         */
        let listView = this.tempPlaceArray.slice(3).reverse().map((value, key) => {
            let border = {};
            if (key === 0) {
                border = {borderTopWidth: 1}
            }
            let name = value.id ? value.name : null;
            let view;
            if (name) {
                view = <Image
                    key={key}
                    style={{marginLeft: 5, marginRight: 10, width: 15, height: 15}}
                    source={require("../icons/drag_white.png")}
                />;

            } else {
                view = <View
                    style={{marginLeft: 5, marginRight: 10, width: 15, height: 15, backgroundColor: "rgba(0,0,0,0)"}}/>

            }

            return <View
                ref={view => this.allPlaces[parseInt(key)] = view}
                key={key}
                {...this.panResponder.panHandlers}
                style={[styles.userListPlaceNameContainerPopUp, border]}>

                {view}

                <View style={styles.placeRankContainerPopUp}>
                    <Text style={styles.placeViewRankPopUp}>{key + 1}</Text>
                    <Text style={styles.placeRankTHPopUp}>
                        {Consts.getTHString(key + 1)}
                    </Text>
                </View>

                {name && <Text
                    numberOfLines={1}
                    style={[styles.userListPlaceNamePopUp, this.tempFontStyle]}>
                    {name}
                </Text>
                }

                {name && <TouchableHighlight
                    onPress={() => this.removePlace(key)}
                    style={styles.removePlacePopUp}>
                    <Image
                        source={require("../icons/close_white.png")}/>
                </TouchableHighlight>
                }

            </View>
        });
        return <View style={styles.userListsContainerPopUp}>{listView}</View>;
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
                style={styles.loadingText}>Synchronizing...</Text>
        </View>
    };


    setUpPopUp = () => {
        if(this.params.markerObject.type.length > 1) {
            console.log("Should show");
        } else {
            console.log("Shoud not");
        }
    };


    componentWillMount() {
        this.setUpPopUp();
        this.precomputeListInformation();
        this.setUpDragging();
    }

    render() {
        console.log("PopUp: Render called");
        return (<Image
            source={require("../icons/background.png")}
            style={styles.popUpContainer}>

            {/*The top bar for back and ok buttons*/}
            {this.getTopBarView()}

            {/*View to represent the current list name*/}
            {this.getCurrentListNameView()}


            {/*View for current place selected by the user to be added in the list*/}
            {this.getCurrentPlaceView()}

            {/*The view for the current top7 list of user*/}
            {this.getCurrentListView()}

            {/*The view for the loading text*/}
            {this.getLoadingTextView()}
        </Image>)
    }


}

const styles = StyleSheet.create({
    popUpContainer: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: "cover",
        // justifyContent: "center",
        paddingLeft: 10,
        paddingRight: 10,
    },

    topBarContainerPopUp: {
        height: 40,
        paddingLeft: -20,
        paddingRight: -20,
        marginTop: 5,
        width: "100%",
        flexDirection: 'row',
        justifyContent: 'space-between',
        //borderWidth: 1,
    },

    buttonContainerPopUp: {
        height: 40,
        width: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        //borderWidth: 1
    },

    backButtonPopUp: {
        // IDK why but flex:1 does not work.
        height: "100%",
        width: "100%"
    },

    submitButtonPopUp: {fontSize: 12},

    placeNameContainerPopUp: {
        marginTop: 5,
        height: "10%",
        width: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "rgba(0,0,0,0)"
        //borderWidth: 1,
    },

    placeNamePopUp: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white"
        //borderWidth: 1,
    },

    currentPlaceContainerPopUp: {
        marginTop: 5,
        height: "10%",
        width: "100%",
        borderRadius: 10,
        flexDirection: 'row',
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.8)",
        //elevation: 10,
    },

    dragImageContainerPopUp: {
        width: 40,
        height: 40,
        //borderWidth: 1,
    },

    dragPlaceNamePopUp: {
        fontSize: 18,
        flex: 1,
        textAlign: "center",
        elevation: 10,
        color: "#B0B0B0",
        fontWeight: "bold"
        //borderWidth: 1,
    },

    userListsContainerPopUp: {
        marginTop: 5,
        height: "70%",
        width: "100%",
        marginBottom: 5,
    },

    userListPlaceNameContainerPopUp: {
        top: 0,
        zIndex: 0,
        flex: 1,
        flexDirection: 'row',
        borderRadius: 10,
        marginTop: 4,
        marginBottom: 4,
        alignItems: 'center',
        backgroundColor: "rgba(0,0,0,0)",
        // borderWidth: 1,
        borderBottomWidth: 1,
        borderColor: "white"
    },

    userListPlaceNamePopUp: {
        width: "75%",
        fontSize: 20,
        marginLeft: 10,
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        color: "white"
        //borderWidth: 1,
    },

    removePlacePopUp: {
        position: 'absolute',
        right: 10,
        height: 20,
        width: 20,
        justifyContent: "center",
        alignItems: "center",
    },

    placeRankContainerPopUp: {
        height: 30,
        width: 30,
        borderRadius: 15,
        backgroundColor: "black",
        //marginLeft: 10,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        // borderWidth: 1,
    },

    placeViewRankPopUp: {
        fontSize: 14,
        fontWeight: 'bold',
        color: "white",
        //borderWidth: 1,
    },

    placeRankTHPopUp: {
        fontSize: 9,
        color: "white",
        marginTop: -7,
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