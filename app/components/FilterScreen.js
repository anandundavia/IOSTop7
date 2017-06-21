import React, {Component} from "react";
import {StyleSheet, View, Image, Text, ScrollView, TouchableHighlight, Dimensions} from "react-native";
import {Option, OptionList, Select} from "react-native-selectme";
import {ButtonGroup} from "react-native-elements";

import Memory from "../core/Memory";
import Consts from "../consts/Consts";

export default class FilterScreen extends Component {

    static navigationOptions = {
        gesturesEnabled: false,
        header: null
    };

    constructor(props) {
        super(props);

        //For selected city
        this.selectedCity = "";

        // For place type
        let type;

        // For price range
        let priceLevel;

        // For rated by
        let ratedBy;

        // Do we have previously set leaderboard filters?
        if (Memory().leaderBoardFilters) {
            // Yes we do.
            this.selectedCity = Memory().leaderBoardFilters.city;
            let placeType = Memory().leaderBoardFilters.types;
            switch (placeType) {
                case Consts.PLACE_TYPES.CLUB:
                    type = 1;
                    break;
                case Consts.PLACE_TYPES.BAR:
                    type = 2;
                    break;
                default:
                    type = 0;

            }


            let priceL = Memory().leaderBoardFilters.priceLevel;
            if (priceL === 0) {
                priceLevel = 1;
            } else if (priceL === 1) {
                priceLevel = 2;
            } else {
                priceLevel = 0;
            }

        } else {
            // No we don't. Apply the defaults.
            this.selectedCity = Consts.DEFAULT_CITY;
            type = 0;
            priceLevel = 0;
        }

        this.state = {
            selectedType: type,
            selectedPrice: priceLevel,
            selectedRatedBy: 0,
        }
    }


    applyFilters = () => {

        let type;
        switch (this.state.selectedType) {
            case 0:
                type = Consts.PLACE_TYPES.RESTAURANT;
                break;
            case 1:
                type = Consts.PLACE_TYPES.CLUB;
                break;
            case 2:
                type = Consts.PLACE_TYPES.BAR;
                break;
        }


        // let setting;
        // switch (this.state.selectedPlaceSetting) {
        //     case 0:
        //         setting = "romantic";
        //         break;
        //     case 1:
        //         setting = "party";
        //         break;
        // }


        let ratedBy;
        switch (this.state.selectedRatedBy) {
            case 0:
                ratedBy = "all";
                break;
            case 1:
                ratedBy = "experts";
                break;
            case 2:
                ratedBy = "friends";
                break;
        }


        let priceLevel;
        switch (this.state.selectedPrice) {
            case 0:
                priceLevel = 2;
                break;
            case 1:
                priceLevel = 0;
                break;
            case 2:
                priceLevel = 1;
                break;
        }
        Memory().leaderBoardFilters = {
            types: type,
            priceLevel: priceLevel,
            city: this.selectedCity,
            ratedBy: "all",
            setting: "both",
        };
        Memory().updateLeaderboard = true;
        this.props.navigation.state.params.updateLeaderBoard();
        this.props.navigation.goBack();
    };


    getTopBar = () => {
        return <TouchableHighlight
            onPress={ () => {
                Memory().updateLeaderboard = false;
                this.props.navigation.goBack();
            }}
            underlayColor={"#c5b167"}
            style={styles.closeButtonContainer}>
            <Image source={require("../icons/close_black.png")} style={styles.closeButton}/>
        </TouchableHighlight>

    };

    getPlaceView = () => {
        return <View style={styles.filterParameterContainer}>
            <Text style={styles.filterParameterName}>PLACE</Text>
            <Select
                width={250}
                defaultValue={this.selectedCity}
                onSelect={(value) => {
                    this.selectedCity = value;

                    for (let i = 0; i < Memory().allCities.length; i++) {
                        if (Memory().allCities[i].city === value) {
                            Memory().currentCity = Memory().allCities[i];
                            break;
                        }
                    }
                }}
                style={styles.filterOptionsContainer}
                optionListRef={() => this.refs['cityOptionList']}>

                {Memory().allCities.map((value, key) => <Option key={key}
                                                                style={styles.optionStyle}
                                                                styleText={styles.optionTextStyle}>
                        {value.city}
                    </Option>
                )}

            </Select>
        </View>
    };


    getTypeView = () => {
        let types = [
            <Image style={styles.option} source={require("../icons/restaurant_white.png")}/>,
            <Image style={styles.option} source={require("../icons/club_white.png")}/>,
            <Image style={styles.option} source={require("../icons/bar_white.png")}/>,
        ];

        let typeNames = ["RESTAURANT", "CLUB", "BAR"];
        return <View style={[styles.filterParameterContainer, {marginTop: -20}]}>
            <Text style={styles.filterParameterName}>TYPE</Text>
            <ButtonGroup
                selectedIndex={this.state.selectedType}
                buttons={types}
                textStyle={styles.buttonText}
                selectedTextStyle={styles.buttonSelectedText}
                containerStyle={ styles.buttonContainer}
                buttonStyle={styles.buttons}
                selectedBackgroundColor={"black"}
                onPress={(selectedIndex) => this.setState({selectedType: selectedIndex})}
            />
            <View style={styles.typeNameContainer}>{
                typeNames.map((value, key) => {
                    return <View key={key} style={styles.typeName}>
                        <Text style={{color: "white", fontFamily: 'Museo Sans Cyrl'}}>{value}</Text>
                    </View>
                })
            }
            </View>
        </View>
    };


    getPriceView = () => {
        let types = [
            <Image style={styles.option} source={require("../icons/all_white.png")}/>,
            <Image style={styles.option} source={require("../icons/affordable_white.png")}/>,
            <Image style={styles.option} source={require("../icons/expensive_white.png")}/>,
        ];
        let typeNames = ["ALL", "AFFORDABLE", "EXPENSIVE"];
        return <View style={styles.filterParameterContainer}>
            <Text style={styles.filterParameterName}>PRICE RANGE</Text>
            <ButtonGroup
                selectedIndex={this.state.selectedPrice}
                buttons={types}
                textStyle={styles.buttonText}
                selectedTextStyle={styles.buttonSelectedText}
                containerStyle={ styles.buttonContainer}
                selectedBackgroundColor={"black"}
                onPress={(selectedIndex) => this.setState({selectedPrice: selectedIndex})}
            />
            <View style={styles.typeNameContainer}>{
                typeNames.map((value, key) => {
                    return <View key={key} style={styles.typeName}>
                        <Text style={{color: "white", fontFamily: 'Museo Sans Cyrl'}}>{value}</Text>
                    </View>
                })
            }
            </View>
        </View>
    };

    getRatedView = () => {
        let types = [
            <Image style={styles.option} source={require("../icons/all_white.png")}/>,
            <Image style={styles.option} source={require("../icons/experts_white.png")}/>,
            <Image style={styles.option} source={require("../icons/friends_white.png")}/>
        ];
        let typeNames = ["ALL", "EXPERTS", "FRIENDS"];
        return <View style={styles.filterParameterContainer}>
            <Text style={styles.filterParameterName}>RATED BY</Text>
            <ButtonGroup
                selectedIndex={this.state.selectedRatedBy}
                buttons={types}
                textStyle={styles.buttonText}
                selectedTextStyle={styles.buttonSelectedText}
                containerStyle={ styles.buttonContainer}
                selectedBackgroundColor={"black"}
                onPress={(selectedIndex) => this.setState({selectedRatedBy: selectedIndex})}
            />
            <View style={styles.typeNameContainer}>{
                typeNames.map((value, key) => {
                    return <View key={key} style={styles.typeName}>
                        <Text style={{color: "white", fontFamily: 'Museo Sans Cyrl'}}>{value}</Text>
                    </View>
                })
            }
            </View>
        </View>
    };

    // getPlaceSettingView = () => {
    //     let types = ["ROMANTIC", "PARTY"];
    //     return <View style={styles.filterParameterContainer}>
    //         <Text style={styles.filterParameterName}>PLACE SETTING</Text>
    //         <ButtonGroup
    //             selectedIndex={this.state.selectedPlaceSetting}
    //             buttons={types}
    //             textStyle={styles.buttonText}
    //             selectedTextStyle={styles.buttonSelectedText}
    //             containerStyle={ styles.buttonContainer}
    //             selectedBackgroundColor={"black"}
    //             onPress={(selectedIndex) => this.setState({selectedPlaceSetting: selectedIndex})}
    //         />
    //     </View>
    // };

    getApplyButton = () => {
        return <View style={styles.bottomBarContainer}>
            <TouchableHighlight
                onPress={this.applyFilters}
                style={styles.applyButtonContainer}>
                <Text style={styles.applyButton}>APPLY</Text>
            </TouchableHighlight>
        </View>
    };

    render() {
        return <Image style={styles.background} source={require("../icons/background.png")}>
            {this.getTopBar()}
            {this.getPlaceView()}
            {this.getTypeView()}
            {this.getPriceView()}
            {this.getRatedView()}
            {/*{this.getPlaceSettingView()}*/}
            {this.getApplyButton()}
            <OptionList overlayStyles={{
                top: 80,
                left: 20,
                width: 0,
                height: "auto",
                alignItems: "flex-start",
            }} ref="cityOptionList"/>
        </Image>

    }
}


const styles = StyleSheet.create({

    background: {
        flex: 1,
        height: null,
        width: null,
        resizeMode: "cover",
        //justifyContent: "center",
        paddingRight: 20,
        paddingLeft: 20,
    },

    closeButtonContainer: {
        height: 40,
        width: 40,
        marginLeft: -15,
        borderRadius: 20,
        marginTop: 5,
        //marginTop: -35,
        alignItems: "center",
        justifyContent: "center",
        //borderWidth: 1
    },

    filterParameterContainer: {
        height: 100,
        width: "100%",
        backgroundColor: "rgba(0,0,0,0)",
        marginBottom: 30,
        //borderWidth: 1
    },

    filterParameterName: {
        color: "white",
        //fontWeight: "bold",
        fontSize: 17,
        fontFamily: 'Museo Sans Cyrl'
    },


    filterOptionsContainer: {
        height: 60,
        width: "100%",
        borderColor: "#DCC670",
        backgroundColor: "#DCC670",
        justifyContent: "center"
        //marginTop: 7,
        //borderColor:"red"
    },

    optionStyle: {
        height: 40,
        width: 300,
        backgroundColor: "black",
    },

    optionTextStyle: {
        height: 20,
        fontSize: 18,
        color: "white",
        width: "100%",

    },

    buttonContainer: {
        height: 50,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DCC670",
        borderColor: "#DCC670",
    },


    option: {
        marginTop: 10,
        height: 35,
        width: 35
    },


    typeNameContainer: {
        width: "100%",
        justifyContent: "space-between",
        flexDirection: "row",
        //borderWidth:1,

    },

    typeName: {
        flex: 1,
        alignItems: "center"
    },

    buttons: {
        justifyContent: "center",
        alignItems: "center",
    },

    buttonText: {
        paddingTop: 14,
        color: "black"
    },

    buttonSelectedText: {
        color: "white",
        fontWeight: "bold",
        paddingTop: 14,
    },

    bottomBarContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 100,
        alignItems: "center",
        justifyContent: "center",
        //borderWidth: 1
    },

    applyButtonContainer: {
        height: 60,
        width: 250,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "black"
    },

    applyButton: {
        color: "white",
        // fontWeight:"bold",
        fontSize: 18,
        fontFamily: 'Museo Sans Cyrl'
    },


});