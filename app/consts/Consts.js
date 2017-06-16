import React from "react";
import Splash from "../components/Splash";
import Login from "../components/Login";
import UserConfirmDetails from "../components/UserConfirmDetails";
import Main from "../components/Main";
import Dashboard from "../components/Dashboard";
import PlaceDetails from "../components/PlaceDetails";
import PlaceAddPopUp from "../components/PlaceAddPopUp";
import SearchScreen from "../components/SearchScreen";
import FilterScreen from "../components/FilterScreen";

export default class Consts {

    // static GRAPH_REQ = {
    //     GET_ALL_DETAILS: "getAllDetails",
    //     GET_USER_NAME: "getUserName"
    // };


    static NETWORK_STATUS = {
        NONE: "none",
        WIFI: "wifi",
        CELL: "cell",
        MOBILE:"MOBILE",
        UNKNOWN: "unknown"
    };

    static PLACE_TYPES = {
        RESTAURANT: "restaurant",
        CLUB: "club",
        BAR: "bar",
    };


    static PRICE_LEVEL = {
        AFFORDABLE_LIMIT: 3,
        AFFORDABLE: "affordable",
        EXPENSIVE: "expensive"
    };

    static DEFAULT_CITY = "Miami-Dade County";

    static DEFAULT_LEADERBOARD_FILTERS = {
        types: "restaurant",
        city: Consts.DEFAULT_CITY,
        setting: "both",
        priceLevel: 2,
        ratedBy: "all"
    };

    static DEFAULT_REGION = {
        latitude: 25.766911,
        longitude: -80.201676,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
    };

    static STORAGE_KEYS = {
        ACCESS_TOKEN_KEY: "0",
    };

    static SCREENS = {
        SPLASH: Splash,
        LOG_IN: Login,
        USER_CONFIRM_DETAILS: UserConfirmDetails,
        MAIN: Main,
        DASHBOARD: Dashboard,
        PLACE_DETAILS: PlaceDetails,
        PLACE_ADD_POP_UP: PlaceAddPopUp,
        SEARCH_SCREEN: SearchScreen,
        FILTER_SCREEN: FilterScreen,
    };

    static SCREEN_TITLES = {
        SPLASH: "Splash",
        LOG_IN: "Login",
        USER_CONFIRM_DETAILS: "UserConfirmDetails",
        MAIN: "Main",
        DASHBOARD: "Dashboard",
        PLACE_DETAILS: "PlaceDetails",
        PLACE_ADD_POP_UP: "PlaceAddPopUp",
        SEARCH_SCREEN: "SearchScreen",
        FILTER_SCREEN: "FilterScreen"
    };

    static KEYS = {
        // This is the new key. Belongs to atmayfair@gmail.com
        GOOGLE_API_KEY: "AIzaSyCZSiIcUdMKgD6LZ0P7S7kgOA12U4A31d8",


        // Down below is the old key belongs to abundavia@gmail.com
        // GOOGLE_API_KEY: "AIzaSyBE1gCW9Ai1LJXcEfHal9mu8DYK8QycoCo",
    };

    static API_URLS = {
        GOOGLE_PHOTO_API_BASE: "https://maps.googleapis.com/maps/api/place/photo?",
        GOOGLE_SEARCH_API_BASE: "https://maps.googleapis.com/maps/api/place/details/json?",
        FACEBOOK_URL: {
            parameters: {
                fields: {
                    string: 'email,name,picture.redirect(false).type(large),location,hometown,friends.limit(5000)'
                }
            },
        },

    };


    //staging
    static BACKEND_BASE = "http://top7apistaging.innovify.com/top7backend/";

    //dev
    //static BACKEND_BASE = "http://top7api.innovify.com/top7backend/";

    static  BACKEND = {
        CLIENT_KEY: "d2VidWk6d2VidWlzZWNyZXQ=",

        OAUTH_ACCESS_TOKEN: Consts.BACKEND_BASE + "oauth/token?username=top7backendadmin&password=inno@top7backendadmin&grant_type=password",

        SYNC_USER_INFO: Consts.BACKEND_BASE + "api/syncuserinfo",
        UPDATE_USER_INFO: Consts.BACKEND_BASE + "api/updateuser",
        GET_ALL_CITY: Consts.BACKEND_BASE + "api/getallcity",
        LEADERBOARD: Consts.BACKEND_BASE + "api/leaderBoard",
        FRIENDS_RANK: Consts.BACKEND_BASE + "api/friendsrank",

    };


    /**
     * This little function returns just the 'th' string :P
     *
     */
    static getTHString = (number) => {
        switch (number) {
            case 1:
                return "st";
                break;
            case 2:
                return "nd";
                break;
            case 3:
                return "rd";
                break;
            default:
                return "th";
                break;
        }
    };
}
