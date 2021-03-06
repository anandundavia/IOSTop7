import React, {Component} from "react";
import {Dimensions, Image, PanResponder, StyleSheet, Text, View} from "react-native";
import Consts from "../consts/Consts";

const {height, width} = Dimensions.get('window');
export default class PlaceList extends Component {
    constructor(props) {
        super(props);
        if (!props.names) {
            console.warn("Props 'names' is not set. The list will not be displayed");
        }
    }



    render() {
        return (
            <View style={styles.userListsContainer} >
                {this.props.names && this.props.names.map((i, j) => {
                    return <View key={j} style={styles.placeNameContainer}>

                        <View style={styles.rankContainer}>
                            <Text style={styles.rank}>{j + 1}</Text>
                            <Text style={styles.rankTH}>{Consts.getTHString(j + 1)}</Text>
                        </View>

                        <View style={styles.placeNameTextContainer}>
                            <Text style={styles.placeName}>{i.name}</Text>
                        </View>
                        {
                            i.name && <Image
                                style={styles.dragIcon}
                                source={require("../icons/drag_black.png")}
                            />
                        }
                    </View>;
                })}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    userListsContainer: {
        width: width * 0.88,
        flex: 1,
    },
    placeNameContainer: {
        flexDirection: "row",
        height: "12%",
        alignItems: "center",
        paddingLeft: 20,
    },


    rankContainer: {
        height: 30,
        width: 30,
        borderRadius: 15,
        backgroundColor: "black",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        marginLeft: 4,
    },

    rank: {
        marginLeft: 4,
        color: "white",
        fontWeight: "bold",
    },

    rankTH: {
        color: "white",
        fontSize: 6,
        marginTop: -8,
    },

    placeNameTextContainer: {
        backgroundColor: "rgba(0,0,0,0)",
        width: "83%"
    },

    placeName: {
        fontSize: 18,
        marginLeft: 10,
        color: "black"
    },

    dragIcon: {
        position: "absolute",
        right: 10,
    }
});