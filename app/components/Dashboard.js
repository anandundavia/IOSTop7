/**
 * This the screen comes up every time when the user comes back to app after logging in
 */
import React, {Component} from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableHighlight,
    View
} from "react-native";
import MapView from "react-native-maps";
import SideMenu from "react-native-side-menu";
import ScrollableTabView from "react-native-scrollable-tab-view";


import Marker from "./Marker";
import PlaceList from "./PlaceList";
import Consts from "../consts/Consts";
import Backend from "../core/Backend";
import Memory from "../core/Memory";


const {width} = Dimensions.get('window');

export default class Dashboard extends Component {

    static navigationOptions = {header: null};

    constructor(props) {
        super(props);
        this.sideMenu = null;
        this.state = {
            showOverlay: false,
            loadMapView: true,
        }
    }


    // /**
    //  * Used to find out the current location of the user.
    //  * enableHighAccuracy: true always times out. There is open issue on github.
    //  * enableHighAccuracy: false is workable though.
    //  * Visit : https://github.com/facebook/react-native/issues/7495
    //  */
    // findAndSetCurrentLocation = () => {
    //     //console.log("Dashboard: fetching location. please wait...");
    //     navigator.geolocation.getCurrentPosition(
    //         (position) => {
    //             //let initialPosition = JSON.stringify(position);
    //             this.setState({
    //                 longitude: position.coords.longitude,
    //                 latitude: position.coords.latitude,
    //             })
    //         },
    //         (error) => console.log(JSON.stringify(error)),
    //         {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000}
    //     );
    // };


    getListName = (index) => {
        let type = Memory().userObject.lists[index].listType + "s";
        type = type.charAt(0).toUpperCase() + type.slice(1);
        let city = Memory().userObject.lists[index].location.city;
        return "Top7 " + type + ", " + city;
    };


    /**
     * Renders the top7 lists of the user.
     * @param value
     * @param key
     * @returns {XML}
     */
    renderList = (value, key) => <PlaceList
        key={key}
        listName={this.getListName(key)}
        names={Memory().userObject.lists[key].places.slice(3).reverse()}/>;


    setListName = (data) => {
        return this.nameContainer.setNativeProps({
            text: data.ref.props.listName
        })
    };


    showSearchOverlay = () => {
        this.sideMenu.openMenu(false);
        this.props.navigation.navigate(Consts.SCREEN_TITLES.SEARCH_SCREEN, {
            onGoBack: () => {
                this.refreshDashboard();
                this.sideMenu.openMenu(true);
            },
        })
    };


    getTabBar = () => {

        return <View style={styles.currentListNameContainer}>
            <TextInput
                ref={(view) => this.nameContainer = view}
                style={styles.currentListName}
                multiline={true}
                numberOfLines={2}
                editable={false}
                caretHidden={true}/>
            <TouchableHighlight
                onPress={this.showSearchOverlay}
                underlayColor={"rgba(0,0,0,0)"}
                style={{marginLeft: 4}}>
                <Image source={require("../icons/plus_round_black.png")}/>
            </TouchableHighlight>
        </View>
    };


    /**
     * Creates the left side bar of the dashboard.
     * @returns {XML}
     */
    getSideBar = () => {
        let userListView;
        //Does user have any lists?
        if (Memory().userObject.lists) {
            //Yes he does! Create the component for views
            userListView = Memory().userObject.lists.map(this.renderList);
        } else {
            // Nope he does not. show message that he does not.
            userListView = <View style={styles.listContainer}>
                <Text style={{color: "black", fontSize: 18}}>
                    Add any place to a list and the list will show up here
                </Text>
            </View>;
        }

        let userImageSource;
        if (Memory().userObject.isGuest) {
            userImageSource = require("../icons/guest_user_image_black.png");
        } else {
            userImageSource = {uri: Memory().userObject.picture.data.url};
        }

        return <Image
            source={require("../icons/background.png")}
            style={styles.drawerContainer}>
            {/*View for user details => Profile pic and name*/}
            <View style={styles.userDetailsContainer}>
                <Image
                    source={userImageSource}
                    style={styles.userProfilePic}/>
                <View style={styles.userNameContainer}>
                    <Text style={styles.userName}>{Memory().userObject.name}</Text>
                </View>
                {/*<LoginButton/>*/}
                <View style={styles.horizontalLine}/>
            </View>

            {/*The horizontal scroll list of user*/}
            <ScrollableTabView
                ref={view => this.scrollView = view}
                onChangeTab={this.setListName}
                tabBarTextStyle={styles.listName}
                renderTabBar={this.getTabBar}
                tabBarUnderlineStyle={{height: 0}}>
                {userListView}
            </ScrollableTabView>
        </Image>;
    };


    /**
     * @param value
     * @param key
     * @returns {XML}
     */
    loadMarkers = (value, key) => {
        return <Marker
            key={key}
            markerObject={value}
            refreshDashboard={this.refreshDashboard}
            navigation={this.props.navigation}/>
    };


    regionChanged = () => {
    };


    refreshDashboard = () => this.setState({});


    /**
     * Creates and return the map container on the screen
     * @returns {XML}
     */
    getMainMapView = () => {
        let regionToLoad;

        if (Memory().currentCity) {
            regionToLoad = {
                latitude: parseFloat(Memory().currentCity.cityLatitude),
                longitude: parseFloat(Memory().currentCity.cityLongitude),
                latitudeDelta: parseFloat(Memory().currentCity.zoomingIndex),
                longitudeDelta: parseFloat(Memory().currentCity.zoomingIndex),
            };
        } else {
            regionToLoad = Consts.DEFAULT_REGION;
        }
        return <View style={styles.mainViewContainer}>
            <MapView
                region={regionToLoad}
                style={styles.map}
                onRegionChangeComplete={this.regionChanged}>
                {Memory().markers.map(this.loadMarkers)}
            </MapView>
        </View>
    };


    /**
     * This function loads all the view required for list view and returns them
     * It takes the data from markers variable in state
     */
    loadPlaces = () => Memory().markers.map((value, key) => {
        if (value.number) { // if number is not set, then it means they are searched markers.
            return <View style={styles.listViewPlaceNameContainer} key={key}>
                <View style={styles.placeRankContainerPopUp}>
                    <Text style={styles.placeViewRankPopUp}>{value.number}</Text>
                    <Text style={styles.placeRankTHPopUp}>
                        {Consts.getTHString(value.number)}
                    </Text>
                </View>
                <Image style={styles.listViewPlaceIcon} source={value.icon}/>
                <Text style={styles.listViewPlaceName}>{value.name}</Text>
            </View>;
        }
    });


    getListView = () => {
        return <View style={styles.listViewContainer}>
            <View style={styles.listViewTitleContainer}>
                <Text style={styles.listViewTitle}>Top7 Restaurants, Miami</Text>
            </View>
            <ScrollView
                style={styles.listViewLeaderboradContainer}
                showsVerticalScrollIndicator={false}>
                {this.loadPlaces()}
            </ScrollView>
        </View>
    };


    openFilterScreen = () => this.props.navigation.navigate(Consts.SCREEN_TITLES.FILTER_SCREEN);


    /**
     * Helper function to get tab bar on the top
     * @returns {XML}
     */
    getTopBarView = () => {
        if (!Memory().leaderBoardFilters) {
            console.log("Defaulting the filters...");
            Memory().leaderBoardFilters = Consts.DEFAULT_LEADERBOARD_FILTERS;
        }
        return <View style={styles.topBarContainer}>
            <TouchableHighlight
                underlayColor={"#c5b167"}
                onPress={() => this.sideMenu.openMenu(true)}
                style={styles.tabIconContainer}>
                <Image
                    style={styles.tabIcon}
                    source={require("../icons/menu_black.png")}/>
            </TouchableHighlight>
            <TouchableHighlight
                underlayColor={"#c5b167"}
                onPress={this.openFilterScreen}
                style={styles.cityNameContainer}>
                <Text style={styles.cityName}>{Memory().leaderBoardFilters.city}</Text>
            </TouchableHighlight>
        </View>;
    };


    // filterButtonPressed = () => {
    //     //console.log("Filter")
    // };
    //
    //
    // listViewButtonPressed = () => {
    //     this.setState({
    //         loadMapView: !this.state.loadMapView
    //     })
    // };


    // /**
    //  * As the name says...
    //  * @returns {XML}
    //  */
    // getBottomBarView = () => {
    //     let iconView;
    //     if (this.state.loadMapView) {
    //         iconView = <Image
    //             style={styles.listIcon}
    //             source={require('../images/format-list-bulleted-128.png')}/>
    //
    //     } else {
    //         iconView = <Image
    //             style={styles.listIcon}
    //             source={require('../images/map_icon.png')}/>
    //     }
    //
    //     return <View style={styles.bottomBarContainer}>
    //         <TouchableHighlight style={styles.filterIconContainer}
    //                             underlayColor={'#888888'}
    //                             onPress={this.filterButtonPressed}>
    //             <Image style={styles.filterIcon} source={require('../images/filter-128.png')}/>
    //         </TouchableHighlight>
    //
    //         <TouchableHighlight style={styles.listIconContainer}
    //                             underlayColor={'#888888'}
    //                             onPress={this.listViewButtonPressed}>
    //             {iconView}
    //         </TouchableHighlight>
    //     </View>;
    // };

    getMainView = () => {
        if (this.state.loadMapView) {
            return this.getMainMapView();
        } else {
            return this.getListView();
        }
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
                style={styles.loadingText}>Fetching leaderboard...</Text>
        </View>
    };


    //DOWN BELOW IS THE COMPONENT LIFE CYCLE METHODS
    componentDidMount() {
        this.setLoadingTextViewVisibility(true);
        Backend.getAllCity(() => Backend.getLeaderBoard(() => {
            this.setLoadingTextViewVisibility(false);
            this.setState({});
        }));
    }

    componentDidUpdate() {

        if (Memory().userObject.lists && this.nameContainer) {
            this.nameContainer.setNativeProps({
                text: this.getListName(0)
            });
            this.scrollView.goToPage(0);
        }

        if (Memory().updateLeaderboard) {
            Memory().updateLeaderboard = false;
            this.setLoadingTextViewVisibility(true);
            Backend.getLeaderBoard(() => {
                this.setLoadingTextViewVisibility(false);
                this.setState({});
            })
        }

    }

    render() {
        console.log("Dashboard: Render() called");
        return (
            <SideMenu
                // this.getSideBar does not work
                // Why ?
                // Because menu expects a component not a callback function
                // That component will be returned when YOU CALL that function
                // Thus, you have to call getSideBar()
                //                              - I know how that feels
                menu={this.getSideBar()}
                ref={menu => this.sideMenu = menu}
                openMenuOffset={width * 0.9}
            >
                <View style={styles.container}>
                    <StatusBar hidden/>
                    {this.getTopBarView()}
                    {/*
                     This little function below getMainView returns the map or list view
                     based on the state variable.
                     Why a whole function you ask?
                     Because this react-native will not allow me to write conditional statements
                     in here. SO A FUNCTION.
                     */}
                    {this.getMainView()}


                    {/*{this.getBottomBarView()}*/}
                    {this.getLoadingTextView()}
                </View>
            </SideMenu>
        )
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    drawerContainer: {
        flex: 1,
    },

    userDetailsContainer: {
        paddingLeft: 20,
        //borderWidth: 1
    },

    userProfilePic: {
        borderRadius: 50,
        height: 100,
        width: 100,
        marginTop: 15,
    },

    userNameContainer: {
        backgroundColor: "rgba(0,0,0,0)"
    },

    userName: {
        fontSize: 25,
        marginTop: 10,
        color: "black",
    },

    currentListNameContainer: {
        flexDirection: "row",
        marginLeft: 20,
        height: "auto",
        width: width,
        alignItems: "center",
    },

    currentListName: {
        width: width * 0.71,
        fontSize: 22,
        fontWeight: "bold",
        color: "black",
    },

    horizontalLine: {
        height: 3,
        width: "68%",
        marginTop: 8,
        marginBottom: 8,
        backgroundColor: "black",
    },

    listName: {
        fontSize: 20,
        marginTop: 10,
        marginBottom: 10,
        color: "black",
        fontWeight: "bold",
    },

    listContainer: {
        width: width * 0.90,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "rgba(0,0,0,0)"
    },

    topBarContainer: {
        flexDirection: "row",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#DCC670',
        alignItems: "center",
        zIndex: 15,
    },

    tabIconContainer: {
        height: 56,
        width: 50,
        justifyContent: "center",
        //borderRadius: 1,

    },
    tabIcon: {
        height: 20,
        width: 20,
        alignSelf: "center",
    },


    cityNameContainer: {
        height: 55,
        width: "83%",
        //backgroundColor: "#D2BE67",
        backgroundColor: "rgba(210,190,103,1)",
        justifyContent: "center"
    },

    cityName: {
        paddingLeft: 20,
        fontSize: 20,
        color: "black"
    },

    listViewContainer: {
        position: 'absolute',
        top: 70,
        left: 0,
        right: 0,
        bottom: 60,
        alignItems: 'center',
        backgroundColor: 'white'

    },

    listViewTitleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        width: "100%",
        backgroundColor: '#aaaaaa'
    },

    listViewTitle: {
        fontWeight: 'bold',
        fontSize: 20
    },

    listViewLeaderboradContainer: {
        width: "100%",
        height: "100%"
        //flex: 1,
    },

    listViewPlaceNameContainer: {
        flexDirection: 'row',
        //borderWidth: 1,
        alignItems: 'center',
        height: 60,
        marginBottom: 10,
        padding: 10
    },

    placeRankContainerPopUp: {
        //borderWidth: 1,
        flexDirection: 'row',
        marginLeft: 10
    },
    placeViewRankPopUp: {
        fontSize: 19,
        fontWeight: 'bold',
        //borderWidth: 1,
    },
    placeRankTHPopUp: {
        fontSize: 12,
    },
    listViewPlaceIcon: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginLeft: 10,
        //borderWidth: 1,
    },

    listViewPlaceName: {
        //borderWidth: 1,
        marginLeft: 10,
        paddingRight: 50,
        fontSize: 18,
    },
    mainViewContainer: {
        position: "absolute",
        top: 80,
        left: 0,
        right: 0,
        bottom: -80,
        alignItems: "center",
    },

    map: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    currentLocationContainer: {
        position: 'absolute',
        right: 10,
        bottom: 20,
        height: 40,
        width: 40,
        borderWidth: 1
    },
    currentLocation: {
        width: 40, height: 40
    },

    bottomBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 0,
        width: "100%",
        height: 60,
        backgroundColor: '#999999'
    },
    filterIconContainer: {
        height: 60,
        width: 60,
        justifyContent: 'center',
    },
    filterIcon: {
        height: 30,
        width: 30,
        marginLeft: 6,
    },
    listIconContainer: {
        height: 60,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listIcon: {
        height: 38,
        width: 38,
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
        width: 180,
        height: 30,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderColor: "rgba(0,0,0,0.5)",
        backgroundColor: "rgba(0,0,0,0.5)",
        elevation: 20

    }

});