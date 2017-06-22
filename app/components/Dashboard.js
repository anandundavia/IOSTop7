/**
 * This the screen comes up every time when the user comes back to app after logging in
 */
import React, {Component} from "react";
import {
    Animated,
    Dimensions,
    Image,
    Platform,
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


const {height, width} = Dimensions.get('window');

export default class Dashboard extends Component {

    static navigationOptions = {
        gesturesEnabled: false,
        header: null
    };

    constructor(props) {
        super(props);
        this.sideMenu = null;

        this.viewTop = new Animated.Value(80);
        this.viewLeft = new Animated.Value(0);
        this.viewRight = new Animated.Value(0);
        this.viewBottom = new Animated.Value(-80);

        this.animatedDesign = {
            top: this.viewTop,
            left: this.viewLeft,
            right: this.viewRight,
            bottom: this.viewBottom
        };

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


    swipeLift = () => {
        let currentPageIndex = this.scrollView.state.currentPage;
        if (currentPageIndex !== 0) {
            currentPageIndex--;
            this.scrollView.goToPage(currentPageIndex);
        }
    };


    // editPlaceList = () => {
    //     this.props.navigation.navigate(
    //         Consts.SCREEN_TITLES.PLACE_ADD_POP_UP,
    //         {
    //             markerObject: Memory().userObject.lists[this.scrollView.state.currentPage],
    //             isAdded: true,
    //             onGoBack: () => this.setState({}),
    //         }
    //     )
    // };

    swipeRight = () => {
        let currentPageIndex = this.scrollView.state.currentPage;
        if (Memory().userObject.lists) {
            let totalPages = Memory().userObject.lists.length;
            if (currentPageIndex !== totalPages - 1) {
                currentPageIndex++;
                this.scrollView.goToPage(currentPageIndex);
            }
        }
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
                <Text style={{
                    color: "black",
                    fontSize: 18,
                    fontFamily: Platform.OS === 'ios' ? 'Museo Sans Cyrl' : 'MuseoSansCyrl'
                }}>
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
            <View style={styles.listNavigationContainer}>
                <TouchableHighlight
                    underlayColor={"#c5b167"}
                    onPress={this.swipeLift}
                    style={styles.leftButton}>
                    <Image source={require("../icons/back_black.png")}/>
                </TouchableHighlight>
                {/*<TouchableHighlight*/}
                {/*onPress={this.editPlaceList}*/}
                {/*style={styles.editButton}>*/}
                {/*<Text>Edit</Text>*/}
                {/*</TouchableHighlight>*/}
                <TouchableHighlight
                    underlayColor={"#c5b167"}
                    onPress={this.swipeRight}
                    style={styles.rightButton}>
                    <Image source={require("../icons/back_right.png")}/>
                </TouchableHighlight>
            </View>
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
        // console.log("Me called");
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

        //console.log(regionToLoad);

        return <View
            style={[styles.mainViewContainer]}>
            <MapView
                region={regionToLoad}
                style={styles.map}
                onRegionChangeComplete={this.regionChanged}>
                {/*{Memory().markers.map(this.loadMarkers)}*/}
            </MapView>
        </View>
    };


    /**
     * This function loads all the view required for list view and returns them
     * It takes the data from markers variable in state
     */
    loadPlaces = () => Memory().markers.map((value, key) => {
        if (value.number) { // if number is not set, then it means they are searched markers.

            let rating = Math.floor(value.rating);
            let diff = value.rating - rating;

            let stars = [];

            let index;

            for (index = 0; index < rating; index++) {
                stars.push(<Image style={styles.star} key={index} source={require("../icons/star-fill.png")}/>)
            }

            if (0 < diff && diff < 0.5) {
                stars.push(<Image style={styles.star} key={index} source={require("../icons/star-half.png")}/>);
            } else if (0.5 <= diff) {
                stars.push(<Image style={styles.star} key={index} source={require("../icons/star-fill.png")}/>);
            }

            if (diff === 0) index--;

            while (++index < 5) {
                stars.push(<Image style={styles.star} key={index} source={require("../icons/star.png")}/>)
            }


            let typeIcon;
            let type;
            switch (value.type) {
                case  Consts.PLACE_TYPES.BAR:
                    typeIcon = <Image style={styles.placeDetailsIcon} source={require("../icons/bar_black.png")}/>;
                    type = <Text style={styles.placeDetailsText}>{Consts.PLACE_TYPES.BAR.toUpperCase()}</Text>;
                    break;
                case Consts.PLACE_TYPES.CLUB:
                    typeIcon = <Image style={styles.placeDetailsIcon} source={require("../icons/club_black.png")}/>;
                    type = <Text style={styles.placeDetailsText}>{Consts.PLACE_TYPES.CLUB.toUpperCase()}</Text>;
                    break;
                default :
                    typeIcon =
                        <Image style={styles.placeDetailsIcon} source={require("../icons/restaurant_black.png")}/>;
                    type = <Text style={styles.placeDetailsText}>{Consts.PLACE_TYPES.RESTAURANT.toUpperCase()}</Text>;
                    break;
            }


            let priceLevelIcon;
            let priceLevel;
            let limit = 0;

            if (value.priceLevel <= limit) {
                priceLevelIcon =
                    <Image style={styles.placeDetailsIcon} source={require("../icons/affordable_black.png")}/>;
                priceLevel = <Text style={styles.placeDetailsText}>{Consts.PRICE_LEVEL.AFFORDABLE.toUpperCase()}</Text>
            } else {
                priceLevelIcon =
                    <Image style={styles.placeDetailsIcon} source={require("../icons/expensive_black.png")}/>;
                priceLevel = <Text style={styles.placeDetailsText}>{Consts.PRICE_LEVEL.EXPENSIVE.toUpperCase()}</Text>
            }


            let lastObjectStyle = {};
            if (key === Memory().markers.length - 1) {
                lastObjectStyle = {
                    marginBottom: 150
                }
            }

            return <TouchableHighlight
                key={key}
                onPress={() => {
                    this.props.navigation.navigate(
                        Consts.SCREEN_TITLES.PLACE_DETAILS,
                        {
                            onGoBack: () => this.refreshDashboard(),
                            markerObject: value
                        }
                    );
                }}>
                <View style={[styles.listViewPlaceNameContainer, lastObjectStyle]}>
                    <Image style={styles.listViewPlaceIcon} source={value.icon}/>
                    <View style={styles.listViewPlaceNameAndRankContainer}>
                        <View style={styles.listViewPlaceRankContainer}>
                            <Text style={styles.listViewPlaceRank}>{value.number}</Text>
                            <Text style={styles.listViewPlaceRankTH}>{Consts.getTHString(value.number)}</Text>
                        </View>
                        <View style={styles.listViewPlaceName}>
                            <Text style={styles.listViewPlaceNameText}>{value.name}</Text>
                        </View>
                    </View>
                    <View style={styles.listViewPlaceDetailsContainer}>
                        <View style={styles.listViewRatingsContainer}>
                            {stars}
                        </View>
                        <View style={styles.listViewPlaceDetails}>
                            <View style={styles.listViewPlaceDetailsIconContainer}>
                                {typeIcon}
                                {type}
                            </View>
                            <View style={styles.listViewPlaceDetailsIconContainer}>
                                {priceLevelIcon}
                                {priceLevel}
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        }
    });


    getListView = () => {
        return <Animated.View style={[styles.mainViewContainer, this.animatedDesign]}>
            <ScrollView
                style={styles.listViewLeaderboradContainer}
                showsVerticalScrollIndicator={false}>
                {this.loadPlaces()}
            </ScrollView>
        </Animated.View>
    };


    openFilterScreen = () => this.props.navigation.navigate(
        Consts.SCREEN_TITLES.FILTER_SCREEN,
        {updateLeaderBoard: this.updateLeaderBoard}
    );


    /**
     * Helper function to get tab bar on the top
     * @returns {XML}
     */
    getTopBarView = () => {
        if (!Memory().leaderBoardFilters) {
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


    listViewButtonPressed = () => {
        // let time = 100;
        // Animated.parallel([
        //     Animated.timing(this.viewTop, {
        //         toValue: height / 2,
        //         duration: time
        //     }),
        //     Animated.timing(this.viewBottom, {
        //         toValue: height / 2,
        //         duration: time
        //     }),
        //     Animated.timing(this.viewLeft, {
        //         toValue: width / 2,
        //         duration: time
        //     }),
        //     Animated.timing(this.viewRight, {
        //         toValue: width / 2,
        //         duration: time
        //     })
        // ]).start(() => {
        //     this.setState({
        //         loadMapView: !this.state.loadMapView
        //     });
        //     Animated.parallel([
        //         Animated.timing(this.viewTop, {
        //             toValue: 80,
        //             duration: time
        //         }),
        //         Animated.timing(this.viewBottom, {
        //             toValue: 0,
        //             duration: time
        //         }),
        //         Animated.timing(this.viewLeft, {
        //             toValue: 0,
        //             duration: time
        //         }),
        //         Animated.timing(this.viewRight, {
        //             toValue: 0,
        //             duration: time
        //         })
        //     ]).start(() => {
        //         console.log("Setting....");
        //         if (this.mapView) {
        //             console.log("Okay!!....");
        //             this.mapView.setNativeProps({});
        //         }
        //
        //     });
        // });


        this.setState({
            loadMapView: !this.state.loadMapView
        });
    };


    /**
     * As the name says...
     * @returns {XML}
     */
    getBottomBarView = () => {
        let iconView;
        if (this.state.loadMapView) {
            iconView = <Image source={require('../icons/drag_white.png')}/>

        } else {
            iconView = <Image source={require('../icons/map_white.png')}/>
        }

        return <Image style={styles.bottomBarContainer}
                      source={require("../icons/bottom-bar.png")}>
            <TouchableHighlight style={styles.listIconContainer}
                                underlayColor={'rgba(0,0,0,0.2)'}
                                onPress={this.listViewButtonPressed}>
                {iconView}
            </TouchableHighlight>

            <TouchableHighlight style={styles.filterIconContainer}
                                underlayColor={'rgba(0,0,0,0.2)'}
                                onPress={this.openFilterScreen}>
                <Image source={require('../icons/filter_white.png')}/>
            </TouchableHighlight>
        </Image>;
    };

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
                bottom: isVisible ? 70 : -100,
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


    updateLeaderBoard = () => {
        if (Memory().updateLeaderboard) {
            Memory().updateLeaderboard = false;
            this.setLoadingTextViewVisibility(true);
            Backend.getLeaderBoard(() => {
                this.setLoadingTextViewVisibility(false);
                this.setState({});
            })
        }
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
        this.updateLeaderBoard();
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
                    {this.getBottomBarView()}
                    {this.getLoadingTextView()}
                </View>
            </SideMenu>
        )
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },

    drawerContainer: {
        height: "100%",
        width: "100%"
    },


    listNavigationContainer: {
        justifyContent: "space-between",
        flexDirection: "row",
        height: "8%",
        borderColor: "green"
    },

    leftButton: {
        width: "20%",
        borderRadius: 30,
        marginRight: 30,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 5,
        marginBottom: 5,
        //borderWidth:1
    },


    editButton: {
        flex: 1,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 5,
        //borderWidth:1
    },


    rightButton: {
        width: "20%",
        borderRadius: 30,
        marginLeft: 30,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 5,
        marginBottom: 5,
        //borderWidth:1
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
        fontFamily: Platform.OS === 'ios' ? 'Museo Sans Cyrl' : 'MuseoSansCyrl'
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
        fontFamily: Platform.OS === 'ios' ? 'Museo Sans Cyrl' : 'MuseoSansCyrl'
    },

    horizontalLine: {
        height: 3,
        width: "90%",
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
        color: "black",
        fontFamily: Platform.OS === 'ios' ? 'Museo Sans Cyrl' : 'MuseoSansCyrl'
    },

    // listViewContainer: {
    //     position: "absolute",
    //     // top: 80,
    //     // left: 0,
    //     // right: 0,
    //     // bottom: 0,
    //     alignItems: "center",
    //     backgroundColor: "white",
    // },

    mainViewContainer: {
        position: "absolute",
        alignItems: "center",
        backgroundColor: "white",
    },


    listViewLeaderboradContainer: {
        height: "100%",
        width: "100%",
        paddingLeft: 25,
        paddingRight: 25,
        paddingTop: 15,
        // borderWidth: 1,
        // borderColor: "green"
        //flex: 1,
    },

    listViewPlaceNameContainer: {
        height: (height - 140) / 2,
        width: "100%",
        marginBottom: 15,
        borderRadius: 5,
        // borderWidth: 1,
        // borderColor: "red"
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
        height: "60%",
        width: "100%",
        borderRadius: 5,
        // marginLeft: 10,
        //borderWidth: 1,
    },


    listViewPlaceNameAndRankContainer: {
        height: "20%",
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        marginTop: 3,
        //borderWidth: 1,
    },

    listViewPlaceRankContainer: {
        height: 50,
        width: 50,
        borderRadius: 25,
        backgroundColor: "#313031",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        //borderWidth: 1
    },

    listViewPlaceRank: {
        color: "white",
        fontSize: 22,
        marginLeft: 3,
        fontFamily: Platform.OS === 'ios' ? 'Museo Sans Cyrl' : 'MuseoSansCyrl'
        // borderWidth: 1,
        // borderColor: "white",
    },

    listViewPlaceRankTH: {
        color: "white",
        fontSize: 10,
        marginTop: -10,
        fontFamily: Platform.OS === 'ios' ? 'Museo Sans Cyrl' : 'MuseoSansCyrl'
        // borderWidth: 1,
        // borderColor: "white",
    },


    listViewPlaceName: {
        flex: 1,
        marginLeft: 10,
        marginRight: 5,
        //borderWidth: 1,
    },


    listViewPlaceNameText: {
        fontSize: 20,
        color: "black",
        fontFamily: Platform.OS === 'ios' ? 'Museo Sans Cyrl' : 'MuseoSansCyrl'
    },
    listViewPlaceDetailsContainer: {
        height: "20%",
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        //borderWidth: 1,
    },

    star: {
        height: 20,
        width: 20,
    },

    listViewRatingsContainer: {
        flex: 3,
        height: 20,
        flexDirection: "row",
        //borderWidth: 1,
    },

    listViewPlaceDetails: {
        flex: 2,
        flexDirection: "row",
        //borderWidth: 1,
    },

    listViewPlaceDetailsIconContainer: {
        flex: 1,
        alignItems: "center",
        // borderWidth: 1,
    },

    placeDetailsIcon: {
        height: 35,
        width: 35,
        //flex: 1,
    },

    placeDetailsText: {
        fontSize: 8,
        fontWeight: "bold",
        marginTop: 3,
        color: "black",
        fontFamily: Platform.OS === 'ios' ? 'Museo Sans Cyrl' : 'MuseoSansCyrl'
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
        //borderWidth: 1
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
    },
    filterIconContainer: {
        height: 60,
        width: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: "center",
        //borderWidth: 1,
    },

    listIconContainer: {
        height: 60,
        width: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        //borderWidth: 1,
    },
    // listIcon: {
    //     height: 38,
    //     width: 38,
    // },


    loadingText: {
        color: "white",
        fontFamily: Platform.OS === 'ios' ? 'Museo Sans Cyrl' : 'MuseoSansCyrl'
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